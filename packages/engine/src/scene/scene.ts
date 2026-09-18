import { Body } from "../physics/body/body.ts";
import { KinematicBody } from "../physics/body/kinematic-body.ts";
import { StaticBody } from "../physics/body/static-body.ts";
import { World } from "../physics/world.ts";
import { Color } from "../rendering/color.ts";
import type { CubeTexture } from "../rendering/cube-texture.ts";
import { Mesh } from "../rendering/mesh.ts";
import { Camera } from "./camera.ts";
import { DirectionalLight } from "./directional-light.ts";
import { Node, type NodeTree } from "./node.ts";

export class Scene {
  readonly root = new Node();
  readonly camera = new Camera();
  readonly ambientLight = new Color(0.1, 0.1, 0.1);
  private sky: CubeTexture | undefined;

  readonly world = new World();
  private readonly tree: NodeTree = {
    onNodeAttached: (node) => {
      if (node instanceof Body) {
        this.world.addBody(node);
      }
    },
    onNodeDetached: (node) => {
      if (node instanceof Body) {
        this.world.removeBody(node);
      }
    },
  };

  /** @internal */
  static create(): Scene {
    return new Scene();
  }

  private constructor() {
    this.root.setTree(this.tree);
    this.root.addChild(this.camera);
  }

  /**
   * Creates a detached node.
   *
   * Attach it to the scene graph with {@link Node.addChild}.
   */
  createNode(): Node {
    return new Node();
  }

  /**
   * Creates a detached directional light.
   *
   * Attach it to the scene graph with {@link Node.addChild}.
   */
  createDirectionalLight(): DirectionalLight {
    return new DirectionalLight();
  }

  /**
   * Creates a detached static body.
   *
   * It is registered with this scene's physics world when attached beneath {@link root}.
   */
  createStaticBody(): StaticBody {
    return new StaticBody();
  }

  /**
   * Creates a detached kinematic body.
   *
   * It is registered with this scene's physics world when attached beneath {@link root}.
   */
  createKinematicBody(): KinematicBody {
    return new KinematicBody();
  }

  setSky(texture: CubeTexture): this {
    this.sky = texture;
    return this;
  }

  /** @internal */
  getSky(): CubeTexture | undefined {
    return this.sky;
  }

  /** @internal */
  getDirectionalLight(): DirectionalLight | undefined {
    return this.getFirstDirectionalLight(this.root);
  }

  /**
   * Detaches a node subtree from this scene.
   *
   * The scene-tree lifecycle unregisters every body in the detached subtree.
   */
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

  private getFirstDirectionalLight(node: Node): DirectionalLight | undefined {
    for (const child of node) {
      if (child instanceof DirectionalLight) {
        return child;
      }

      const light = this.getFirstDirectionalLight(child);

      if (light) {
        return light;
      }
    }

    return undefined;
  }
}
