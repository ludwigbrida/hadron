import { Mat4, Renderer } from "@hadron/engine";
import "./main.css";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;

const renderer = await Renderer.create(canvas);

const triangle = {
  positions: new Float32Array([0, 0.6, 0, -0.6, -0.6, 0, 0.6, -0.6, 0]),
  indices: new Uint16Array([0, 1, 2]),
};

const firstMesh = renderer.createMesh(triangle);
const secondMesh = renderer.createMesh(triangle);
const meshes = [firstMesh, secondMesh];

const firstTransform = new Mat4();
const firstTranslation = new Mat4();
const firstRotation = new Mat4();
const secondTransform = new Mat4();
const secondTranslation = new Mat4();
const secondRotation = new Mat4();

Mat4.fromTranslation(firstTranslation, 0.25, 0, 0);
Mat4.fromTranslation(secondTranslation, -0.25, 0, 0);

function render(time: number): void {
  Mat4.fromRotationZ(firstRotation, time / 1_000);
  Mat4.multiply(firstTransform, firstTranslation, firstRotation);
  firstMesh.setTransform(firstTransform);

  Mat4.fromRotationZ(secondRotation, -time / 2_000);
  Mat4.multiply(secondTransform, secondTranslation, secondRotation);
  secondMesh.setTransform(secondTransform);

  renderer.render(meshes);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
