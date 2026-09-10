import { Camera } from "./camera.ts";
import type { Mesh } from "./mesh.ts";

export class Scene {
  private readonly meshes = new Set<Mesh>();
  readonly camera = new Camera();

  add(mesh: Mesh): this {
    this.meshes.add(mesh);
    return this;
  }

  remove(mesh: Mesh): this {
    this.meshes.delete(mesh);
    return this;
  }

  [Symbol.iterator](): IterableIterator<Mesh> {
    return this.meshes.values();
  }
}
