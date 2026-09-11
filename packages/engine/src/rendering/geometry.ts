export interface GeometryData {
  positions: Float32Array;
  normals: Float32Array;
  texCoords: Float32Array;
  indices: Uint16Array;
}

export class Geometry {
  private constructor(
    readonly vertexBuffer: GPUBuffer,
    readonly normalBuffer: GPUBuffer,
    readonly texCoordBuffer: GPUBuffer,
    readonly indexBuffer: GPUBuffer,
    readonly indexCount: number,
  ) {}

  static create(device: GPUDevice, data: GeometryData): Geometry {
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

    const texCoordBuffer = device.createBuffer({
      size: data.texCoords.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(texCoordBuffer, 0, data.texCoords);

    const paddedIndices = new Uint16Array(data.indices.length + (data.indices.length % 2));

    paddedIndices.set(data.indices);

    const indexBuffer = device.createBuffer({
      size: paddedIndices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(indexBuffer, 0, paddedIndices);

    return new Geometry(
      vertexBuffer,
      normalBuffer,
      texCoordBuffer,
      indexBuffer,
      data.indices.length,
    );
  }

  dispose(): void {
    this.vertexBuffer.destroy();
    this.normalBuffer.destroy();
    this.texCoordBuffer.destroy();
    this.indexBuffer.destroy();
  }
}
