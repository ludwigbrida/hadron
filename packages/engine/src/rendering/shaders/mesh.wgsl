@group(0) @binding(0) var<uniform> viewProjection: mat4x4f;
@group(0) @binding(1) var<uniform> lightDirection: vec3f;
@group(0) @binding(2) var<uniform> ambientLight: vec4f;
@group(1) @binding(0) var<uniform> transform: mat4x4f;
@group(1) @binding(1) var<uniform> color: vec4f;

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) normal: vec3f,
}

@vertex
fn vertexMain(@location(0) position: vec3f, @location(1) normal: vec3f) -> VertexOutput {
  var output: VertexOutput;
  output.position = viewProjection * transform * vec4f(position, 1.0);
  output.normal = normalize((transform * vec4f(normal, 0.0)).xyz);
  return output;
}

@fragment
fn fragmentMain(@location(0) normal: vec3f) -> @location(0) vec4f {
  let directionalLight = max(dot(normal, lightDirection), 0.0);
  return vec4f(color.rgb * (ambientLight.rgb + vec3f(directionalLight)), color.a);
}
