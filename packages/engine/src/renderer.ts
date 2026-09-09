export class Renderer {
  private constructor(
    private readonly context: GPUCanvasContext,
    private readonly device: GPUDevice,
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

    context.configure({
      device,
      format: navigator.gpu.getPreferredCanvasFormat(),
    });

    return new Renderer(context, device);
  }

  dispose(): void {
    this.context.unconfigure();
    this.device.destroy();
  }
}
