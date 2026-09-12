import "server-only";

import { isIP } from "node:net";
import { tool } from "ai";
import { z } from "zod";

const REQUEST_TIMEOUT_MS = 8_000;
const MAX_REDIRECTS = 3;
const MAX_HTML_BYTES = 1_000_000;

const metadataOutputSchema = z.object({
  url: z.url(),
  hostname: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  siteName: z.string().nullable(),
});

function isPrivateIpv4(hostname: string) {
  const octets = hostname.split(".").map(Number);

  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet))) {
    return true;
  }

  const [first, second] = octets;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    first >= 224
  );
}

function isPrivateIpv6(hostname: string) {
  const normalized = hostname.toLowerCase();

  if (normalized === "::" || normalized === "::1") {
    return true;
  }

  if (normalized.startsWith("::ffff:")) {
    const mappedIpv4 = normalized.slice("::ffff:".length);
    return isIP(mappedIpv4) !== 4 || isPrivateIpv4(mappedIpv4);
  }

  const firstSegment = normalized.split(":", 1)[0];
  const firstValue = Number.parseInt(firstSegment, 16);

  return (
    (firstValue >= 0xfc00 && firstValue <= 0xfdff) ||
    (firstValue >= 0xfe80 && firstValue <= 0xfebf)
  );
}

function validatePublicUrl(value: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error("The supplied URL is invalid.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  }

  if (url.username || url.password) {
    throw new Error("URLs containing credentials are not supported.");
  }

  const hostname = url.hostname
    .replace(/^\[|\]$/g, "")
    .replace(/\.$/, "")
    .toLowerCase();
  const addressFamily = isIP(hostname);
  const isObviousLocalHostname =
    hostname === "localhost" ||
    !hostname.includes(".") ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".lan") ||
    hostname.endsWith(".internal");

  if (
    isObviousLocalHostname ||
    (addressFamily === 4 && isPrivateIpv4(hostname)) ||
    (addressFamily === 6 && isPrivateIpv6(hostname))
  ) {
    throw new Error("Local and private-network URLs are not supported.");
  }

  return url;
}

async function fetchHtml(startUrl: URL, signal: AbortSignal) {
  let currentUrl = startUrl;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const response = await fetch(currentUrl, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "Lynkroam-Metadata/1.0",
      },
      redirect: "manual",
      signal,
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");

      await response.body?.cancel();

      if (!location) {
        throw new Error("The webpage returned an invalid redirect.");
      }

      if (redirectCount === MAX_REDIRECTS) {
        throw new Error("The webpage redirected too many times.");
      }

      currentUrl = validatePublicUrl(new URL(location, currentUrl).href);
      continue;
    }

    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(`The webpage returned HTTP ${response.status}.`);
    }

    const contentType = response.headers.get("content-type")?.toLowerCase();

    if (
      !contentType ||
      (!contentType.includes("text/html") &&
        !contentType.includes("application/xhtml+xml"))
    ) {
      await response.body?.cancel();
      throw new Error("The URL did not return an HTML page.");
    }

    const declaredLength = Number(response.headers.get("content-length"));

    if (Number.isFinite(declaredLength) && declaredLength > MAX_HTML_BYTES) {
      await response.body?.cancel();
      throw new Error("The webpage is too large to inspect safely.");
    }

    if (!response.body) {
      throw new Error("The webpage returned no readable content.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let byteCount = 0;
    let html = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        html += decoder.decode();
        break;
      }

      byteCount += value.byteLength;

      if (byteCount > MAX_HTML_BYTES) {
        await reader.cancel();
        throw new Error("The webpage is too large to inspect safely.");
      }

      html += decoder.decode(value, { stream: true });
    }

    return { html, url: currentUrl };
  }

  throw new Error("The webpage redirected too many times.");
}

function decodeHtml(value: string) {
  const entities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    quot: '"',
  };

  return value
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/&#x([\da-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&([a-z]+);/gi, (entity, name: string) =>
      entities[name.toLowerCase()] ?? entity,
    )
    .replace(/\s+/g, " ")
    .trim();
}

function readTagAttributes(tag: string) {
  const attributes = new Map<string, string>();
  const pattern = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;

  for (const match of tag.matchAll(pattern)) {
    attributes.set(
      match[1].toLowerCase(),
      decodeHtml(match[2] ?? match[3] ?? match[4] ?? ""),
    );
  }

  return attributes;
}

function readMeta(html: string, keys: string[]) {
  const normalizedKeys = new Set(keys.map((key) => key.toLowerCase()));

  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = readTagAttributes(match[0]);
    const name = (attributes.get("property") ?? attributes.get("name"))?.toLowerCase();
    const content = attributes.get("content");

    if (name && content && normalizedKeys.has(name)) {
      return content;
    }
  }

  return null;
}

function readTitle(html: string) {
  const match = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  return match ? decodeHtml(match[1]) : null;
}

function limit(value: string | null, length: number) {
  return value ? value.slice(0, length) : null;
}

export const fetchUrlMetadata = tool({
  description:
    "Inspect page-level metadata from a public HTTP or HTTPS webpage URL supplied by the user.",
  inputSchema: z.object({
    url: z
      .url()
      .describe("The complete public HTTP or HTTPS webpage URL to inspect."),
  }),
  outputSchema: metadataOutputSchema,
  async execute({ url }, { abortSignal }) {
    const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
    const signal = abortSignal
      ? AbortSignal.any([abortSignal, timeoutSignal])
      : timeoutSignal;

    try {
      const result = await fetchHtml(validatePublicUrl(url), signal);
      const title =
        readMeta(result.html, ["og:title", "twitter:title"]) ??
        readTitle(result.html);

      return {
        url: result.url.href,
        hostname: result.url.hostname,
        title: limit(title, 500),
        description: limit(
          readMeta(result.html, [
            "description",
            "og:description",
            "twitter:description",
          ]),
          1_000,
        ),
        siteName: limit(readMeta(result.html, ["og:site_name"]), 200),
      };
    } catch (error) {
      if (timeoutSignal.aborted) {
        throw new Error("The webpage metadata request timed out.");
      }

      throw error;
    }
  },
});

export const researchAssistantTools = {
  fetchUrlMetadata,
};
