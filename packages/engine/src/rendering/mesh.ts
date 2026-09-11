import { Transform } from "../scene/transform.ts";
import { Color } from "./color.ts";
import type { Geometry } from "./geometry.ts";

const defaultColor = new Color(1, 1, 1);

export class Mesh {
  private constructor(
    private readonly device: GPUDevice,
    readonly geometry: Geometry,
    readonly transform: Transform,
    readonly transformBuffer: GPUBuffer,
    readonly colorBuffer: GPUBuffer,
    readonly bindGroup: GPUBindGroup,
  ) {}

  static create(device: GPUDevice, bindGroupLayout: GPUBindGroupLayout, geometry: Geometry): Mesh {
    const transform = new Transform();
    const transformBuffer = device.createBuffer({
      size: transform.getMatrix().byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(transformBuffer, 0, transform.getMatrix());

    const colorBuffer = device.createBuffer({
      size: defaultColor.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(colorBuffer, 0, defaultColor);

    const bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: transformBuffer,
          },
        },
        {
          binding: 1,
          resource: {
            buffer: colorBuffer,
          },
        },
      ],
    });

    return new Mesh(device, geometry, transform, transformBuffer, colorBuffer, bindGroup);
  }

  setColor(color: Readonly<Color>): void {
    this.device.queue.writeBuffer(this.colorBuffer, 0, color);
  }

  dispose(): void {
    this.transformBuffer.destroy();
    this.colorBuffer.destroy();
  }
}
