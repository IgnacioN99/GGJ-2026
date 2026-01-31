/** Configuración del tablero tipo ajedrez (damero) */
export interface BoardConfig {
    /** Número de columnas (ej: 5 = 5 carriles) */
    cols: number;
    /** Número de filas */
    rows: number;
    /** Márgenes en píxeles respecto al área de juego */
    margin: number;
    /** Margen superior en píxeles (por defecto usa margin) */
    marginTop?: number;
    /** Píxeles por encima de minY donde está el punto de fuga (ej. 60). Sin definir = perspectiva plana. */
    vanishingPointYOffset?: number;
    /** Factor 0..1; cuánto se estrecha el ancho en la fila lejana (ej. 0.6 = fila arriba tiene 40% del ancho de abajo). Sin definir = tablero plano. */
    perspectiveShrink?: number;
    /** Compresión vertical: >1 hace que las filas cercanas al punto de fuga se compriman (más realista). 1=lineal. */
    perspectiveYCompression?: number;
}

/** Coordenada de celda en el tablero (col, row) */
export interface Cell {
    col: number;
    row: number;
}

export const DEFAULT_BOARD_CONFIG: BoardConfig = {
    cols: 5,
    rows: 4,
    margin: 20,
    marginTop: 420,
    vanishingPointYOffset: 80,
    perspectiveShrink: 0.5,
    perspectiveYCompression: 1.5
};
