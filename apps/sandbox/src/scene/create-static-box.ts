import {
  BoxCollider,
  type Engine,
  type Geometry,
  type Material,
  type Scene,
  type StaticBody,
  type Vector3,
} from "@hadron/engine";

const cubeHalfExtent = 0.25;

export interface StaticBoxOptions {
  readonly halfExtents: Readonly<Vector3>;
  readonly position: Readonly<Vector3>;
}

/**
 * Creates a static box with matching visual and collision geometry.
 *
 * The cube geometry has half-extents of 0.25, so the mesh scale converts it
 * to the dimensions used by the collider.
 */
export function createStaticBox(
  engine: Engine,
  scene: Scene,
  cube: Geometry,
  material: Material,
  options: StaticBoxOptions,
): StaticBody {
  const node = scene.createNode();
  const body = scene.createStaticBody();
  const mesh = engine.createMesh(cube, material);

  node.transform.position.setXyz(options.position[0], options.position[1], options.position[2]);
  node.transform.scale.setXyz(
    options.halfExtents[0] / cubeHalfExtent,
    options.halfExtents[1] / cubeHalfExtent,
    options.halfExtents[2] / cubeHalfExtent,
  );
  node.addComponent(mesh);
  node.addComponent(body);
  node.addComponent(new BoxCollider({ halfExtents: options.halfExtents }));
  scene.root.addChild(node);

  return body;
}
