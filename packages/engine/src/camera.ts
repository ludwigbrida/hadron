import { Mat4 } from "./math/mat4.ts";
import type { Vec3 } from "./math/vec3.ts";

export class Camera {
  private readonly projection = new Mat4();
  private readonly view = new Mat4();
  private readonly viewProjection = new Mat4();

  setPerspective(fovY: number, aspect: number, near: number, far: number): this {
    this.projection.setPerspective(fovY, aspect, near, far);
    this.updateViewProjection();
    return this;
  }

  setLookAt(eye: Readonly<Vec3>, target: Readonly<Vec3>, up: Readonly<Vec3>): this {
    this.view.setLookAt(eye, target, up);
    this.updateViewProjection();
    return this;
  }

  getViewProjection(): Readonly<Mat4> {
    return this.viewProjection;
  }

  private updateViewProjection(): void {
    this.viewProjection.setMultiply(this.projection, this.view);
  }
}
