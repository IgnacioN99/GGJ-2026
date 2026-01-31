/** Estado de sonido actual de la entidad representativa (ej. Wife) */
export interface WifeState {
  currentSound: number;
  maxSound: number;
}

/** Payload que la Wife emite al añadir/reducir sonido */
export interface WifeSoundStateUpdate extends WifeState {
  amount: number;
}

enum WifeEventTypes {
  SoundAdded = 'wife:soundAdded',
  SoundReduced = 'wife:soundReduced',
  Overwhelmed = 'wife:overwhelmed',
  Reset = 'wife:reset'
}

/** Acción: añadir sonido (escena → Wife). Payload = amount. */
type SoundAddedAction = {
  type: WifeEventTypes.SoundAdded;
  payload: number;
};

/** Acción: reducir sonido (escena → Wife). Payload = amount. */
type SoundReducedAction = {
  type: WifeEventTypes.SoundReduced;
  payload: number;
};

/** Acción: Wife abrumada (Wife → listeners). Sin payload. */
type OverwhelmedAction = {
  type: WifeEventTypes.Overwhelmed;
};

/** Acción: reset de sonido (Wife → listeners). */
type ResetAction = {
  type: WifeEventTypes.Reset;
  payload: WifeState;
};

/** Acciones que la Wife escucha desde la escena (comandos). */
type WifeSceneAction = SoundAddedAction | SoundReducedAction;

/** Acciones que la Wife emite (eventos de estado). */
type WifeEmittedSoundAddedAction = {
  type: WifeEventTypes.SoundAdded;
  payload: WifeSoundStateUpdate;
};
type WifeEmittedSoundReducedAction = {
  type: WifeEventTypes.SoundReduced;
  payload: WifeSoundStateUpdate;
};
type WifeEmittedAction =
  | WifeEmittedSoundAddedAction
  | WifeEmittedSoundReducedAction
  | OverwhelmedAction
  | ResetAction;

export { WifeEventTypes };
export type {
  WifeSceneAction,
  WifeEmittedAction,
  SoundAddedAction,
  SoundReducedAction,
  OverwhelmedAction,
  ResetAction,
  WifeEmittedSoundAddedAction,
  WifeEmittedSoundReducedAction
};
