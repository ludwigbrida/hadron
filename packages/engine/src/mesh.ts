import { Mat4 } from "./math/mat4.ts";

export interface MeshData {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint16Array;
}

const identityTransform = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
const defaultColor = new Float32Array([1, 1, 1, 1]);

export class Mesh {
  private constructor(
    private readonly device: GPUDevice,
    readonly vertexBuffer: GPUBuffer,
    readonly normalBuffer: GPUBuffer,
    readonly indexBuffer: GPUBuffer,
    readonly indexCount: number,
    readonly transformBuffer: GPUBuffer,
    readonly colorBuffer: GPUBuffer,
    readonly bindGroup: GPUBindGroup,
  ) {}

  static create(device: GPUDevice, bindGroupLayout: GPUBindGroupLayout, data: MeshData): Mesh {
    const vertexBuffer = device.createBuffer({
      size: data.positions.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(vertexBuffer, 0, data.positions);

    const normalBuffer = device.createBuffer({
      size: data.normals.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(normalBuffer, 0, data.normals);

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

    return new Mesh(
      device,
      vertexBuffer,
      normalBuffer,
      indexBuffer,
      data.indices.length,
      transformBuffer,
      colorBuffer,
      bindGroup,
    );
  }

  setTransform(transform: Readonly<Mat4>): void {
    this.device.queue.writeBuffer(this.transformBuffer, 0, transform);
  }

  setColor(color: Float32Array): void {
    this.device.queue.writeBuffer(this.colorBuffer, 0, color);
  }

  dispose(): void {
    this.vertexBuffer.destroy();
    this.normalBuffer.destroy();
    this.indexBuffer.destroy();
    this.transformBuffer.destroy();
    this.colorBuffer.destroy();
  }
}
