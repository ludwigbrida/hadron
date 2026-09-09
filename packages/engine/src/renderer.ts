import triangleShader from "./shaders/triangle.wgsl?raw";
import { Mesh, type MeshData } from "./mesh.ts";

const identityTransform = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

export class Renderer {
  private constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly context: GPUCanvasContext,
    private readonly device: GPUDevice,
    private readonly pipeline: GPURenderPipeline,
    private readonly transformBuffer: GPUBuffer,
    private readonly transformBindGroup: GPUBindGroup,
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

    const transformBuffer = device.createBuffer({
      size: identityTransform.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(transformBuffer, 0, identityTransform);

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
      code: triangleShader,
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
    });

    const transformBindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: transformBuffer,
          },
        },
      ],
    });

    return new Renderer(canvas, context, device, pipeline, transformBuffer, transformBindGroup);
  }

  createMesh(data: MeshData): Mesh {
    return Mesh.create(this.device, data);
  }

  render(mesh: Mesh): void {
    this.resizeCanvas();

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
    });

    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.transformBindGroup);
    pass.setVertexBuffer(0, mesh.vertexBuffer);
    pass.setIndexBuffer(mesh.indexBuffer, "uint16");
    pass.drawIndexed(mesh.indexCount);
    pass.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }

  dispose(): void {
    this.transformBuffer.destroy();
    this.context.unconfigure();
    this.device.destroy();
  }

  private resizeCanvas(): void {
    const width = Math.round(this.canvas.clientWidth * window.devicePixelRatio);
    const height = Math.round(this.canvas.clientHeight * window.devicePixelRatio);

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }
}
