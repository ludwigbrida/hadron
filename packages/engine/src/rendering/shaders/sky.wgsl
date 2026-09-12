@group(0) @binding(0) var<uniform> inverseViewProjection: mat4x4f;
@group(0) @binding(1) var skySampler: sampler;
@group(0) @binding(2) var skyTexture: texture_cube<f32>;

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) clipPosition: vec2f,
}

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  let positions = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));

  var output: VertexOutput;
  output.clipPosition = positions[vertexIndex];
  output.position = vec4f(output.clipPosition, 0.0, 1.0);
  return output;
}

@fragment
fn fragmentMain(@location(0) clipPosition: vec2f) -> @location(0) vec4f {
  let near = inverseViewProjection * vec4f(clipPosition, 0.0, 1.0);
  let far = inverseViewProjection * vec4f(clipPosition, 1.0, 1.0);
  let direction = normalize(far.xyz / far.w - near.xyz / near.w);
  return textureSample(skyTexture, skySampler, direction);
}
