export class Keyboard {
    public static keys: { [key: string]: boolean } = {};

    public static initialize() {
        window.addEventListener("keydown", Keyboard.onKeyDown);
        window.addEventListener("keyup", Keyboard.onKeyUp);
    }

    private static onKeyDown(event: KeyboardEvent) {
        Keyboard.keys[event.code] = true;
    }

    private static onKeyUp(event: KeyboardEvent) {
        Keyboard.keys[event.code] = false;
    }

    public static isKeyDown(key: string): boolean {
        return Keyboard.keys[key] === true;
    }
}
