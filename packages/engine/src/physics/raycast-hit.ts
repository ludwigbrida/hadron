import type { Collider } from "./collider.ts";

export interface RaycastHit {
  readonly collider: Collider;
  readonly distance: number;
}
