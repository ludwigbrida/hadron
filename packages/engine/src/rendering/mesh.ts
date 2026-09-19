import { Matrix4 } from "../math/matrix4.ts";
import { Component } from "../scene/component.ts";
import type { Geometry } from "./geometry.ts";
import type { Material } from "./material.ts";

export class Mesh extends Component {
  /** @internal */
  public constructor(
    readonly geometry: Geometry,
    readonly material: Material,
    readonly transformBuffer: GPUBuffer,
    readonly normalMatrix: Matrix4,
    readonly normalMatrixBuffer: GPUBuffer,
    readonly bindGroup: GPUBindGroup,
  ) {
    super();
  }

  static create(
    device: GPUDevice,
    transformBindGroupLayout: GPUBindGroupLayout,
    geometry: Geometry,
    material: Material,
  ): Mesh {
    const transformMatrix = new Matrix4();
    const transformBuffer = device.createBuffer({
      size: transformMatrix.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(transformBuffer, 0, transformMatrix);

    const normalMatrix = new Matrix4();
    const normalMatrixBuffer = device.createBuffer({
      size: normalMatrix.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(normalMatrixBuffer, 0, normalMatrix);

    const bindGroup = device.createBindGroup({
      layout: transformBindGroupLayout,
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
            buffer: normalMatrixBuffer,
          },
        },
      ],
    });

    return new Mesh(
      geometry,
      material,
      transformBuffer,
      normalMatrix,
      normalMatrixBuffer,
      bindGroup,
    );
  }

  dispose(): void {
    this.transformBuffer.destroy();
    this.normalMatrixBuffer.destroy();
  }
}
