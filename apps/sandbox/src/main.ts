import { Mat4, Renderer } from "@hadron/engine";
import "./main.css";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;

const renderer = await Renderer.create(canvas);

const mesh = renderer.createMesh({
  positions: new Float32Array([0, 0.6, 0, -0.6, -0.6, 0, 0.6, -0.6, 0]),
  indices: new Uint16Array([0, 1, 2]),
});

const transform = new Mat4();
const translation = new Mat4();
const rotation = new Mat4();

Mat4.fromTranslation(translation, 0.25, 0, 0);

function render(time: number): void {
  Mat4.fromRotationZ(rotation, time / 1_000);
  Mat4.multiply(transform, translation, rotation);
  mesh.setTransform(transform);
  renderer.render(mesh);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
