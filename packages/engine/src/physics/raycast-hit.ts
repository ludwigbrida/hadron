import type { Vector3 } from "../math/vector3.ts";
import type { Collider } from "./collider.ts";

export interface RaycastHit {
  readonly collider: Collider;
  readonly distance: number;
  readonly point: Vector3;
}
