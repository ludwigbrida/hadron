export interface CubeTextureFaces {
  readonly positiveX: ImageBitmap;
  readonly negativeX: ImageBitmap;
  readonly positiveY: ImageBitmap;
  readonly negativeY: ImageBitmap;
  readonly positiveZ: ImageBitmap;
  readonly negativeZ: ImageBitmap;
}

export class CubeTexture {
  private constructor(
    private readonly texture: GPUTexture,
    readonly view: GPUTextureView,
    readonly sampler: GPUSampler,
  ) {}

  static create(device: GPUDevice, faces: CubeTextureFaces): CubeTexture {
    const images = [
      faces.positiveX,
      faces.negativeX,
      faces.positiveY,
      faces.negativeY,
      faces.positiveZ,
      faces.negativeZ,
    ];
    const firstImage = faces.positiveX;

    if (
      images.some((image) => image.width !== firstImage.width || image.height !== firstImage.height)
    ) {
      throw new Error("Cube texture faces must have matching dimensions.");
    }

    const texture = device.createTexture({
      size: [firstImage.width, firstImage.height, images.length],
      format: "rgba8unorm",
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });

    for (const [index, image] of images.entries()) {
      device.queue.copyExternalImageToTexture(
        { source: image },
        { texture, origin: [0, 0, index] },
        [image.width, image.height],
      );
    }

    return new CubeTexture(
      texture,
      texture.createView({ dimension: "cube" }),
      device.createSampler({
        addressModeU: "clamp-to-edge",
        addressModeV: "clamp-to-edge",
        addressModeW: "clamp-to-edge",
        magFilter: "linear",
        minFilter: "linear",
        mipmapFilter: "linear",
      }),
    );
  }

  dispose(): void {
    this.texture.destroy();
  }
}
