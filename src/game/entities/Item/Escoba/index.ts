import { BaseItem } from "../index";
import { ItemTypes } from "../type";
import type { EscobaConfig } from "./type";
import { DEFAULT_ESCOBA_CONFIG } from "./type";

/**
 * Item Escoba: el player la equipa, se mueve al destino, y luego
 * queda bloqueado "barriendo" durante el tiempo de uso.
 * Al terminar, cooldown corto sin bloquear equipar otros items.
 */
export class Escoba extends BaseItem {
  readonly itemType = ItemTypes.ESCOBA;

  constructor(config: Partial<EscobaConfig> = {}) {
    super({
      useDurationMs: config.useDurationMs ?? DEFAULT_ESCOBA_CONFIG.useDurationMs,
      cooldownMs: config.cooldownMs ?? DEFAULT_ESCOBA_CONFIG.cooldownMs,
      blocksItems: config.blocksItems ?? DEFAULT_ESCOBA_CONFIG.blocksItems,
    });
  }

  /**
   * Efecto de la escoba al terminar de barrer.
   * Por ahora solo log, se puede extender para aplicar efectos en el tablero.
   */
  protected onUseEffect(): void {
    console.log("[Escoba] Barrido completado!");
  }

  protected onUseStart(): void {
    console.log("[Escoba] Comenzando a barrer...");
  }

  protected onCooldownComplete(): void {
    console.log("[Escoba] Cooldown terminado, lista para usar.");
  }
}

export type { EscobaConfig } from "./type";
export { DEFAULT_ESCOBA_CONFIG } from "./type";
