import type { Vector3 } from "./vector3.ts";

/**
 * Represents an axis-aligned bounding box in three-dimensional space.
 *
 * Bounds are inclusive: boxes that touch at a boundary overlap.
 */
export class Aabb {
  constructor(
    public readonly min: Vector3,
    public readonly max: Vector3,
  ) {}

  /**
   * Returns whether this box shares any space or boundary with another box.
   *
   * @param other The box to test against.
   */
  public overlaps(other: Readonly<Aabb>): boolean {
    return (
      this.min[0] <= other.max[0] &&
      this.max[0] >= other.min[0] &&
      this.min[1] <= other.max[1] &&
      this.max[1] >= other.min[1] &&
      this.min[2] <= other.max[2] &&
      this.max[2] >= other.min[2]
    );
  }

  /**
   * Returns the overlap size on every axis.
   *
   * A negative component means the boxes are separated on that axis.
   *
   * @param other The box to compare against.
   */
  public getOverlap(other: Readonly<Aabb>): Vector3 {
    // The shared interval begins at the greater lower bound.
    const overlapMinimum = this.min.clone().max(other.min);

    // The shared interval ends at the smaller upper bound.
    const overlapMaximum = this.max.clone().min(other.max);

    return overlapMaximum.subtract(overlapMinimum);
  }

  /**
   * Returns the point inside this box nearest to a given point.
   *
   * A point already inside the box is returned unchanged.
   *
   * @param point The point to clamp into this box.
   */
  public getClosestPoint(point: Readonly<Vector3>): Vector3 {
    return point.clone().clamp(this.min, this.max);
  }
}
