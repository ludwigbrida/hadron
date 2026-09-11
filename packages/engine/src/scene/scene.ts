import { Color } from "../rendering/color.ts";
import type { Geometry } from "../rendering/geometry.ts";
import type { Material } from "../rendering/material.ts";
import { Mesh } from "../rendering/mesh.ts";
import { Camera } from "./camera.ts";
import { DirectionalLight } from "./directional-light.ts";
import { Node } from "./node.ts";

export class Scene {
  readonly root = new Node();
  readonly camera = new Camera();
  readonly directionalLight = new DirectionalLight();
  readonly ambientLight = new Color(0.1, 0.1, 0.1);

  /** @internal */
  static create(createMeshInstance: (geometry: Geometry, material: Material) => Mesh): Scene {
    return new Scene(createMeshInstance);
  }

  private constructor(
    private readonly createMeshInstance: (geometry: Geometry, material: Material) => Mesh,
  ) {
    this.root.addChild(this.camera);
  }

  createNode(): Node {
    const node = new Node();

    this.root.addChild(node);
    return node;
  }

  createMesh(geometry: Geometry, material: Material): Mesh {
    const mesh = this.createMeshInstance(geometry, material);

    this.root.addChild(mesh);
    return mesh;
  }

  remove(node: Node): this {
    node.parent?.removeChild(node);
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
