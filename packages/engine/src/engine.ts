import type { Geometry, GeometryData } from "./geometry.ts";
import type { Vec3 } from "./math/vec3.ts";
import type { Mesh } from "./mesh.ts";
import { Renderer } from "./renderer.ts";
import { Scene } from "./scene.ts";

export interface Frame {
  readonly elapsedTime: number;
  readonly deltaTime: number;
}

export type UpdateCallback = (frame: Frame) => void;

export class Engine {
  private readonly geometries = new Set<Geometry>();
  private readonly meshes = new Set<Mesh>();
  private frameRequest: number | undefined;
  private previousTime: number | undefined;
  private scene: Scene | undefined;
  private update: UpdateCallback | undefined;

  private constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly renderer: Renderer,
  ) {}

  static async create(canvas: HTMLCanvasElement): Promise<Engine> {
    return new Engine(canvas, await Renderer.create(canvas));
  }

  createScene(): Scene {
    return Scene.create((geometry) => this.createMesh(geometry));
  }

  createGeometry(data: GeometryData): Geometry {
    const geometry = this.renderer.createGeometry(data);

    this.geometries.add(geometry);
    return geometry;
  }

  private createMesh(geometry: Geometry): Mesh {
    const mesh = this.renderer.createMesh(geometry);

    this.meshes.add(mesh);
    return mesh;
  }

  setLightDirection(direction: Readonly<Vec3>): void {
    this.renderer.setLightDirection(direction);
  }

  start(scene: Scene, update: UpdateCallback): void {
    this.stop();
    this.scene = scene;
    this.update = update;
    this.frameRequest = requestAnimationFrame(this.render);
  }

  stop(): void {
    if (this.frameRequest !== undefined) {
      cancelAnimationFrame(this.frameRequest);
    }

    this.frameRequest = undefined;
    this.previousTime = undefined;
    this.scene = undefined;
    this.update = undefined;
  }

  dispose(): void {
    this.stop();

    for (const mesh of this.meshes) {
      mesh.dispose();
    }

    for (const geometry of this.geometries) {
      geometry.dispose();
    }

    this.meshes.clear();
    this.geometries.clear();
    this.renderer.dispose();
  }

  private readonly render = (timestamp: number): void => {
    this.frameRequest = undefined;

    const scene = this.scene;
    const update = this.update;

    if (!scene || !update) {
      return;
    }

    const elapsedTime = timestamp / 1_000;
    const deltaTime = elapsedTime - (this.previousTime ?? elapsedTime);

    this.previousTime = elapsedTime;
    update({ elapsedTime, deltaTime });

    if (this.scene !== scene) {
      return;
    }

    // TODO: move render target, camera, and dimensions into a viewport abstraction
    scene.camera.setAspect(this.canvas.clientWidth / this.canvas.clientHeight);
    this.renderer.render(scene);
    this.frameRequest = requestAnimationFrame(this.render);
  };
}
