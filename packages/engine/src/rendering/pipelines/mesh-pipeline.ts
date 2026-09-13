import { Mat4 } from "../../math/mat4.ts";
import type { Scene } from "../../scene/scene.ts";
import type { Color } from "../color.ts";
import type { Geometry } from "../geometry.ts";
import { Material, type MaterialOptions } from "../material.ts";
import { Mesh } from "../mesh.ts";
import meshShader from "../shaders/mesh.wgsl?raw";
import { Texture } from "../texture.ts";

export class MeshPipeline {
  private readonly lightDirection = new Float32Array(4);
  private readonly directionalLightColor = new Float32Array(4);

  private constructor(
    private readonly device: GPUDevice,
    private readonly pipeline: GPURenderPipeline,
    private readonly viewProjectionBuffer: GPUBuffer,
    private readonly lightDirectionBuffer: GPUBuffer,
    private readonly ambientLightBuffer: GPUBuffer,
    private readonly directionalLightColorBuffer: GPUBuffer,
    private readonly renderBindGroup: GPUBindGroup,
    private readonly defaultBaseColorTexture: Texture,
  ) {}

  static async create(device: GPUDevice, format: GPUTextureFormat): Promise<MeshPipeline> {
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
      size: Mat4.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const lightDirectionBuffer = device.createBuffer({
      size: new Float32Array(4).byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const ambientLightBuffer = device.createBuffer({
      size: new Float32Array(4).byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const directionalLightColorBuffer = device.createBuffer({
      size: new Float32Array(4).byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

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

    const defaultBaseColorTexture = Texture.createSolidColor(
      device,
      new Uint8Array([255, 255, 255, 255]),
    );

    return new MeshPipeline(
      device,
      pipeline,
      viewProjectionBuffer,
      lightDirectionBuffer,
      ambientLightBuffer,
      directionalLightColorBuffer,
      renderBindGroup,
      defaultBaseColorTexture,
    );
  }

  render(pass: GPURenderPassEncoder, scene: Scene, viewProjection: Readonly<Mat4>): void {
    this.device.queue.writeBuffer(this.viewProjectionBuffer, 0, viewProjection);
    const directionalLight = scene.getDirectionalLight();

    this.lightDirection.fill(0);
    this.directionalLightColor.fill(0);

    if (directionalLight) {
      this.lightDirection.set(directionalLight.getDirection());
      this.directionalLightColor.set(directionalLight.color);
    }

    this.device.queue.writeBuffer(this.lightDirectionBuffer, 0, this.lightDirection);
    this.device.queue.writeBuffer(this.ambientLightBuffer, 0, scene.ambientLight);
    this.device.queue.writeBuffer(this.directionalLightColorBuffer, 0, this.directionalLightColor);

    for (const mesh of scene) {
      const worldMatrix = mesh.getWorldMatrix();

      this.device.queue.writeBuffer(mesh.transformBuffer, 0, worldMatrix);

      mesh.normalMatrix.setInverse(worldMatrix).setTranspose(mesh.normalMatrix);

      this.device.queue.writeBuffer(mesh.normalMatrixBuffer, 0, mesh.normalMatrix);
    }

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
  }

  createMaterial(baseColor: Readonly<Color>, options?: MaterialOptions): Material {
    return Material.create(
      this.device,
      this.pipeline.getBindGroupLayout(1),
      baseColor,
      options?.baseColorTexture ?? this.defaultBaseColorTexture,
      options?.shadingModel ?? "lit",
    );
  }

  createMesh(geometry: Geometry, material: Material): Mesh {
    return Mesh.create(this.device, this.pipeline.getBindGroupLayout(2), geometry, material);
  }

  dispose(): void {
    this.viewProjectionBuffer.destroy();
    this.lightDirectionBuffer.destroy();
    this.ambientLightBuffer.destroy();
    this.directionalLightColorBuffer.destroy();
    this.defaultBaseColorTexture.dispose();
  }
}
