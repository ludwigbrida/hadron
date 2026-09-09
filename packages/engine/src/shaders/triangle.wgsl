@group(0) @binding(0) var<uniform> transform: mat4x4f;

@vertex
fn vertexMain(@location(0) position: vec3f) -> @builtin(position) vec4f {
  return transform * vec4f(position, 1.0);
}

@fragment
fn fragmentMain() -> @location(0) vec4f {
  return vec4f(0.2, 0.7, 1.0, 1.0);
}
