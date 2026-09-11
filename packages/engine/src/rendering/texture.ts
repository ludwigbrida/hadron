export interface TextureOptions {
  readonly addressModeU?: GPUAddressMode;
  readonly addressModeV?: GPUAddressMode;
  readonly magFilter?: GPUFilterMode;
  readonly minFilter?: GPUFilterMode;
}

export class Texture {
  private constructor(
    private readonly texture: GPUTexture,
    readonly view: GPUTextureView,
    readonly sampler: GPUSampler,
  ) {}

  static create(device: GPUDevice, image: ImageBitmap, options?: TextureOptions): Texture {
    const texture = device.createTexture({
      size: [image.width, image.height],
      format: "rgba8unorm",
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });

    device.queue.copyExternalImageToTexture({ source: image }, { texture }, [
      image.width,
      image.height,
    ]);

    return Texture.createWithSampler(device, texture, options);
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

  private static createWithSampler(
    device: GPUDevice,
    texture: GPUTexture,
    options?: TextureOptions,
  ): Texture {
    const view = texture.createView();

    const sampler = device.createSampler({
      addressModeU: options?.addressModeU ?? "clamp-to-edge",
      addressModeV: options?.addressModeV ?? "clamp-to-edge",
      magFilter: options?.magFilter ?? "linear",
      minFilter: options?.minFilter ?? "linear",
      mipmapFilter: "linear",
    });

    return new Texture(texture, view, sampler);
  }
}
