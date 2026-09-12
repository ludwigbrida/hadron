import meshShader from "../shaders/mesh.wgsl?raw";

export function createMeshPipeline(
  device: GPUDevice,
  format: GPUTextureFormat,
): Promise<GPURenderPipeline> {
  const shaderModule = device.createShaderModule({
    code: meshShader,
  });

  return device.createRenderPipelineAsync({
    layout: "auto",
    vertex: {
      module: shaderModule,
      entryPoint: "vertexMain",
      buffers: [
        {
          arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
          attributes: [
            {
              format: "float32x3",
              offset: 0,
              shaderLocation: 0,
            },
          ],
        },
        {
          arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
          attributes: [
            {
              format: "float32x3",
              offset: 0,
              shaderLocation: 1,
            },
          ],
        },
        {
          arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
          attributes: [
            {
              format: "float32x2",
              offset: 0,
              shaderLocation: 2,
            },
          ],
        },
      ],
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fragmentMain",
      targets: [
        {
          format,
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
    },
    depthStencil: {
      format: "depth24plus",
      depthWriteEnabled: true,
      depthCompare: "less",
    },
  });
}
