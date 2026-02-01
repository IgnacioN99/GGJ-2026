export interface ItemConfig {
  /** Cooldown en milisegundos después de usar el item */
  cooldownMs: number;
  /** Duración del uso del item en milisegundos (tiempo que tarda en activarse) */
  useDurationMs: number;
  /** Si al terminar el uso bloquea equipar otros items (cooldown global). Default: true. */
  blocksItems?: boolean;
}

export type ItemState = "ready" | "using" | "cooldown";

/** Tipos de items disponibles */
export enum ItemTypes {
  ESCOBA = "ESCOBA",
  MANGUERA = "MANGUERA",
}

/** Eventos que emite el Item */
export enum ItemEventTypes {
  /** El item comenzó a usarse */
  UseStarted = "item:useStarted",
  /** El item terminó de usarse (efecto aplicado) */
  UseCompleted = "item:useCompleted",
  /** El cooldown del item terminó */
  CooldownComplete = "item:cooldownComplete",
  /** El item fue equipado */
  Equipped = "item:equipped",
  /** El item fue desequipado */
  Unequipped = "item:unequipped",
}

/** Payload base para eventos de item */
export interface ItemEventPayload {
  itemType: ItemTypes;
}

/** Acción: uso iniciado */
export type UseStartedAction = {
  type: ItemEventTypes.UseStarted;
  payload: ItemEventPayload;
};

/** Acción: uso completado */
export type UseCompletedAction = {
  type: ItemEventTypes.UseCompleted;
  payload: ItemEventPayload;
};

/** Acción: cooldown terminado */
export type CooldownCompleteAction = {
  type: ItemEventTypes.CooldownComplete;
  payload: ItemEventPayload;
};

/** Acción: item equipado */
export type EquippedAction = {
  type: ItemEventTypes.Equipped;
  payload: ItemEventPayload;
};

/** Acción: item desequipado */
export type UnequippedAction = {
  type: ItemEventTypes.Unequipped;
  payload: ItemEventPayload;
};

/** Todas las acciones que un item puede emitir */
export type ItemEmittedAction =
  | UseStartedAction
  | UseCompletedAction
  | CooldownCompleteAction
  | EquippedAction
  | UnequippedAction;
