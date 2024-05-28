export class KeyboardController {
  public static keys: { [key: string]: boolean } = {};

  public static initialize() {
    window.addEventListener("keydown", KeyboardController.onKeyDown);
    window.addEventListener("keyup", KeyboardController.onKeyUp);
  }

  private static onKeyDown(event: KeyboardEvent) {
    KeyboardController.keys[event.code] = true;
  }

  private static onKeyUp(event: KeyboardEvent) {
    KeyboardController.keys[event.code] = false;
  }

  public static isKeyDown(key: string): boolean {
    return KeyboardController.keys[key] === true;
  }
}
