import { Color, Engine, Vec3 } from "@hadron/engine";
import "./main.css";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;

const engine = await Engine.create(canvas);

engine.setLightDirection(new Vec3(0.5, 0.8, 1).normalize());

const cube = engine.createGeometry({
  positions: new Float32Array([
    // front
    -0.25, -0.25, 0.25, 0.25, -0.25, 0.25, 0.25, 0.25, 0.25, -0.25, 0.25, 0.25,
    // back
    0.25, -0.25, -0.25, -0.25, -0.25, -0.25, -0.25, 0.25, -0.25, 0.25, 0.25, -0.25,
    // left
    -0.25, -0.25, -0.25, -0.25, -0.25, 0.25, -0.25, 0.25, 0.25, -0.25, 0.25, -0.25,
    // right
    0.25, -0.25, 0.25, 0.25, -0.25, -0.25, 0.25, 0.25, -0.25, 0.25, 0.25, 0.25,
    // bottom
    -0.25, -0.25, -0.25, 0.25, -0.25, -0.25, 0.25, -0.25, 0.25, -0.25, -0.25, 0.25,
    // top
    -0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, -0.25, -0.25, 0.25, -0.25,
  ]),
  normals: new Float32Array([
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, -1, 0, 0, -1, 0, 0,
    -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
  ]),
  indices: new Uint16Array([
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16,
    18, 19, 20, 21, 22, 20, 22, 23,
  ]),
});

const scene = engine.createScene();
const firstMesh = scene.createMesh(cube);
const secondMesh = scene.createMesh(cube);

firstMesh.setColor(new Color(0.2, 0.7, 1));
secondMesh.setColor(new Color(1, 0.3, 0.2));

const cameraPosition = new Vec3(0, 0.5, 1);
const cameraTarget = new Vec3(0, 0, -2);
const cameraUp = new Vec3(0, 1, 0);
const firstPosition = new Vec3(0.5, 0, -2);
const secondPosition = new Vec3(-0.5, 0, -2);
const firstScale = new Vec3(1, 1.5, 1);
const secondScale = new Vec3(1.5, 1, 1);

scene.camera
  .setPerspective(Math.PI / 3, 0.1, 100)
  .setLookAt(cameraPosition, cameraTarget, cameraUp);

function update(time: number): void {
  firstMesh.transform
    .setTranslation(firstPosition)
    .rotateY(time / 1_000)
    .rotateX(time / 1_500)
    .rotateZ(time / 2_000)
    .scale(firstScale);
  secondMesh.transform
    .setTranslation(secondPosition)
    .rotateY(-time / 2_000)
    .rotateX(-time / 1_200)
    .rotateZ(-time / 1_500)
    .scale(secondScale);
}

engine.start(scene, update);
