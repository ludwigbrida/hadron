import { Color, Engine, Vector3, type Frame } from "@hadron/engine";
import { loadCubeTexture, loadTexture } from "./assets/load-texture.ts";
import "./main.css";
import { PlayerController } from "./player/player-controller.ts";
import { createCubeGeometry } from "./scene/create-cube-geometry.ts";
import { createPyramid } from "./scene/create-pyramid.ts";
import { createStaticBox } from "./scene/create-static-box.ts";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;

const engine = await Engine.create(canvas);

const groundTexture = await loadTexture(engine, "/assets/stone.png", {
  addressModeU: "repeat",
  addressModeV: "repeat",
});
const skyTexture = await loadCubeTexture(engine, {
  positiveX: "/assets/sky/positive-x.png",
  negativeX: "/assets/sky/negative-x.png",
  positiveY: "/assets/sky/positive-y.png",
  negativeY: "/assets/sky/negative-y.png",
  positiveZ: "/assets/sky/positive-z.png",
  negativeZ: "/assets/sky/negative-z.png",
});

const cube = createCubeGeometry(engine);

const ground = engine.createGeometry({
  positions: new Float32Array([-10, -1, -10, 10, -1, -10, 10, -1, 10, -10, -1, 10]),
  normals: new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]),
  texCoords: new Float32Array([0, 0, 10, 0, 10, 10, 0, 10]),
  indices: new Uint16Array([0, 2, 1, 0, 3, 2]),
});

const scene = engine.createScene();
const directionalLight = scene.createDirectionalLight();
scene.root.addChild(directionalLight);
scene.setSky(skyTexture);
const blueMaterial = engine.createMaterial(new Color(0.2, 0.7, 1));
const redMaterial = engine.createMaterial(new Color(1, 0.3, 0.2));
const groundMaterial = engine.createMaterial(new Color(1, 1, 1), {
  baseColorTexture: groundTexture,
});
const cubeGroup = scene.createNode();
const firstMesh = engine.createMesh(cube, blueMaterial);
const secondMesh = engine.createMesh(cube, redMaterial);
const groundMesh = engine.createMesh(ground, groundMaterial);
const groundBody = scene.createStaticBody();
const player = new PlayerController(scene, engine.input);

firstMesh.transform.position.setXyz(0.5, 0, -2);
firstMesh.transform.scale.setXyz(1, 1.5, 1);
secondMesh.transform.position.setXyz(-0.5, 0, -2);
secondMesh.transform.scale.setXyz(1.5, 1, 1);
groundBody.transform.position.setXyz(0, -1.25, 0);
groundBody.createBoxCollider({ halfExtents: new Vector3(10, 0.25, 10) });

createPyramid(engine, scene, cube, groundMaterial);

createStaticBox(engine, scene, cube, groundMaterial, {
  halfExtents: new Vector3(4, 2, 0.25),
  position: new Vector3(0, 1, -9),
});
cubeGroup.addChild(firstMesh).addChild(secondMesh);
scene.root.addChild(cubeGroup);
scene.root.addChild(groundMesh);
scene.root.addChild(groundBody);

directionalLight.transform.rotation.setXyz(-0.62, 0.46, 0);

canvas.addEventListener("click", () => {
  void engine.input.requestPointerLock();
});

function update({ elapsedTime, deltaTime }: Frame): void {
  player.update(deltaTime);

  firstMesh.transform.rotation.setXyz(elapsedTime / 1.5, elapsedTime, elapsedTime / 2);
  secondMesh.transform.rotation.setXyz(-elapsedTime / 1.2, -elapsedTime / 2, -elapsedTime / 1.5);
  cubeGroup.transform.rotation.setXyz(0, elapsedTime / 4, 0);
}

engine.start(scene, update);
