import Player from './Player';

export { default as Player } from './Player';
export {
  Wife,
  DEFAULT_MAX_SOUND,
  WifeEventTypes,
  soundAdded,
  soundReduced
} from './Wife';
export type { WifeState, WifeSceneAction, WifeEmittedAction } from './Wife';
export { WifeLifeDisplay } from './WifeLifeDisplay';
export type { WifeLifeDisplayConfig } from './WifeLifeDisplay';

export default {
  player: Player
};
