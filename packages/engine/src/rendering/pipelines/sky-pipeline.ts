import { Mat4 } from "../../math/mat4.ts";
import type { CubeTexture } from "../cube-texture.ts";
import skyShader from "../shaders/sky.wgsl?raw";

export class SkyPipeline {
  private readonly inverseViewProjection = new Mat4();
  private texture: CubeTexture | undefined;
  private bindGroup: GPUBindGroup | undefined;

  private constructor(
    private readonly device: GPUDevice,
    private readonly pipeline: GPURenderPipeline,
    private readonly inverseViewProjectionBuffer: GPUBuffer,
  ) {}

  static async create(device: GPUDevice, format: GPUTextureFormat): Promise<SkyPipeline> {
    const shaderModule = device.createShaderModule({
      code: skyShader,
    });

    const pipeline = await device.createRenderPipelineAsync({
      layout: "auto",
      vertex: {
        module: shaderModule,
        entryPoint: "vertexMain",
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
        depthWriteEnabled: false,
        depthCompare: "always",
      },
    });

    const inverseViewProjectionBuffer = device.createBuffer({
      size: Mat4.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    return new SkyPipeline(device, pipeline, inverseViewProjectionBuffer);
  }

  render(
    pass: GPURenderPassEncoder,
    texture: CubeTexture | undefined,
    viewProjection: Readonly<Mat4>,
  ): void {
    if (!texture) {
      return;
    }

    this.inverseViewProjection.setInverse(viewProjection);

    this.device.queue.writeBuffer(this.inverseViewProjectionBuffer, 0, this.inverseViewProjection);

    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.getBindGroup(texture));
    pass.draw(3);
  }

  dispose(): void {
    this.inverseViewProjectionBuffer.destroy();
  }

  private getBindGroup(texture: CubeTexture): GPUBindGroup {
    let bindGroup = this.bindGroup;

    if (this.texture !== texture || !bindGroup) {
      bindGroup = this.device.createBindGroup({
        layout: this.pipeline.getBindGroupLayout(0),
        entries: [
          {
            binding: 0,
            resource: {
              buffer: this.inverseViewProjectionBuffer,
            },
          },
          {
            binding: 1,
            resource: texture.sampler,
          },
          {
            binding: 2,
            resource: texture.view,
          },
        ],
      });

      this.texture = texture;
      this.bindGroup = bindGroup;
    }

    return bindGroup;
  }
}
