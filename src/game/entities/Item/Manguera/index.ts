import { BaseItem } from "../index";
import { ItemTypes } from "../type";
import type { MangueraConfig } from "./type";
import { DEFAULT_MANGUERA_CONFIG } from "./type";

/**
 * Item Manguera: rocía agua para apagar enemigos o limpiar áreas.
 * Después de usarlo activa cooldown global (no puede equipar ningún item).
 */
export class Manguera extends BaseItem {
  readonly itemType = ItemTypes.MANGUERA;

  constructor(config: Partial<MangueraConfig> = {}) {
    super({
      useDurationMs: config.useDurationMs ?? DEFAULT_MANGUERA_CONFIG.useDurationMs,
      cooldownMs: config.cooldownMs ?? DEFAULT_MANGUERA_CONFIG.cooldownMs,
      blocksItems: config.blocksItems ?? DEFAULT_MANGUERA_CONFIG.blocksItems,
    });
  }

  protected onUseEffect(): void {
    console.log("[Manguera] Rociando agua!");
  }

  protected onUseStart(): void {
    console.log("[Manguera] Comenzando a rociar...");
  }

  protected onCooldownComplete(): void {
    console.log("[Manguera] Manguera lista para usar de nuevo.");
  }
}

export type { MangueraConfig } from "./type";
export { DEFAULT_MANGUERA_CONFIG } from "./type";
