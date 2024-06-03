import {
  Container,
  Ticker,
  Text,
  TextStyle,
  TilingSprite,
  Texture,
  Sprite,
  Rectangle,
  DisplayObject,
  Graphics,
} from "pixi.js";
import { Character } from "../objects/Character";
import { JoystickController } from "../controls/JoystickController";
import { KeyboardController } from "../controls/KeyboardController";
import { Obstacle } from "../objects/Obstacle";
import { Bonus } from "../objects/Bonus";
import * as sound from "@pixi/sound";

export class Scene extends Container {
  private character: Character;
  private joystickController: JoystickController;
  private screenWidth: number;
  private screenHeight: number;
  private obstacles: Obstacle[] = [];
  private bonuses: Bonus[] = [];
  private obstacleSpawnInterval: number = 5700;
  private bonusSpawnInterval: number = 7700;
  private lastObstacleSpawnTime: number = 0;
  private lastBonusSpawnTime: number = 0;
  private score: number = 0;
  private scoreText: Text;
  private positiveScoreStyle: TextStyle;
  private negativeScoreStyle: TextStyle;
  private velocity: { x: number; y: number } = { x: 0, y: 0 };
  private maxSpeed: number = 6;
  private acceleration: number = 0.9;
  private friction: number = 0.98;
  private background: TilingSprite;
  private backgroundObjects: Sprite[] = [];
  private treeTexture: Texture;
  private normalRockTexture: Texture;
  private snowTreeTexture: Texture;
  private isPaused: boolean = false;
  private isMuted: boolean = false;
  private muteButton!: Text;
  private pauseButton!: Text;
  private backgroundMusic: sound.Sound;

  constructor(screenWidth: number, screenHeight: number) {
    super();

    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    const texture = Texture.from("igloo.png");
    this.background = new TilingSprite(texture, screenWidth, screenHeight);
    this.addChild(this.background);

    this.treeTexture = Texture.from("tree.png");
    this.normalRockTexture = Texture.from("normal_rock.png");
    this.snowTreeTexture = Texture.from("snow_tree.png");
    this.addRandomTrees();

    this.joystickController = new JoystickController(100, 50);
    this.joystickController.x = screenWidth - 150;
    this.joystickController.y = screenHeight - 150;
    this.addChild(this.joystickController);

    this.character = new Character();
    this.character.x = screenWidth / 2;
    this.character.y = screenHeight / 2;
    this.addChild(this.character);

    KeyboardController.initialize();

    this.positiveScoreStyle = new TextStyle({
      fontSize: 36,
      fill: "#00FF00",
    });

    this.negativeScoreStyle = new TextStyle({
      fontSize: 36,
      fill: "#FF0000",
    });

    this.scoreText = new Text(`Score: ${this.score}`, this.positiveScoreStyle);
    this.scoreText.x = 20;
    this.scoreText.y = 20;
    this.addChild(this.scoreText);

    this.createControlButtons();

    this.backgroundMusic = sound.Sound.from("sound/background_music_sound.mp3");
    this.backgroundMusic.play({ loop: true, volume: 0.5 });

    Ticker.shared.add(this.update.bind(this));
  }

  private createControlButtons() {
    const buttonStyle = new TextStyle({
      fontSize: 24,
      fill: 0xffffff,
    });

    const pauseButtonBg = new Graphics();
    pauseButtonBg.beginFill(0x000000);
    pauseButtonBg.drawRect(0, 0, 100, 40);
    pauseButtonBg.endFill();
    pauseButtonBg.x = this.screenWidth - 120;
    pauseButtonBg.y = 20;
    pauseButtonBg.interactive = true;
    pauseButtonBg.cursor = "pointer";
    pauseButtonBg.on("pointerdown", this.togglePause.bind(this));
    this.addChild(pauseButtonBg);

    this.pauseButton = new Text("Pause", buttonStyle);
    this.pauseButton.x = this.screenWidth - 110;
    this.pauseButton.y = 25;
    this.addChild(this.pauseButton);

    const muteButtonBg = new Graphics();
    muteButtonBg.beginFill(0x000000);
    muteButtonBg.drawRect(0, 0, 100, 40);
    muteButtonBg.endFill();
    muteButtonBg.x = this.screenWidth - 120;
    muteButtonBg.y = 70;
    muteButtonBg.interactive = true;
    muteButtonBg.cursor = "pointer";
    muteButtonBg.on("pointerdown", this.toggleMute.bind(this));
    this.addChild(muteButtonBg);

    this.muteButton = new Text("Mute", buttonStyle);
    this.muteButton.x = this.screenWidth - 110;
    this.muteButton.y = 75;
    this.addChild(this.muteButton);
  }

