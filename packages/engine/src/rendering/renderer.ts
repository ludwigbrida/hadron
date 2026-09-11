import type { Vec3 } from "../math/vec3.ts";
import { Scene } from "../scene/scene.ts";
import { Geometry, type GeometryData } from "./geometry.ts";
import { Mesh } from "./mesh.ts";
import meshShader from "./shaders/mesh.wgsl?raw";

const identityViewProjection = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
const defaultLightDirection = new Float32Array([0.5, 0.8, 1, 0]);

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
      size: defaultLightDirection.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(lightDirectionBuffer, 0, defaultLightDirection);

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
      ],
    });

    return new Renderer(
      canvas,
      context,
      device,
      pipeline,
      viewProjectionBuffer,
      lightDirectionBuffer,
      renderBindGroup,
    );
  }

  createGeometry(data: GeometryData): Geometry {
    return Geometry.create(this.device, data);
  }

  createMesh(geometry: Geometry): Mesh {
    return Mesh.create(this.device, this.pipeline.getBindGroupLayout(1), geometry);
  }

  setLightDirection(direction: Readonly<Vec3>): void {
    this.lightDirection[0] = direction[0];
    this.lightDirection[1] = direction[1];
    this.lightDirection[2] = direction[2];
    this.device.queue.writeBuffer(this.lightDirectionBuffer, 0, this.lightDirection);
  }

  render(scene: Scene): void {
    const depthTexture = this.resizeRenderTargets();

    this.device.queue.writeBuffer(this.viewProjectionBuffer, 0, scene.camera.getViewProjection());

    for (const mesh of scene) {
      // TODO: handle with inverse-transpose normal matrix for non-uniform scales
      this.device.queue.writeBuffer(mesh.transformBuffer, 0, mesh.getWorldMatrix());
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
      pass.setBindGroup(1, mesh.bindGroup);
      pass.setVertexBuffer(0, mesh.geometry.vertexBuffer);
      pass.setVertexBuffer(1, mesh.geometry.normalBuffer);
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
