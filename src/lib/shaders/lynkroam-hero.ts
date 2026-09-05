export const LYNKROAM_HERO_VERTEX_SHADER = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const LYNKROAM_HERO_FRAGMENT_SHADER = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float routeLine(vec2 point, float offset, float pace) {
  float path = sin(point.x * 2.4 + u_time * pace + offset) * 0.22;
  path += sin(point.x * 5.1 - u_time * 0.035 + offset) * 0.045;
  return exp(-abs(point.y - path) * 18.0);
}

void main() {
  // Center the coordinates and correct their shape for the canvas aspect ratio.
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) /
    min(u_resolution.x, u_resolution.y);

  // Move the route field slowly so it reads as a calm research flow.
  vec2 movingUv = uv;
  movingUv.x += sin(u_time * 0.07) * 0.05;

  // Map the pointer into the same centered space and keep its influence gentle.
  vec2 pointer = (u_mouse - 0.5 * u_resolution.xy) /
    min(u_resolution.x, u_resolution.y);
  float pointerGlow = exp(-length(uv - pointer) * 2.8);
  movingUv.y += pointer.x * 0.035 * pointerGlow;

  // Layer three soft paths to suggest routes and neighboring map contours.
  float routes = routeLine(movingUv, 0.0, 0.09);
  routes += routeLine(movingUv + vec2(0.18, 0.38), 1.8, -0.055) * 0.72;
  routes += routeLine(movingUv - vec2(0.12, 0.42), 3.7, 0.045) * 0.55;
  routes = clamp(routes, 0.0, 1.0);

  // Blend deep teal, cream, and terracotta into a restrained background field.
  vec3 deepTeal = vec3(0.043, 0.373, 0.349);
  vec3 cream = vec3(0.965, 0.949, 0.918);
  vec3 terracotta = vec3(0.678, 0.357, 0.259);
  float verticalBlend = smoothstep(-0.9, 0.9, uv.y);
  vec3 color = mix(deepTeal, cream, verticalBlend * 0.82);
  color = mix(color, terracotta, routes * (0.22 + pointerGlow * 0.08));

  // Add very light screen-space grain to prevent perfectly flat color bands.
  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  color += (grain - 0.5) * 0.012;

  gl_FragColor = vec4(color, 1.0);
}
`;
