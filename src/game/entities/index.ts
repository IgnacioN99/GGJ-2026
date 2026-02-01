import Player from "./Player";

export { default as Player } from "./Player";
export { PlayerEventTypes } from "./Player";
export type {
  PlayerDirection,
  PlayerEmittedAction,
  ArrivedAtDestinationAction,
  BlockedAction,
  UnblockedAction,
} from "./Player";

export {
  Wife,
  DEFAULT_MAX_SOUND,
  WifeEventTypes,
  soundAdded,
  soundReduced,
} from "./Wife";
export type { WifeState, WifeSceneAction, WifeEmittedAction } from "./Wife";

export { WifeLifeDisplay } from "./WifeLifeDisplay";
export type { WifeLifeDisplayConfig } from "./WifeLifeDisplay";

export { VolumeDisplay, VOLUME_IMAGE_KEYS, getVolumeImageIndex } from "./VolumeDisplay";
export type { VolumeDisplayConfig } from "./VolumeDisplay";

export { BaseItem, ItemEventTypes, ItemTypes } from "./Item";
export type {
  ItemConfig,
  ItemState,
  ItemEventPayload,
  ItemEmittedAction,
} from "./Item";

export { Escoba, DEFAULT_ESCOBA_CONFIG } from "./Item/Escoba";
export type { EscobaConfig } from "./Item/Escoba";

export { Manguera, DEFAULT_MANGUERA_CONFIG } from "./Item/Manguera";
export type { MangueraConfig } from "./Item/Manguera";

export default {
  player: Player,
};
