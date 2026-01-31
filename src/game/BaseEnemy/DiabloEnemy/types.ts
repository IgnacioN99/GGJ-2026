import { BaseEnemy } from "../index";
import { EnemyTypes, SPEED_BY_TYPE } from "../types";

export class DiabloEnemy extends BaseEnemy {
  constructor() {
    super();
    this.type = EnemyTypes.DIABLO;
    this.speed = SPEED_BY_TYPE[this.type];
    this.spritePath = "enemies/diablo/sprite.png";
  }

  move(): void {
    throw new Error("Method not implemented.");
  }
}