  private togglePause() {
    this.isPaused = !this.isPaused;
    this.pauseButton.text = this.isPaused ? "Resume" : "Pause";
  }

  private toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.backgroundMusic.volume = 0;
      this.muteButton.text = "Unmute";
    } else {
      this.backgroundMusic.volume = 0.5;
      this.muteButton.text = "Mute";
    }
  }

  private addRandomTrees() {
    const minTrees = 4;
    const maxTrees = 5;
    const treeDensity = 1000;

    const idealTreeCount = Math.ceil(
      (this.screenWidth * this.screenHeight) / treeDensity
    );

    const treeCount = Math.min(maxTrees, Math.max(minTrees, idealTreeCount));

    this.backgroundObjects.forEach((tree) => this.removeChild(tree));
    this.backgroundObjects = [];

    for (let i = 0; i < treeCount; i++) {
      let object;
      if (i % 2 == 0) {
        object = new Sprite(this.treeTexture);
      } else {
        let randomNumber = this.getRandomNumber();
        if (randomNumber == 0) {
          object = new Sprite(this.normalRockTexture);
        } else {
          object = new Sprite(this.snowTreeTexture);
        }
      }
      object.anchor.set(0.5, 1);

      object.x = Math.random() * this.screenWidth;
      object.y = Math.random() * this.screenHeight;

      this.addChild(object);
      this.backgroundObjects.push(object);
    }
  }

  private getRandomNumber(): number {
    return Math.floor(Math.random() * 11);
  }

  private update(deltaTime: number) {
    if (this.isPaused) {
      return;
    }

    const joystickDirection = this.joystickController.getDirection();
    let direction = { x: joystickDirection.x, y: joystickDirection.y };

    if (KeyboardController.isKeyDown("ArrowUp")) {
      direction.y = -1;
    } else if (KeyboardController.isKeyDown("ArrowDown")) {
      direction.y = 1;
    }

    if (KeyboardController.isKeyDown("ArrowLeft")) {
      direction.x = -1;
    } else if (KeyboardController.isKeyDown("ArrowRight")) {
      direction.x = 1;
    }

    const magnitude = Math.sqrt(
      direction.x * direction.x + direction.y * direction.y
    );
    if (magnitude > 1) {
      direction.x /= magnitude;
      direction.y /= magnitude;
    }

    this.velocity.x += direction.x * this.acceleration;
    this.velocity.y += direction.y * this.acceleration;

    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;

    this.velocity.x = Math.max(
      -this.maxSpeed,
      Math.min(this.maxSpeed, this.velocity.x)
    );
    this.velocity.y = Math.max(
      -this.maxSpeed,
      Math.min(this.maxSpeed, this.velocity.y)
    );

    const moveX = this.velocity.x * deltaTime;
    const moveY = this.velocity.y * deltaTime;
    this.background.tilePosition.x -= moveX;
    this.background.tilePosition.y -= moveY;

    this.wrapObjects(this.backgroundObjects, moveX, moveY);
    this.wrapObjects(this.obstacles, moveX, moveY);
    this.wrapObjects(this.bonuses, moveX, moveY);

    this.character.update(deltaTime, direction);
    this.updateObstacles(deltaTime);
    this.updateBonuses(deltaTime);

    if (Date.now() - this.lastObstacleSpawnTime > this.obstacleSpawnInterval) {
      this.spawnObstacle();
      this.lastObstacleSpawnTime = Date.now();
    }

    if (Date.now() - this.lastBonusSpawnTime > this.bonusSpawnInterval) {
      this.spawnBonus();
      this.lastBonusSpawnTime = Date.now();
    }

    this.checkCollisions();
    this.checkBonusCollisions();

    this.character.x = this.screenWidth / 2;
    this.character.y = this.screenHeight / 2.3;
  }

  private wrapObjects(objects: DisplayObject[], moveX: number, moveY: number) {
    objects.forEach((object) => {
      object.x -= moveX;
      object.y -= moveY;

      // Check if the object has width and height properties
      if ("width" in object && "height" in object) {
        const obj = object as DisplayObject & {
          width: number;
          height: number;
        };

        if (obj.x + obj.width < 0) {
          obj.x += this.screenWidth + obj.width * 2;
        } else if (obj.x - obj.width > this.screenWidth) {
          obj.x -= this.screenWidth + obj.width * 2;
        }

        if (obj.y + obj.height < 0) {
          obj.y += this.screenHeight + obj.height * 2;
        } else if (obj.y - obj.height > this.screenHeight) {
          obj.y -= this.screenHeight + obj.height * 2;
        }
      }
    });
  }

  private updateObstacles(deltaTime: number) {
    this.obstacles.forEach((obstacle) => obstacle.update(deltaTime));
  }

  private updateBonuses(deltaTime: number) {
    this.bonuses.forEach((bonus) => bonus.update(deltaTime));
  }

  private spawnObstacle() {
    const radius = Math.random() * 20 + 10;
    const obstacle = new Obstacle(radius);
    obstacle.x = Math.random() * (this.screenWidth - radius * 2) + radius;
    obstacle.y = -radius;
    this.obstacles.push(obstacle);
    this.addChild(obstacle);
  }

  private spawnBonus() {
    const size = Math.random() * 20 + 10;
    const bonus = new Bonus(size);
    bonus.x = Math.random() * (this.screenWidth - size * 2) + size;
    bonus.y = -size;
    this.bonuses.push(bonus);
    this.addChild(bonus);
  }

  private checkCollisions() {
    const characterBounds = this.character.getBounds();
  
    // Check collisions with obstacles
    this.obstacles.forEach((obstacle, index) => {
      const obstacleBounds = obstacle.getBounds();
      if (this.isColliding(characterBounds, obstacleBounds)) {
        console.log("Collision with obstacle!");
        this.score -= 1;
  
        // Play hitting obstacle sound
        sound.Sound.from("sound/hitting_obstacle_sound.mp3").play({
          volume: 0.7,
          speed: 1 + Math.random() * 0.2 - 0.1, // Random speed between 0.9 and 1.1
        });
  
        // Visual feedback: flash the obstacle red
        const originalTint = obstacle.tint;
        obstacle.tint = 0xFF0000; // Red
        setTimeout(() => {
          obstacle.tint = originalTint;
        }, 100);
  
        // Remove the obstacle
        this.removeChild(obstacle);
        this.obstacles.splice(index, 1);
  
        // Apply knockback effect to the character
        const knockbackDirection = {
          x: -this.velocity.x,
          y: -this.velocity.y
        };
        const knockbackMagnitude = 10;
        this.velocity.x += knockbackDirection.x * knockbackMagnitude;
        this.velocity.y += knockbackDirection.y * knockbackMagnitude;
  
        // Update the score text
        this.updateScoreText();
      }
    });
  
    // Check collisions with trees and rocks
    this.backgroundObjects.forEach((object) => {
      const objectBounds = object.getBounds();
      if (this.isColliding(characterBounds, objectBounds)) {
        console.log("Collision with background object!");
        this.score -= 1;
  
        // Play hitting obstacle sound
        sound.Sound.from("sound/hitting_obstacle_sound.mp3").play({
          volume: 0.6,
          speed: 1 + Math.random() * 0.3 - 0.15, // Random speed between 0.85 and 1.15
        });
  
        // Visual feedback: flash the object red
        const originalTint = object.tint;
        object.tint = 0xFF0000; // Red
        setTimeout(() => {
          object.tint = originalTint;
        }, 100);
  
        // Apply knockback effect to the character
        const knockbackDirection = {
          x: -this.velocity.x,
          y: -this.velocity.y
        };
        const knockbackMagnitude = 5; // Smaller knockback for trees/rocks
        this.velocity.x += knockbackDirection.x * knockbackMagnitude;
        this.velocity.y += knockbackDirection.y * knockbackMagnitude;
  
        // Update the score text
        this.updateScoreText();
      }
    });
  }

  private checkBonusCollisions() {
    this.bonuses.forEach((bonus, index) => {
      const characterBounds = this.character.getBounds();
      const bonusBounds = bonus.getBounds();

      if (this.isColliding(characterBounds, bonusBounds)) {
        this.score++;
        this.updateScoreText();
        this.removeChild(bonus);
        this.bonuses.splice(index, 1);
        let bonusGettingSound = sound.Sound.from(
          "sound/bonus_getting_sound.mp3"
        );
        if (!this.isMuted) {
          bonusGettingSound.play({ volume: 0.5 });
        }
      }
    });
  }

  private isColliding(rect1: Rectangle, rect2: Rectangle): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  private updateScoreText() {
    this.scoreText.text = `Score: ${this.score}`;
    this.scoreText.style =
      this.score >= 0 ? this.positiveScoreStyle : this.negativeScoreStyle;
  }

  public getCharacterDirection(): { x: number; y: number } {
    const magnitude = Math.sqrt(
      this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y
    );
    return {
      x: magnitude === 0 ? 0 : this.velocity.x / magnitude,
      y: magnitude === 0 ? 0 : this.velocity.y / magnitude,
    };
  }


}
