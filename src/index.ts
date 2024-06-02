import { Application } from "pixi.js";
import { Scene } from "./scenes/Scene";
import * as sound from "@pixi/sound";

const app = new Application<HTMLCanvasElement>({
  view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  backgroundColor: 0x6495ed,
  width: window.innerWidth,
  height: window.innerHeight,
});

sound.Sound.from({
  url: "sound/background_music_sound.mp3",
  preload: true,
  loaded: (err, audio) => {
    if (!err) {
      audio!.play({
        loop: true,
        volume: 0.5,
      });
    }
  },
});

sound.Sound.from({
  url: "sound/bonus_getting_sound.mp3",
  preload: true,
});

sound.Sound.from({
  url: "sound/hitting_obstacle_sound.mp3",
  preload: true,
});

const scene: Scene = new Scene(app.screen.width, app.screen.height);
app.stage.addChild(scene);
