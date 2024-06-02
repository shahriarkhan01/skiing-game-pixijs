import { Application } from "pixi.js";
import { Scene } from "./scenes/Scene";

const app = new Application<HTMLCanvasElement>({
  view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  backgroundColor: 0x6495ed,
  width: window.innerWidth,
  height: window.innerHeight,
});

const scene: Scene = new Scene(app.screen.width, app.screen.height);
app.stage.addChild(scene);
