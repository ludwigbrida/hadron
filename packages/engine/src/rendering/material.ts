import type { Color } from "./color.ts";

export class Material {
  private constructor(
    private readonly device: GPUDevice,
    readonly baseColorBuffer: GPUBuffer,
  ) {}

  static create(device: GPUDevice, baseColor: Readonly<Color>): Material {
    const baseColorBuffer = device.createBuffer({
      size: baseColor.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(baseColorBuffer, 0, baseColor);

    return new Material(device, baseColorBuffer);
  }

  setBaseColor(color: Readonly<Color>): void {
    this.device.queue.writeBuffer(this.baseColorBuffer, 0, color);
  }

  dispose(): void {
    this.baseColorBuffer.destroy();
  }
}
