import { Renderer } from "@hadron/engine";
import "./main.css";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;

const renderer = await Renderer.create(canvas);

const mesh = renderer.createMesh({
  positions: new Float32Array([0, 0.6, 0, -0.6, -0.6, 0, 0.6, -0.6, 0]),
  indices: new Uint16Array([0, 1, 2]),
});

renderer.render(mesh);
