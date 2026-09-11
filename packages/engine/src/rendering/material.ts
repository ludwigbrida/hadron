import type { Color } from "./color.ts";

export class Material {
  private constructor(
    private readonly device: GPUDevice,
    readonly baseColorBuffer: GPUBuffer,
    readonly bindGroup: GPUBindGroup,
  ) {}

  static create(
    device: GPUDevice,
    bindGroupLayout: GPUBindGroupLayout,
    baseColor: Readonly<Color>,
  ): Material {
    const baseColorBuffer = device.createBuffer({
      size: baseColor.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(baseColorBuffer, 0, baseColor);

    const bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: baseColorBuffer,
          },
        },
      ],
    });

    return new Material(device, baseColorBuffer, bindGroup);
  }

  setBaseColor(color: Readonly<Color>): void {
    this.device.queue.writeBuffer(this.baseColorBuffer, 0, color);
  }

  dispose(): void {
    this.baseColorBuffer.destroy();
  }
}
