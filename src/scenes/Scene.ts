import { Container, Ticker, Text, TextStyle, TilingSprite, Texture } from 'pixi.js';
import { Character } from '../objects/Character';
import { JoystickController } from '../controls/JoystickController';
import { Keyboard } from '../controls/KeyboardController';
import { Obstacle } from '../objects/Obstacle';
import { Bonus } from '../objects/Bonus';
import * as PIXI from 'pixi.js';

export class Scene extends Container {
    private character: Character;
    private joystickController: JoystickController;
    private screenWidth: number;
    private screenHeight: number;
    private obstacles: Obstacle[] = [];
    private bonuses: Bonus[] = [];
    private obstacleSpawnInterval: number = 1000;
    private bonusSpawnInterval: number = 1000;
    private lastObstacleSpawnTime: number = 0;
    private lastBonusSpawnTime: number = 0;
    private score: number = 0;
    private scoreText: Text;
    private positiveScoreStyle: TextStyle;
    private negativeScoreStyle: TextStyle;
    private velocity: { x: number, y: number } = { x: 0, y: 0 };
    private maxSpeed: number = 6;
    private acceleration: number = 0.4;
    private friction: number = 0.98;
    private background: TilingSprite;

    constructor(screenWidth: number, screenHeight: number) {
        super();

        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        const texture = Texture.from('igloo.png');
        this.background = new TilingSprite(texture, screenWidth, screenHeight);
        this.addChild(this.background);

        this.joystickController = new JoystickController(100, 50);
        this.joystickController.x = screenWidth - 150; 
        this.joystickController.y = screenHeight - 150; 
        this.addChild(this.joystickController);

        this.character = new Character();
        this.character.x = screenWidth / 2;
        this.character.y = screenHeight / 2;
        this.addChild(this.character);

        Keyboard.initialize();

        this.positiveScoreStyle = new TextStyle({
            fontSize: 36,
            fill: '#00FF00', 
        });

        this.negativeScoreStyle = new TextStyle({
            fontSize: 36,
            fill: '#FF0000',
        });

        this.scoreText = new Text(`Score: ${this.score}`, this.positiveScoreStyle);
        this.scoreText.x = 20;
        this.scoreText.y = 20;
        this.addChild(this.scoreText);

        Ticker.shared.add(this.update.bind(this));
    }

    private update(deltaTime: number) {
        const joystickDirection = this.joystickController.getDirection();
        let direction = { x: joystickDirection.x, y: joystickDirection.y };
    
        if (Keyboard.isKeyDown('ArrowUp')) {
            direction.y = -1;
        } else if (Keyboard.isKeyDown('ArrowDown')) {
            direction.y = 1;
        }
    
        if (Keyboard.isKeyDown('ArrowLeft')) {
            direction.x = -1;
        } else if (Keyboard.isKeyDown('ArrowRight')) {
            direction.x = 1;
        }
    
        const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        if (magnitude > 1) {
            direction.x /= magnitude;
            direction.y /= magnitude;
        }
    
        // Update velocity based on direction
        this.velocity.x += direction.x * this.acceleration;
        this.velocity.y += direction.y * this.acceleration;
    
        // Apply friction
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
    
        // Clamp the velocity to max speed
        this.velocity.x = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.velocity.x));
        this.velocity.y = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.velocity.y));
    
        // Update the character's position based on velocity
        this.character.x += this.velocity.x * deltaTime;
        this.character.y += this.velocity.y * deltaTime;
    
        // Update the background position based on character's movement
        this.background.tilePosition.x -= this.velocity.x * deltaTime;
        this.background.tilePosition.y -= this.velocity.y * deltaTime;
    
        // Clamp the character's position within the screen boundaries
        const characterWidth = this.character.width;
        const characterHeight = this.character.height;
    
        this.character.x = Math.max(0, Math.min(this.screenWidth - characterWidth, this.character.x));
        this.character.y = Math.max(0, Math.min(this.screenHeight - characterHeight, this.character.y));
    
        this.character.update(deltaTime, direction);
    
        // Update obstacles and bonuses
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
    
        this.updateScoreText();
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
        const size = Math.random() * 10 + 10; 
        const bonus = new Bonus(size);
        bonus.x = Math.random() * (this.screenWidth - size * 2) + size;
        bonus.y = -size; 
        this.bonuses.push(bonus);
        this.addChild(bonus);
    }

    private updateObstacles(deltaTime: number) {
        this.obstacles.forEach(obstacle => {
            obstacle.update(deltaTime);
        });
        this.obstacles = this.obstacles.filter(obstacle => obstacle.y <= this.screenHeight + obstacle.height);
    }

    private updateBonuses(deltaTime: number) {
        this.bonuses.forEach(bonus => {
            bonus.update(deltaTime);
        });
        this.bonuses = this.bonuses.filter(bonus => bonus.y <= this.screenHeight + bonus.height);
    }

    private checkCollisions() {
        const characterBounds = this.character.getBounds();

        this.obstacles.forEach(obstacle => {
            const obstacleBounds = obstacle.getBounds();
            if (this.isColliding(characterBounds, obstacleBounds)) {
                console.log('Collision detected!');
                this.score -= 100;
                // need to break the obstacle if collided
                this.removeChild(obstacle);
                this.obstacles = this.obstacles.filter(o => o !== obstacle);
            }
        });
    }

    private checkBonusCollisions() {
        const characterBounds = this.character.getBounds();

        this.bonuses.forEach(bonus => {
            const bonusBounds = bonus.getBounds();
            if (this.isColliding(characterBounds, bonusBounds)) {
                console.log('Bonus collected!');
                this.score += 50;
                this.removeChild(bonus);
                this.bonuses = this.bonuses.filter(b => b !== bonus);
            }
        });
    }

    private updateScoreText() {
        if (this.score >= 0) {
            this.scoreText.style = this.positiveScoreStyle;
        } else {
            this.scoreText.style = this.negativeScoreStyle;
        }
        this.scoreText.text = `Score: ${this.score}`;
    }

    private isColliding(rect1: PIXI.Rectangle, rect2: PIXI.Rectangle): boolean {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    public getCharacterDirection(): { x: number; y: number } {
        const magnitude = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        return {
            x: magnitude === 0 ? 0 : this.velocity.x / magnitude,
            y: magnitude === 0 ? 0 : this.velocity.y / magnitude
        };
    }
}
