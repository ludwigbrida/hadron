import { Color } from "./color.ts";
import type { Geometry } from "./geometry.ts";
import { Mat4 } from "./math/mat4.ts";

const identityTransform = new Mat4();
const defaultColor = new Color(1, 1, 1);

export class Mesh {
  private constructor(
    private readonly device: GPUDevice,
    readonly geometry: Geometry,
    readonly transformBuffer: GPUBuffer,
    readonly colorBuffer: GPUBuffer,
    readonly bindGroup: GPUBindGroup,
  ) {}

  static create(device: GPUDevice, bindGroupLayout: GPUBindGroupLayout, geometry: Geometry): Mesh {
    const transformBuffer = device.createBuffer({
      size: identityTransform.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(transformBuffer, 0, identityTransform);

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

    return new Mesh(device, geometry, transformBuffer, colorBuffer, bindGroup);
  }

  setTransform(transform: Readonly<Mat4>): void {
    // TODO: handle with inverse-transpose normal matrix for non-uniform scales
    this.device.queue.writeBuffer(this.transformBuffer, 0, transform);
  }

  setColor(color: Readonly<Color>): void {
    this.device.queue.writeBuffer(this.colorBuffer, 0, color);
  }

  dispose(): void {
    this.transformBuffer.destroy();
    this.colorBuffer.destroy();
  }
}
