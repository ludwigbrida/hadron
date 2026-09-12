import { Mat4 } from "../math/mat4.ts";
import { Scene } from "../scene/scene.ts";
import { Color } from "./color.ts";
import { CubeTexture, type CubeTextureFaces, type CubeTextureOptions } from "./cube-texture.ts";
import { Geometry, type GeometryData } from "./geometry.ts";
import { Material, type MaterialOptions } from "./material.ts";
import { Mesh } from "./mesh.ts";
import { createMeshPipeline } from "./pipelines/mesh-pipeline.ts";
import { createSkyPipeline } from "./pipelines/sky-pipeline.ts";
import { Texture, type TextureOptions } from "./texture.ts";

const identityViewProjection = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
const emptyLightDirection = new Float32Array(4);
const emptyAmbientLight = new Color(0, 0, 0);
const emptyDirectionalLightColor = new Color(0, 0, 0);

export class Renderer {
  private depthTexture: GPUTexture | undefined;
  private readonly lightDirection = new Float32Array(4);
  private readonly inverseViewProjection = new Mat4();
  private readonly skyBindGroups = new WeakMap<CubeTexture, GPUBindGroup>();

  private constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly context: GPUCanvasContext,
    private readonly device: GPUDevice,
    private readonly meshPipeline: GPURenderPipeline,
    private readonly skyPipeline: GPURenderPipeline,
    private readonly viewProjectionBuffer: GPUBuffer,
    private readonly inverseViewProjectionBuffer: GPUBuffer,
    private readonly lightDirectionBuffer: GPUBuffer,
    private readonly ambientLightBuffer: GPUBuffer,
    private readonly directionalLightColorBuffer: GPUBuffer,
    private readonly defaultTexture: Texture,
    private readonly renderBindGroup: GPUBindGroup,
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
    const defaultTexture = Texture.createSolidColor(device, new Uint8Array([255, 255, 255, 255]));

    const context = canvas.getContext("webgpu");

    if (!context) {
      throw new Error("The canvas does not support WebGPU.");
    }

    const format = navigator.gpu.getPreferredCanvasFormat();

    context.configure({
      device,
      format,
    });

    const meshPipeline = await createMeshPipeline(device, format);

    const skyPipeline = await createSkyPipeline(device, format);

