import { Container, Sprite } from 'pixi.js';

export class Character extends Container {
    private sprite: Sprite;
    private speed: number = 3;
    private rotationAngle: number = 0; 
    private rotationSpeed: number = 0.05;

    constructor() {
        super();
        this.sprite = Sprite.from('hero.png');
        this.addChild(this.sprite);
    }

    public update(deltaTime: number, direction: { x: number; y: number }) {
        this.x += direction.x * this.speed * deltaTime;
        this.y += direction.y * this.speed * deltaTime;

        if (direction.x < 0 && direction.y < 0) {
            this.rotationAngle = Math.PI / 12; 
        } else if (direction.x > 0 && direction.y < 0) {
            this.rotationAngle = -Math.PI / 12;
        } else if (direction.x > 0 && direction.y > 0) {
            this.rotationAngle = Math.PI / 12; 
        } else if (direction.x < 0 && direction.y > 0) {
            this.rotationAngle = -Math.PI / 12; 
        } else {
            this.rotationAngle = 0;
        }

        this.sprite.rotation = this.lerpRotation(this.sprite.rotation, this.rotationAngle, this.rotationSpeed);
    }

    private lerpRotation(start: number, end: number, t: number): number {
        t = Math.max(0, Math.min(1, t));
        return start + (end - start) * t;
    }
}
