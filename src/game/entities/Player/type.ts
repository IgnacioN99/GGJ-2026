export type PlayerDirection = "up" | "down" | "left" | "right";

export const MOVE_SPEED = 180;

/** Eventos que emite el Player */
export enum PlayerEventTypes {
  /** El player llegó a su destino */
  ArrivedAtDestination = "player:arrivedAtDestination",
  /** El player fue bloqueado (usando item) */
  Blocked = "player:blocked",
  /** El player fue desbloqueado */
  Unblocked = "player:unblocked",
  /** El player equipó un item */
  ItemEquipped = "player:itemEquipped",
  /** El player desequipó un item */
  ItemUnequipped = "player:itemUnequipped",
  /** El player entró en cooldown global (no puede equipar items) */
  GlobalCooldownStarted = "player:globalCooldownStarted",
  /** El cooldown global terminó */
  GlobalCooldownEnded = "player:globalCooldownEnded",
}

/** Payload para evento de llegada */
export interface ArrivedAtDestinationPayload {
  x: number;
  y: number;
}

export type ArrivedAtDestinationAction = {
  type: PlayerEventTypes.ArrivedAtDestination;
  payload: ArrivedAtDestinationPayload;
};

export type BlockedAction = {
  type: PlayerEventTypes.Blocked;
};

export type UnblockedAction = {
  type: PlayerEventTypes.Unblocked;
};

export type PlayerEmittedAction =
  | ArrivedAtDestinationAction
  | BlockedAction
  | UnblockedAction;
