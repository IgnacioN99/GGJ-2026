import type { ItemConfig } from "../type";

export interface EscobaConfig extends ItemConfig {
  /** Tiempo de uso en ms (player bloqueado barriendo) */
  useDurationMs: number;
  /** Cooldown en ms */
  cooldownMs: number;
  /** Si true, activa cooldown global (no puede equipar ningún item) */
  blocksItems?: boolean;
}

/** Configuración por defecto de la escoba */
export const DEFAULT_ESCOBA_CONFIG: EscobaConfig = {
  useDurationMs: 2000, // 2 segundos barriendo
  cooldownMs: 2500, // 2.5 segundos de cooldown (no bloquea equipar otros items)
  blocksItems: false,
};