    const viewProjectionBuffer = device.createBuffer({
      size: identityViewProjection.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(viewProjectionBuffer, 0, identityViewProjection);

    const inverseViewProjectionBuffer = device.createBuffer({
      size: identityViewProjection.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(inverseViewProjectionBuffer, 0, identityViewProjection);

    const lightDirectionBuffer = device.createBuffer({
      size: emptyLightDirection.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(lightDirectionBuffer, 0, emptyLightDirection);

    const ambientLightBuffer = device.createBuffer({
      size: emptyAmbientLight.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(ambientLightBuffer, 0, emptyAmbientLight);

    const directionalLightColorBuffer = device.createBuffer({
      size: emptyDirectionalLightColor.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(directionalLightColorBuffer, 0, emptyDirectionalLightColor);

    const renderBindGroup = device.createBindGroup({
      layout: meshPipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: viewProjectionBuffer,
          },
        },
        {
          binding: 1,
          resource: {
            buffer: lightDirectionBuffer,
          },
        },
        {
          binding: 2,
          resource: {
            buffer: ambientLightBuffer,
          },
        },
        {
          binding: 3,
          resource: {
            buffer: directionalLightColorBuffer,
          },
        },
      ],
    });

    return new Renderer(
      canvas,
      context,
      device,
      meshPipeline,
      skyPipeline,
      viewProjectionBuffer,
      inverseViewProjectionBuffer,
      lightDirectionBuffer,
      ambientLightBuffer,
      directionalLightColorBuffer,
      defaultTexture,
      renderBindGroup,
    );
  }

  createGeometry(data: GeometryData): Geometry {
    return Geometry.create(this.device, data);
  }

  createMaterial(baseColor: Readonly<Color>, options?: MaterialOptions): Material {
    return Material.create(
      this.device,
      this.meshPipeline.getBindGroupLayout(1),
      baseColor,
      options?.texture ?? this.defaultTexture,
      options?.unlit ?? false,
    );
  }

  createMesh(geometry: Geometry, material: Material): Mesh {
    return Mesh.create(this.device, this.meshPipeline.getBindGroupLayout(2), geometry, material);
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

    this.device.queue.writeBuffer(this.viewProjectionBuffer, 0, viewProjection);
    this.inverseViewProjection.setInverse(viewProjection);
    this.device.queue.writeBuffer(this.inverseViewProjectionBuffer, 0, this.inverseViewProjection);
    this.lightDirection[0] = scene.directionalLight.direction[0];
    this.lightDirection[1] = scene.directionalLight.direction[1];
    this.lightDirection[2] = scene.directionalLight.direction[2];
    this.device.queue.writeBuffer(this.lightDirectionBuffer, 0, this.lightDirection);
    this.device.queue.writeBuffer(this.ambientLightBuffer, 0, scene.ambientLight);
    this.device.queue.writeBuffer(
      this.directionalLightColorBuffer,
      0,
      scene.directionalLight.color,
    );

    for (const mesh of scene) {
      const worldMatrix = mesh.getWorldMatrix();

      this.device.queue.writeBuffer(mesh.transformBuffer, 0, worldMatrix);
      mesh.normalMatrix.setInverse(worldMatrix).setTranspose(mesh.normalMatrix);
      this.device.queue.writeBuffer(mesh.normalMatrixBuffer, 0, mesh.normalMatrix);
    }

    const commandEncoder = this.device.createCommandEncoder();

    const pass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView(),
          clearValue: { r: 0.5, g: 0.4, b: 0.3, a: 1 },
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

    const sky = scene.getSky();

    if (sky) {
      pass.setPipeline(this.skyPipeline);
      pass.setBindGroup(0, this.getSkyBindGroup(sky));
      pass.draw(3);
    }

    pass.setPipeline(this.meshPipeline);
    pass.setBindGroup(0, this.renderBindGroup);

    for (const mesh of scene) {
      pass.setBindGroup(1, mesh.material.bindGroup);
      pass.setBindGroup(2, mesh.bindGroup);
      pass.setVertexBuffer(0, mesh.geometry.vertexBuffer);
      pass.setVertexBuffer(1, mesh.geometry.normalBuffer);
      pass.setVertexBuffer(2, mesh.geometry.texCoordBuffer);
      pass.setIndexBuffer(mesh.geometry.indexBuffer, "uint16");
      pass.drawIndexed(mesh.geometry.indexCount);
    }

    pass.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }

  dispose(): void {
    this.depthTexture?.destroy();
    this.viewProjectionBuffer.destroy();
    this.inverseViewProjectionBuffer.destroy();
    this.lightDirectionBuffer.destroy();
    this.ambientLightBuffer.destroy();
    this.directionalLightColorBuffer.destroy();
    this.defaultTexture.dispose();
    this.context.unconfigure();
    this.device.destroy();
  }

  private getSkyBindGroup(texture: CubeTexture): GPUBindGroup {
    let bindGroup = this.skyBindGroups.get(texture);

    if (!bindGroup) {
      bindGroup = this.device.createBindGroup({
        layout: this.skyPipeline.getBindGroupLayout(0),
        entries: [
          {
            binding: 0,
            resource: {
              buffer: this.inverseViewProjectionBuffer,
            },
          },
          {
            binding: 1,
            resource: texture.sampler,
          },
          {
            binding: 2,
            resource: texture.view,
          },
        ],
      });
      this.skyBindGroups.set(texture, bindGroup);
    }

    return bindGroup;
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
