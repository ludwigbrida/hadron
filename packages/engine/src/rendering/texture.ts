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

    return Texture.createWithSampler(device, texture);
  }

  static createSolidColor(device: GPUDevice, color: Uint8Array): Texture {
    const texture = device.createTexture({
      size: [1, 1],
      format: "rgba8unorm",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });

    device.queue.writeTexture({ texture }, color, { bytesPerRow: color.byteLength }, [1, 1]);

    return Texture.createWithSampler(device, texture);
  }

  dispose(): void {
    this.texture.destroy();
  }

  private static createWithSampler(device: GPUDevice, texture: GPUTexture): Texture {
    const view = texture.createView();

    const sampler = device.createSampler({
      magFilter: "linear",
      minFilter: "linear",
      mipmapFilter: "linear",
    });

    return new Texture(texture, view, sampler);
  }
}
