import { Container, Graphics, FederatedPointerEvent } from 'pixi.js';

export class JoystickController extends Container {
    private joystickBase: Graphics;
    private joystickKnob: Graphics;
    private knobData: { x: number; y: number } = { x: 0, y: 0 };
    private dragging: boolean = false;

    constructor(radius: number, knobRadius: number) {
        super();
        this.interactive = true;
        this.joystickBase = this.createJoystickBase(radius);
        this.joystickKnob = this.createJoystickKnob(knobRadius);
        this.addChild(this.joystickBase, this.joystickKnob);

        this.on('pointerdown', this.onPointerDown.bind(this));
        this.on('pointermove', this.onPointerMove.bind(this));
        this.on('pointerup', this.onPointerUp.bind(this));
        this.on('pointerupoutside', this.onPointerUp.bind(this));
    }

    private createJoystickBase(radius: number): Graphics {
        const base = new Graphics();
        base.lineStyle(4, 0xcccccc);
        base.drawCircle(0, 0, radius);
        base.endFill();
        return base;
    }

    private createJoystickKnob(radius: number): Graphics {
        const knob = new Graphics();
        knob.beginFill(0xcccccc);
        knob.drawCircle(0, 0, radius);
        knob.endFill();
        return knob;
    }

    private onPointerDown(event: FederatedPointerEvent): void {
        const localPosition = this.toLocal(event.global);
        const distance = Math.sqrt(localPosition.x * localPosition.x + localPosition.y * localPosition.y);
        const baseRadius = this.joystickBase.width / 2;

        if (distance <= baseRadius) {
            this.dragging = true;
            this.moveJoystickKnob(event);
        }
    }

    private onPointerMove(event: FederatedPointerEvent): void {
        if (this.dragging) {
            this.moveJoystickKnob(event);
        }
    }

    private onPointerUp(): void {
        this.dragging = false;
        this.resetJoystickKnob();
    }

    private moveJoystickKnob(event: FederatedPointerEvent): void {
        const knobRadius = this.joystickKnob.width / 2;
        const baseRadius = this.joystickBase.width / 2;
        const maxDistance = baseRadius - knobRadius;

        const localPosition = this.toLocal(event.global);
        const distance = Math.sqrt(localPosition.x * localPosition.x + localPosition.y * localPosition.y);

        if (distance < maxDistance) {
            this.knobData.x = localPosition.x;
            this.knobData.y = localPosition.y;
        } else {
            this.knobData.x = (localPosition.x / distance) * maxDistance;
            this.knobData.y = (localPosition.y / distance) * maxDistance;
        }

        this.joystickKnob.position.set(this.knobData.x, this.knobData.y);
    }

    private resetJoystickKnob(): void {
        this.knobData.x = 0;
        this.knobData.y = 0;
        this.joystickKnob.position.set(0, 0);
    }

    public getDirection(): { x: number; y: number } {
        const knobRadius = this.joystickKnob.width / 2;
        const directionX = this.knobData.x / (this.joystickBase.width / 2 - knobRadius);
        const directionY = this.knobData.y / (this.joystickBase.height / 2 - knobRadius);
        return { x: directionX, y: directionY };
    }
}
