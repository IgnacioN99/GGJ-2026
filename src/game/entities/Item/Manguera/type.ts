import type { ItemConfig } from "../type";

export interface MangueraConfig extends ItemConfig {
  /** Tiempo de uso en ms */
  useDurationMs: number;
  /** Cooldown en ms (no bloquea al player) */
  cooldownMs: number;
}

/** Configuración por defecto de la manguera */
export const DEFAULT_MANGUERA_CONFIG: MangueraConfig = {
  useDurationMs: 1000, // 1 segundo
  cooldownMs: 2000, // 6 segundos (bloqueo global)
  blocksItems: true, // Activa cooldown global
};
