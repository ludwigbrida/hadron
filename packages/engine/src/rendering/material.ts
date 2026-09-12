import type { Color } from "./color.ts";
import type { Texture } from "./texture.ts";

export interface MaterialOptions {
  readonly texture?: Texture;
  readonly unlit?: boolean;
}

export class Material {
  private constructor(
    private readonly device: GPUDevice,
    readonly uniformBuffer: GPUBuffer,
    readonly bindGroup: GPUBindGroup,
  ) {}

  static create(
    device: GPUDevice,
    bindGroupLayout: GPUBindGroupLayout,
    baseColor: Readonly<Color>,
    texture: Texture,
    unlit: boolean,
  ): Material {
    const uniformData = new Float32Array(8);

    uniformData.set(baseColor);
    uniformData[4] = unlit ? 1 : 0;

    const uniformBuffer = device.createBuffer({
      size: uniformData.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(uniformBuffer, 0, uniformData);

    const bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: uniformBuffer,
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

    return new Material(device, uniformBuffer, bindGroup);
  }

  setBaseColor(color: Readonly<Color>): void {
    this.device.queue.writeBuffer(this.uniformBuffer, 0, color);
  }

  dispose(): void {
    this.uniformBuffer.destroy();
  }
}
