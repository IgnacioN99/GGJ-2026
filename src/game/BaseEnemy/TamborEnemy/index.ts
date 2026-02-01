import { BaseEnemy } from "../index";
import { EnemyTypes, SPEED_BY_TYPE } from "../types";

export class TamborEnemy extends BaseEnemy {
  constructor() {
    super();
    this.type = EnemyTypes.TAMBOR;
    this.speed = SPEED_BY_TYPE[this.type];
    this.spritePath = "enemies/tambor/sprite.png";
  }
}
