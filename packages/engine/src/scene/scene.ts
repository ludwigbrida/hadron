import type { Geometry } from "../rendering/geometry.ts";
import { Mesh } from "../rendering/mesh.ts";
import { Camera } from "./camera.ts";
import { Node } from "./node.ts";

export class Scene {
  readonly camera = new Camera();
  readonly root = new Node();

  /** @internal */
  static create(createMeshInstance: (geometry: Geometry) => Mesh): Scene {
    return new Scene(createMeshInstance);
  }

  private constructor(private readonly createMeshInstance: (geometry: Geometry) => Mesh) {}

  createNode(): Node {
    const node = new Node();

    this.root.addChild(node);
    return node;
  }

  createMesh(geometry: Geometry): Mesh {
    const mesh = this.createMeshInstance(geometry);

    this.root.addChild(mesh);
    return mesh;
  }

  remove(mesh: Mesh): this {
    mesh.parent?.removeChild(mesh);
    return this;
  }

  *[Symbol.iterator](): IterableIterator<Mesh> {
    yield* this.getMeshes(this.root);
  }

  private *getMeshes(node: Node): IterableIterator<Mesh> {
    for (const child of node) {
      if (child instanceof Mesh) {
        yield child;
      }

      yield* this.getMeshes(child);
    }
  }
}
