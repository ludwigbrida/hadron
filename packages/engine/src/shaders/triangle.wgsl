@group(0) @binding(0) var<uniform> viewProjection: mat4x4f;
@group(1) @binding(0) var<uniform> transform: mat4x4f;
@group(1) @binding(1) var<uniform> color: vec4f;

@vertex
fn vertexMain(@location(0) position: vec3f) -> @builtin(position) vec4f {
  return viewProjection * transform * vec4f(position, 1.0);
}

@fragment
fn fragmentMain() -> @location(0) vec4f {
  return color;
}
