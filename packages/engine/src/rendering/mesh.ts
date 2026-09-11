import { Mat4 } from "../math/mat4.ts";
import { Node } from "../scene/node.ts";
import { Color } from "./color.ts";
import type { Geometry } from "./geometry.ts";

const defaultColor = new Color(1, 1, 1);

export class Mesh extends Node {
  private constructor(
    private readonly device: GPUDevice,
    readonly geometry: Geometry,
    readonly transformBuffer: GPUBuffer,
    readonly colorBuffer: GPUBuffer,
    readonly bindGroup: GPUBindGroup,
  ) {
    super();
  }

  static create(device: GPUDevice, bindGroupLayout: GPUBindGroupLayout, geometry: Geometry): Mesh {
    const transformMatrix = new Mat4();
    const transformBuffer = device.createBuffer({
      size: transformMatrix.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(transformBuffer, 0, transformMatrix);

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

  setColor(color: Readonly<Color>): void {
    this.device.queue.writeBuffer(this.colorBuffer, 0, color);
  }

  dispose(): void {
    this.transformBuffer.destroy();
    this.colorBuffer.destroy();
  }
}
