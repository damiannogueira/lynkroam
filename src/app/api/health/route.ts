import "server-only";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    {
      app: "Lynkroam",
      status: "ok",
      environment:
        process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
