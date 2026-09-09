import { Mat4 } from "./math/mat4.ts";

export interface MeshData {
  positions: Float32Array;
  indices: Uint16Array;
}

const identityTransform = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

export class Mesh {
  private constructor(
    private readonly device: GPUDevice,
    readonly vertexBuffer: GPUBuffer,
    readonly indexBuffer: GPUBuffer,
    readonly indexCount: number,
    readonly transformBuffer: GPUBuffer,
    readonly transformBindGroup: GPUBindGroup,
  ) {}

  static create(device: GPUDevice, transformLayout: GPUBindGroupLayout, data: MeshData): Mesh {
    const vertexBuffer = device.createBuffer({
      size: data.positions.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(vertexBuffer, 0, data.positions);

    const paddedIndices = new Uint16Array(data.indices.length + (data.indices.length % 2));

    paddedIndices.set(data.indices);

    const indexBuffer = device.createBuffer({
      size: paddedIndices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(indexBuffer, 0, paddedIndices);

    const transformBuffer = device.createBuffer({
      size: identityTransform.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(transformBuffer, 0, identityTransform);

    const transformBindGroup = device.createBindGroup({
      layout: transformLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: transformBuffer,
          },
        },
      ],
    });

    return new Mesh(
      device,
      vertexBuffer,
      indexBuffer,
      data.indices.length,
      transformBuffer,
      transformBindGroup,
    );
  }

  setTransform(transform: Readonly<Mat4>): void {
    this.device.queue.writeBuffer(this.transformBuffer, 0, transform.values);
  }

  dispose(): void {
    this.vertexBuffer.destroy();
    this.indexBuffer.destroy();
    this.transformBuffer.destroy();
  }
}
