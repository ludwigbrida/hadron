import { Mat4 } from "./math/mat4.ts";
import type { Mesh } from "./mesh.ts";

export class Scene {
  private readonly meshes = new Set<Mesh>();
  private readonly viewProjection = new Mat4();

  add(mesh: Mesh): this {
    this.meshes.add(mesh);
    return this;
  }

  remove(mesh: Mesh): this {
    this.meshes.delete(mesh);
    return this;
  }

  setViewProjection(viewProjection: Readonly<Mat4>): void {
    this.viewProjection.set(viewProjection);
  }

  getViewProjection(): Readonly<Mat4> {
    return this.viewProjection;
  }

  [Symbol.iterator](): IterableIterator<Mesh> {
    return this.meshes.values();
  }
}
