import type { Scene } from "../scene/scene.ts";
import type { Color } from "./color.ts";
import { CubeTexture, type CubeTextureFaces, type CubeTextureOptions } from "./cube-texture.ts";
import { Geometry, type GeometryData } from "./geometry.ts";
import type { Material, MaterialOptions } from "./material.ts";
import type { Mesh } from "./mesh.ts";
import { MeshPipeline } from "./pipelines/mesh-pipeline.ts";
import { SkyPipeline } from "./pipelines/sky-pipeline.ts";
import { Texture, type TextureOptions } from "./texture.ts";

export class Renderer {
  private depthTexture: GPUTexture | undefined;

  private constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly context: GPUCanvasContext,
    private readonly device: GPUDevice,
    private readonly meshPipeline: MeshPipeline,
    private readonly skyPipeline: SkyPipeline,
  ) {}

  static async create(canvas: HTMLCanvasElement): Promise<Renderer> {
    if (!navigator.gpu) {
      throw new Error("WebGPU is not available in this browser.");
    }

    const adapter = await navigator.gpu.requestAdapter();

    if (!adapter) {
      throw new Error("No compatible WebGPU adapter is available.");
    }

    const device = await adapter.requestDevice();
    const context = canvas.getContext("webgpu");

    if (!context) {
      throw new Error("The canvas does not support WebGPU.");
    }

    const format = navigator.gpu.getPreferredCanvasFormat();

    context.configure({
      device,
      format,
    });

    const meshPipeline = await MeshPipeline.create(device, format);

    const skyPipeline = await SkyPipeline.create(device, format);

    return new Renderer(canvas, context, device, meshPipeline, skyPipeline);
  }

  createGeometry(data: GeometryData): Geometry {
    return Geometry.create(this.device, data);
  }

  createMaterial(baseColor: Readonly<Color>, options?: MaterialOptions): Material {
    return this.meshPipeline.createMaterial(baseColor, options);
  }

  createMesh(geometry: Geometry, material: Material): Mesh {
    return this.meshPipeline.createMesh(geometry, material);
  }

  createTexture(image: ImageBitmap, options?: TextureOptions): Texture {
    return Texture.create(this.device, image, options);
  }

  createCubeTexture(faces: CubeTextureFaces, options?: CubeTextureOptions): CubeTexture {
    return CubeTexture.create(this.device, faces, options);
  }

  render(scene: Scene): void {
    const depthTexture = this.resizeRenderTargets();
    const viewProjection = scene.camera.getViewProjection();

    const commandEncoder = this.device.createCommandEncoder();

    const pass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
      depthStencilAttachment: {
        view: depthTexture.createView(),
        depthClearValue: 1,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      },
    });

    this.skyPipeline.render(pass, scene.getSky(), viewProjection);

    this.meshPipeline.render(pass, scene, viewProjection);

    pass.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }

  dispose(): void {
    this.depthTexture?.destroy();
    this.meshPipeline.dispose();
    this.skyPipeline.dispose();
    this.context.unconfigure();
    this.device.destroy();
  }

  private resizeRenderTargets(): GPUTexture {
    const width = Math.round(this.canvas.clientWidth * window.devicePixelRatio);
    const height = Math.round(this.canvas.clientHeight * window.devicePixelRatio);
    let depthTexture = this.depthTexture;

    if (this.canvas.width !== width || this.canvas.height !== height || !depthTexture) {
      this.canvas.width = width;
      this.canvas.height = height;
      depthTexture?.destroy();
      depthTexture = this.device.createTexture({
        size: { width, height },
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      });
      this.depthTexture = depthTexture;
    }

    return depthTexture;
  }
}
