export enum EnemyTypes {
  CASCABEL = "CASCABEL",
  TAMBOR = "TAMBOR",
  DIABLO = "DIABLO",
}

export const SPEED_BY_TYPE: Record<EnemyTypes, number> = {
  [EnemyTypes.CASCABEL]: 1,
  [EnemyTypes.TAMBOR]: 0.5,
  [EnemyTypes.DIABLO]: 0.8,
};
