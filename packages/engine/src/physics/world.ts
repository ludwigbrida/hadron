import { Body } from "./body.ts";

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
}
