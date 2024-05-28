import { Graphics, Container } from "pixi.js";

export class Bonus extends Container {
  constructor(size: number) {
    super();
    const diamond = new Graphics();
    diamond.beginFill(0xffff00);
    diamond.drawPolygon([0, -size, size, 0, 0, size, -size, 0]);
    diamond.endFill();
    this.addChild(diamond);
  }

  public update(deltaTime: number) {
    this.y += 3 * deltaTime;
  }
}
