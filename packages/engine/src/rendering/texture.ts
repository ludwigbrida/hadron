export class Texture {
  private constructor(
    private readonly texture: GPUTexture,
    readonly view: GPUTextureView,
    readonly sampler: GPUSampler,
  ) {}

  static create(device: GPUDevice, image: ImageBitmap): Texture {
    const texture = device.createTexture({
      size: [image.width, image.height],
      format: "rgba8unorm",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });

    device.queue.copyExternalImageToTexture({ source: image }, { texture }, [
      image.width,
      image.height,
    ]);

    const view = texture.createView();

    const sampler = device.createSampler({
      magFilter: "linear",
      minFilter: "linear",
      mipmapFilter: "linear",
    });

    return new Texture(texture, view, sampler);
  }

  dispose(): void {
    this.texture.destroy();
  }
}
