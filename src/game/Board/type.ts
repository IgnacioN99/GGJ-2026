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
    /** Margen izquierdo en píxeles (por defecto usa margin). Usado para alinear con la pared del fondo. */
    marginLeft?: number;
    /** Margen derecho en píxeles (por defecto usa margin). Usado para alinear con la pared del fondo. */
    marginRight?: number;
    /** Margen inferior en píxeles (por defecto usa margin). */
    marginBottom?: number;
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

/** Número entero (p. ej. coordenada o límite redondeado) */
export type Integer = number;

/** Punto en coordenadas mundo (valores enteros) */
export interface Point {
    x: Integer;
    y: Integer;
}

/** Esquinas del tablero en orden: sup-izq, sup-derecha, inf-derecha, inf-izq (valores enteros) */
export interface BoardCorners {
    topLeft: Point;
    topRight: Point;
    bottomRight: Point;
    bottomLeft: Point;
}

/** Límites geométricos (bounding box) del tablero dibujado (valores enteros) */
export interface BoardGeometricBounds {
    minX: Integer;
    maxX: Integer;
    minY: Integer;
    maxY: Integer;
}

/** Posiciones del tablero con perspectiva: esquinas del trapecio y bounding box geométrico */
export interface BoardPerspectivePositions {
    corners: BoardCorners;
    bounds: BoardGeometricBounds;
}

/** Límites del tablero: pared = límite superior, tablero pegado a la casa */
export const DEFAULT_BOARD_CONFIG: BoardConfig = {
    cols: 5,
    rows: 4,
    margin: 20,
    marginTop: 560,
    marginLeft: 60,
    marginRight: 370,
    marginBottom: 0,
    vanishingPointYOffset: 80,
    perspectiveShrink: 0.5,
    perspectiveYCompression: 1.5
};
