import { Matrix4 } from "../math/matrix4.ts";
import { Node } from "./node.ts";

export class Camera extends Node {
  private fovY = Math.PI / 3;
  private near = 0.1;
  private far = 100;
  private aspect = 1;
  private readonly projection = new Matrix4();
  private readonly view = new Matrix4();
  private readonly viewProjection = new Matrix4();

  setPerspective(fovY: number, near: number, far: number): this {
    this.fovY = fovY;
    this.near = near;
    this.far = far;
    this.updateProjection();
    return this;
  }

  setAspect(aspect: number): void {
    if (this.aspect === aspect) {
      return;
    }

    this.aspect = aspect;
    this.updateProjection();
  }

  getViewProjection(): Readonly<Matrix4> {
    this.view.setInverse(this.getWorldMatrix());
    this.viewProjection.setMultiply(this.projection, this.view);
    return this.viewProjection;
  }

  private updateProjection(): void {
    this.projection.setPerspective(this.fovY, this.aspect, this.near, this.far);
  }
}
