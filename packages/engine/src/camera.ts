import { Mat4 } from "./math/mat4.ts";
import type { Vec3 } from "./math/vec3.ts";

export class Camera {
  private fovY = Math.PI / 3;
  private near = 0.1;
  private far = 100;
  private aspect = 1;
  private readonly projection = new Mat4();
  private readonly view = new Mat4();
  private readonly viewProjection = new Mat4();

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

  private updateProjection(): void {
    this.projection.setPerspective(this.fovY, this.aspect, this.near, this.far);
    this.updateViewProjection();
  }
}
