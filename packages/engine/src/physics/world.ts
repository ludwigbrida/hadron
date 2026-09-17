import { Vector3 } from "../math/vector3.ts";
import { Body } from "./body.ts";
import { BoxCollider } from "./box-collider.ts";
import { Collider } from "./collider.ts";
import type { RaycastHit } from "./raycast-hit.ts";
import { SphereCollider } from "./sphere-collider.ts";

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

  /**
   * Returns the nearest collider hit by a normalized ray.
   */
  public raycast(
    origin: Readonly<Vector3>,
    direction: Readonly<Vector3>,
    maxDistance: number,
  ): RaycastHit | undefined {
    let nearestHit: RaycastHit | undefined;

    for (const collider of this.getColliders()) {
      const hit = collider.raycast(origin, direction);

      if (
        hit !== undefined &&
        hit.distance <= maxDistance &&
        (nearestHit === undefined || hit.distance < nearestHit.distance)
      ) {
        nearestHit = hit;
      }
    }

    return nearestHit;
  }

  public *overlaps(collider: Collider): IterableIterator<Collider> {
    for (const other of this.getColliders()) {
      if (other === collider || !this.hasOverlappingBounds(collider, other)) {
        continue;
      }

      if (this.collidersOverlap(collider, other)) {
        yield other;
      }
    }
  }

  private collidersOverlap(first: Collider, second: Collider): boolean {
    if (first instanceof BoxCollider && second instanceof BoxCollider) {
      return true;
    }

    if (first instanceof SphereCollider && second instanceof SphereCollider) {
      return this.spheresOverlap(first, second);
    }

    return false;
  }

  private spheresOverlap(first: SphereCollider, second: SphereCollider): boolean {
    const offset = first.getWorldPosition().subtract(second.getWorldPosition());
    const radius = first.radius + second.radius;

    return offset.lengthSquared() <= radius * radius;
  }

  private hasOverlappingBounds(first: Collider, second: Collider): boolean {
    const firstBounds = first.getWorldBounds();
    const secondBounds = second.getWorldBounds();

    return (
      firstBounds.minimum[0] <= secondBounds.maximum[0] &&
      firstBounds.maximum[0] >= secondBounds.minimum[0] &&
      firstBounds.minimum[1] <= secondBounds.maximum[1] &&
      firstBounds.maximum[1] >= secondBounds.minimum[1] &&
      firstBounds.minimum[2] <= secondBounds.maximum[2] &&
      firstBounds.maximum[2] >= secondBounds.minimum[2]
    );
  }

  *[Symbol.iterator](): IterableIterator<Body> {
    yield* this.bodies;
  }

  *getColliders(): IterableIterator<Collider> {
    for (const body of this.bodies) {
      for (const child of body) {
        if (child instanceof Collider) {
          yield child;
        }
      }
    }
  }
}
