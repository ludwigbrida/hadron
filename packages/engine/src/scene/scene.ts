import { KinematicBody } from "../physics/body/kinematic-body.ts";
import { StaticBody } from "../physics/body/static-body.ts";
import { World } from "../physics/world.ts";
import { Color } from "../rendering/color.ts";
import type { CubeTexture } from "../rendering/cube-texture.ts";
import { Mesh } from "../rendering/mesh.ts";
import { Camera } from "./camera.ts";
import { Component } from "./component.ts";
import { DirectionalLight } from "./directional-light.ts";
import { Node } from "./node.ts";

export class Scene {
  public readonly root = new Node();
  public readonly camera = new Camera();
  public readonly ambientLight = new Color(0.1, 0.1, 0.1);
  public readonly world = new World();
  private sky: CubeTexture | undefined;

  /** @internal */
  public static create(): Scene {
    return new Scene();
  }

  private constructor() {
    // The root activates every component beneath it.
    this.root.host = this;
    this.root.addComponent(this.camera);
  }

  /** Creates a detached hierarchy node. */
  public createNode(): Node {
    return new Node();
  }

  /** Creates a detached directional-light component. */
  public createDirectionalLight(): DirectionalLight {
    return new DirectionalLight();
  }

  /** Creates a detached static-body component. */
  public createStaticBody(): StaticBody {
    return new StaticBody();
  }

  /** Creates a detached kinematic-body component. */
  public createKinematicBody(): KinematicBody {
    return new KinematicBody();
  }

  public setSky(texture: CubeTexture): this {
    this.sky = texture;
    return this;
  }

  /** @internal */
  public getSky(): CubeTexture | undefined {
    return this.sky;
  }

  /** @internal */
  public getDirectionalLight(): DirectionalLight | undefined {
    return this.getFirstComponent(this.root, DirectionalLight);
  }

  /** Detaches a node subtree from this scene. */
  public remove(node: Node): this {
    node.parent?.removeChild(node);
    return this;
  }

  /** @internal */
  public *getMeshes(): IterableIterator<Mesh> {
    yield* this.getComponents(this.root, Mesh);
  }

  private *getComponents<T extends Component>(
    node: Node,
    type: ComponentType<T>,
  ): IterableIterator<T> {
    yield* node.getComponents(type);

    for (const child of node.children) {
      yield* this.getComponents(child, type);
    }
  }

  private getFirstComponent<T extends Component>(
    node: Node,
    type: ComponentType<T>,
  ): T | undefined {
    const component = node.getComponent(type);

    if (component !== undefined) {
      return component;
    }

    for (const child of node.children) {
      const descendant = this.getFirstComponent(child, type);

      if (descendant !== undefined) {
        return descendant;
      }
    }

    return undefined;
  }
}

type ComponentType<T extends Component> = abstract new (...args: never[]) => T;
