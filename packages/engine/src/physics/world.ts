import { Body } from "./body.ts";
import { BoxCollider } from "./box-collider.ts";

export class World {
  private readonly bodies = new Set<Body>();

  public addBody(body: Body): this {
    this.bodies.add(body);
    return this;
  }

  public removeBody(body: Body): this {
    this.bodies.delete(body);
    return this;
  }

  *[Symbol.iterator](): IterableIterator<Body> {
    yield* this.bodies;
  }

  *getBoxColliders(): IterableIterator<BoxCollider> {
    for (const body of this.bodies) {
      for (const child of body) {
        if (child instanceof BoxCollider) {
          yield child;
        }
      }
    }
  }
}
