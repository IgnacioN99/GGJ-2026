import { BaseEnemy } from "../index";
import { EnemyTypes, SPEED_BY_TYPE } from "../types";

export class CascabelEnemy extends BaseEnemy {
  static spritePath = "enemies/cascabel/sprite.png";
  constructor() {
    super();
    this.type = EnemyTypes.CASCABEL;
    this.speed = SPEED_BY_TYPE[this.type];
    this.spritePath = CascabelEnemy.spritePath;
  }

  move(): void {
    throw new Error("Method not implemented.");
  }

  getDistanceToHouse(): void {
    throw new Error("Method not implemented.");
  }
}
