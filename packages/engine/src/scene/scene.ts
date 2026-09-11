import type { Geometry } from "../rendering/geometry.ts";
import type { Mesh } from "../rendering/mesh.ts";
import { Camera } from "./camera.ts";

export class Scene {
  private readonly meshes = new Set<Mesh>();
  readonly camera = new Camera();

  /** @internal */
  static create(createMeshInstance: (geometry: Geometry) => Mesh): Scene {
    return new Scene(createMeshInstance);
  }

  private constructor(private readonly createMeshInstance: (geometry: Geometry) => Mesh) {}

  createMesh(geometry: Geometry): Mesh {
    const mesh = this.createMeshInstance(geometry);

    this.meshes.add(mesh);
    return mesh;
  }

  remove(mesh: Mesh): this {
    this.meshes.delete(mesh);
    return this;
  }

  [Symbol.iterator](): IterableIterator<Mesh> {
    return this.meshes.values();
  }
}
