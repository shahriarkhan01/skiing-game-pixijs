import { Graphics } from "pixi.js";

export class Obstacle extends Graphics {
  constructor(radius: number, color: number = 0xffffff) {
    super();
    this.beginFill(color);
    this.drawCircle(0, 0, radius);
    this.endFill();
  }

  public update(deltaTime: number) {
    this.y += deltaTime * 3;
    this.x += -deltaTime * 3;
  }
}
