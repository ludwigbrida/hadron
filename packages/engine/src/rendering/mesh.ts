import { Mat4 } from "../math/mat4.ts";
import { Node } from "../scene/node.ts";
import type { Geometry } from "./geometry.ts";
import type { Material } from "./material.ts";

export class Mesh extends Node {
  private constructor(
    readonly geometry: Geometry,
    readonly material: Material,
    readonly transformBuffer: GPUBuffer,
    readonly bindGroup: GPUBindGroup,
  ) {
    super();
  }

  static create(
    device: GPUDevice,
    bindGroupLayout: GPUBindGroupLayout,
    geometry: Geometry,
    material: Material,
  ): Mesh {
    const transformMatrix = new Mat4();
    const transformBuffer = device.createBuffer({
      size: transformMatrix.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(transformBuffer, 0, transformMatrix);

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
            buffer: material.baseColorBuffer,
          },
        },
      ],
    });

    return new Mesh(geometry, material, transformBuffer, bindGroup);
  }

  dispose(): void {
    this.transformBuffer.destroy();
  }
}
