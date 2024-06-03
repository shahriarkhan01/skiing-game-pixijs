import { Graphics, Container } from "pixi.js";

export class Bonus extends Container {
  constructor(size: number) {
    super();
    const snowflake = new Graphics();
    
    // Define color for snowflake
    const snowflakeColor = 0xADD8E6; // Light blue color for snowflakes

    // Function to draw a single branch
    const drawBranch = (graphics: Graphics, startX: number, startY: number, length: number, angle: number) => {
      graphics.moveTo(startX, startY);
      const endX = startX + length * Math.cos(angle);
      const endY = startY + length * Math.sin(angle);
      graphics.lineTo(endX, endY);

      // Add smaller branches
      const branchLength = length * 0.3;
      const branchAngle = Math.PI / 6; // 30 degrees

      const leftBranchAngle = angle - branchAngle;
      const rightBranchAngle = angle + branchAngle;

      graphics.moveTo(endX, endY);
      graphics.lineTo(endX + branchLength * Math.cos(leftBranchAngle), endY + branchLength * Math.sin(leftBranchAngle));
      
      graphics.moveTo(endX, endY);
      graphics.lineTo(endX + branchLength * Math.cos(rightBranchAngle), endY + branchLength * Math.sin(rightBranchAngle));
    };

    // Set line style and color
    snowflake.lineStyle(2, snowflakeColor);

    // Draw the six main branches of the snowflake
    const mainBranchLength = size;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      drawBranch(snowflake, 0, 0, mainBranchLength, angle);

      // Draw smaller branches on each main branch
      const subBranchLength = mainBranchLength * 0.5;
      const subBranchOffset = mainBranchLength * 0.5;
      
      const subBranchStartX = subBranchOffset * Math.cos(angle);
      const subBranchStartY = subBranchOffset * Math.sin(angle);
      drawBranch(snowflake, subBranchStartX, subBranchStartY, subBranchLength, angle + Math.PI / 6);
      drawBranch(snowflake, subBranchStartX, subBranchStartY, subBranchLength, angle - Math.PI / 6);
    }

    snowflake.endFill();
    this.addChild(snowflake);
  }

  public update(deltaTime: number) {
    this.y += 3 * deltaTime;
  }
}
