export interface MeshData {
  positions: Float32Array;
  indices: Uint16Array;
}

export class Mesh {
  private constructor(
    readonly vertexBuffer: GPUBuffer,
    readonly indexBuffer: GPUBuffer,
    readonly indexCount: number,
  ) {}

  static create(device: GPUDevice, data: MeshData): Mesh {
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

    return new Mesh(vertexBuffer, indexBuffer, data.indices.length);
  }

  dispose(): void {
    this.vertexBuffer.destroy();
    this.indexBuffer.destroy();
  }
}
