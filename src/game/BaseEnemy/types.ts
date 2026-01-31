export enum EnemyTypes {
  CASCABEL = "CASCABEL",
  TAMBOR = "TAMBOR",
  DIABLO = "DIABLO",
}

export const SPEED_BY_TYPE: Record<EnemyTypes, number> = {
  [EnemyTypes.CASCABEL]: 5,
  [EnemyTypes.TAMBOR]: 5,
  [EnemyTypes.DIABLO]: 5,
};
