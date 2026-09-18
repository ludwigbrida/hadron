import { Vector3, type Geometry, type Material, type Scene } from "@hadron/engine";
import { createStaticBox } from "./create-static-box.ts";

// Each step is lower than the player capsule radius, so its rounded base can step onto it.
const layers = [
  { halfExtents: new Vector3(4, 0.05, 4), y: -0.95 },
  { halfExtents: new Vector3(3.7, 0.05, 3.7), y: -0.85 },
  { halfExtents: new Vector3(3.4, 0.05, 3.4), y: -0.75 },
  { halfExtents: new Vector3(3.1, 0.05, 3.1), y: -0.65 },
  { halfExtents: new Vector3(2.8, 0.05, 2.8), y: -0.55 },
  { halfExtents: new Vector3(2.5, 0.05, 2.5), y: -0.45 },
  { halfExtents: new Vector3(2.2, 0.05, 2.2), y: -0.35 },
  { halfExtents: new Vector3(1.9, 0.05, 1.9), y: -0.25 },
  { halfExtents: new Vector3(1.6, 0.05, 1.6), y: -0.15 },
  { halfExtents: new Vector3(1.3, 0.05, 1.3), y: -0.05 },
];

/**
 * Creates the stepped platform used to exercise capsule movement and collision resolution.
 */
export function createPyramid(scene: Scene, cube: Geometry, material: Material): void {
  for (const layer of layers) {
    createStaticBox(scene, cube, material, {
      halfExtents: layer.halfExtents,
      position: new Vector3(0, layer.y, -4),
    });
  }
}
