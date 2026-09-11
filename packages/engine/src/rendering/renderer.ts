import { Scene } from "../scene/scene.ts";
import { Color } from "./color.ts";
import { Geometry, type GeometryData } from "./geometry.ts";
import { Material } from "./material.ts";
import { Mesh } from "./mesh.ts";
import meshShader from "./shaders/mesh.wgsl?raw";
import { Texture } from "./texture.ts";

const identityViewProjection = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
const emptyLightDirection = new Float32Array(4);
const emptyAmbientLight = new Color(0, 0, 0);
const emptyDirectionalLightColor = new Color(0, 0, 0);

export class Renderer {
  private depthTexture: GPUTexture | undefined;
  private readonly lightDirection = new Float32Array(4);

  private constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly context: GPUCanvasContext,
    private readonly device: GPUDevice,
    private readonly pipeline: GPURenderPipeline,
    private readonly viewProjectionBuffer: GPUBuffer,
    private readonly lightDirectionBuffer: GPUBuffer,
    private readonly ambientLightBuffer: GPUBuffer,
    private readonly directionalLightColorBuffer: GPUBuffer,
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

    const context = canvas.getContext("webgpu");

    if (!context) {
      throw new Error("The canvas does not support WebGPU.");
    }

    const format = navigator.gpu.getPreferredCanvasFormat();

    context.configure({
      device,
      format,
    });

    const shaderModule = device.createShaderModule({
      code: meshShader,
    });

    const pipeline = await device.createRenderPipelineAsync({
      layout: "auto",
      vertex: {
        module: shaderModule,
        entryPoint: "vertexMain",
        buffers: [
          {
            arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
              {
                format: "float32x3",
                offset: 0,
                shaderLocation: 0,
              },
            ],
          },
          {
            arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
              {
                format: "float32x3",
                offset: 0,
                shaderLocation: 1,
              },
            ],
          },
          {
            arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
              {
                format: "float32x2",
                offset: 0,
                shaderLocation: 2,
              },
            ],
          },
        ],
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fragmentMain",
        targets: [
          {
            format,
          },
        ],
      },
      primitive: {
        topology: "triangle-list",
      },
      depthStencil: {
        format: "depth24plus",
        depthWriteEnabled: true,
        depthCompare: "less",
      },
    });

    const viewProjectionBuffer = device.createBuffer({
      size: identityViewProjection.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(viewProjectionBuffer, 0, identityViewProjection);

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
      layout: pipeline.getBindGroupLayout(0),
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
      pipeline,
      viewProjectionBuffer,
      lightDirectionBuffer,
      ambientLightBuffer,
      directionalLightColorBuffer,
      renderBindGroup,
    );
  }

  createGeometry(data: GeometryData): Geometry {
    return Geometry.create(this.device, data);
  }

  createMaterial(baseColor: Readonly<Color>): Material {
    return Material.create(this.device, this.pipeline.getBindGroupLayout(1), baseColor);
  }

  createMesh(geometry: Geometry, material: Material): Mesh {
    return Mesh.create(this.device, this.pipeline.getBindGroupLayout(2), geometry, material);
  }

  createTexture(image: ImageBitmap): Texture {
    return Texture.create(this.device, image);
  }

  render(scene: Scene): void {
    const depthTexture = this.resizeRenderTargets();

    this.device.queue.writeBuffer(this.viewProjectionBuffer, 0, scene.camera.getViewProjection());
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

    pass.setPipeline(this.pipeline);
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
    this.lightDirectionBuffer.destroy();
    this.ambientLightBuffer.destroy();
    this.directionalLightColorBuffer.destroy();
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
