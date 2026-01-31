import type { Scene } from 'phaser';
import type { BoardConfig, Cell } from './type';
import { DEFAULT_BOARD_CONFIG } from './type';

/** Parámetros de perspectiva calculados a partir del tablero y config */
interface PerspectiveParams {
    vpX: number;
    vpY: number;
    baseWidth: number;
    baseHeight: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    hasPerspective: boolean;
}

/** Devuelve si la config tiene perspectiva activa */
const hasPerspective = (config: BoardConfig): boolean => {
    const offset = config.vanishingPointYOffset ?? 0;
    const shrink = config.perspectiveShrink ?? 0;
    return offset > 0 && shrink > 0;
};

/** Obtiene los parámetros de perspectiva a partir de getBoardBounds y config */
const getPerspectiveParams = (
    scene: Scene,
    config: BoardConfig = DEFAULT_BOARD_CONFIG
): PerspectiveParams => {
    const bounds = getBoardBounds(scene, config);
    const { minX, maxX, minY, maxY } = bounds;
    const perspective = hasPerspective(config);
    const vpX = (minX + maxX) / 2;
    const vpY = minY - (config.vanishingPointYOffset ?? 0);
    const baseWidth = maxX - minX;
    const baseHeight = maxY - minY;
    return {
        vpX, vpY, baseWidth, baseHeight, minX, maxX, minY, maxY,
        hasPerspective: perspective
    };
};

/** Devuelve las 4 esquinas del cuadrilátero de la celda (col, row) en orden: inf-izq, inf-derecha, sup-derecha, sup-izq */
const getCellQuad = (
    scene: Scene,
    config: BoardConfig,
    col: number,
    row: number
): { x: number; y: number }[] => {
    const params = getPerspectiveParams(scene, config);
    if (!params.hasPerspective) {
        const bounds = getBoardBounds(scene, config);
        const { cellWidth, cellHeight, minX, minY } = bounds;
        const left = minX + col * cellWidth;
        const right = minX + (col + 1) * cellWidth;
        const top = minY + row * cellHeight;
        const bottom = minY + (row + 1) * cellHeight;
        return [
            { x: left, y: bottom },
            { x: right, y: bottom },
            { x: right, y: top },
            { x: left, y: top }
        ];
    }
    const { vpX, vpY, baseWidth, maxY } = params;
    const shrink = config.perspectiveShrink ?? 0;
    const yCompression = config.perspectiveYCompression ?? 1;
    const rows = config.rows;
    const cols = config.cols;
    // Juego: row 0 = arriba (lejos), row rows-1 = abajo (cerca). Plan: depth 0 = abajo.
    const depthBottom = rows - 1 - row;
    const depthTop = rows - row;

    // Compresión vertical: las filas se acercan al punto de fuga (perspectiva realista)
    const yAtDepth = (d: number) => {
        const t = d / rows;
        const exp = 1 / yCompression;
        return maxY - (maxY - vpY) * Math.pow(t, exp);
    };
    const widthAtDepth = (d: number) => baseWidth * (1 - shrink * (d / rows));

    const yBottom = yAtDepth(depthBottom);
    const yTop = yAtDepth(depthTop);
    const wBottom = widthAtDepth(depthBottom);
    const wTop = widthAtDepth(depthTop);

    const leftBottom = vpX - wBottom / 2 + col * (wBottom / cols);
    const rightBottom = vpX - wBottom / 2 + (col + 1) * (wBottom / cols);
    const leftTop = vpX - wTop / 2 + col * (wTop / cols);
    const rightTop = vpX - wTop / 2 + (col + 1) * (wTop / cols);

    return [
        { x: leftBottom, y: yBottom },
        { x: rightBottom, y: yBottom },
        { x: rightTop, y: yTop },
        { x: leftTop, y: yTop }
    ];
};

/** Comprueba si un punto está dentro de un cuadrilátero (ray-casting) */
const pointInQuad = (px: number, py: number, quad: { x: number; y: number }[]): boolean => {
    let inside = false;
    const n = quad.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = quad[i].x, yi = quad[i].y;
        const xj = quad[j].x, yj = quad[j].y;
        if (yj === yi) continue;
        const intersect = ((yi > py) !== (yj > py)) &&
            (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

/** Área del tablero en coordenadas mundo (delimitada por la pared del fondo_main) */
const getBoardBounds = (
    scene: Scene,
    config: BoardConfig = DEFAULT_BOARD_CONFIG
): { minX: number; 
    maxX: number; 
    minY: number; 
    maxY: number; 
    cellWidth: number; 
    cellHeight: number } => {
    const w = scene.scale.width;
    const h = scene.scale.height;
    const minX = config.marginLeft ?? config.margin;
    const maxX = w - (config.marginRight ?? config.margin);
    const minY = config.marginTop ?? config.margin;
    const maxY = h - (config.marginBottom ?? config.margin);
    const cellWidth = (maxX - minX) / config.cols;
    const cellHeight = (maxY - minY) / config.rows;
    return { minX, maxX, minY, maxY, cellWidth, cellHeight };
};

/** Convierte coordenadas mundo (x, y) a celda del tablero (col, row). Devuelve null si está fuera. */
const worldToCell = (
    worldX: number,
    worldY: number,
    scene: Scene,
    config: BoardConfig = DEFAULT_BOARD_CONFIG
): Cell | null => {
    const bounds = getBoardBounds(scene, config);
    if (!hasPerspective(config)) {
        if (worldX < bounds.minX || worldX > bounds.maxX || worldY < bounds.minY || worldY > bounds.maxY) {
            return null;
        }
        const col = Math.floor((worldX - bounds.minX) / bounds.cellWidth);
        const row = Math.floor((worldY - bounds.minY) / bounds.cellHeight);
        const colClamped = Math.min(col, config.cols - 1);
        const rowClamped = Math.min(row, config.rows - 1);
        return { col: colClamped, row: rowClamped };
    }
    for (let row = config.rows - 1; row >= 0; row--) {
        for (let col = 0; col < config.cols; col++) {
            const quad = getCellQuad(scene, config, col, row);
            if (pointInQuad(worldX, worldY, quad)) {
                return { col, row };
            }
        }
    }
    return null;
};

/** Devuelve la celda más cercana a (worldX, worldY). Si el punto está fuera del mapa, devuelve la celda del borde más próxima. */
const worldToNearestCell = (
    worldX: number,
    worldY: number,
    scene: Scene,
    config: BoardConfig = DEFAULT_BOARD_CONFIG
): Cell => {
    const cell = worldToCell(worldX, worldY, scene, config);
    if (cell) return cell;
    if (!hasPerspective(config)) {
        const bounds = getBoardBounds(scene, config);
        const colContinuous = (worldX - bounds.minX) / bounds.cellWidth;
        const rowContinuous = (worldY - bounds.minY) / bounds.cellHeight;
        const col = Math.max(0, Math.min(config.cols - 1, Math.round(colContinuous)));
        const row = Math.max(0, Math.min(config.rows - 1, Math.round(rowContinuous)));
        return { col, row };
    }
    let nearest: Cell = { col: 0, row: 0 };
    let minDist = Infinity;
    for (let row = 0; row < config.rows; row++) {
        for (let col = 0; col < config.cols; col++) {
            const { x, y } = cellToWorld(col, row, scene, config);
            const d = (worldX - x) ** 2 + (worldY - y) ** 2;
            if (d < minDist) {
                minDist = d;
                nearest = { col, row };
            }
        }
    }
    return nearest;
};

/** Convierte celda (col, row) al centro de la celda en coordenadas mundo */
const cellToWorld = (
    col: number,
    row: number,
    scene: Scene,
    config: BoardConfig = DEFAULT_BOARD_CONFIG
): { x: number; y: number } => {
    if (!hasPerspective(config)) {
        const bounds = getBoardBounds(scene, config);
        const x = bounds.minX + (col + 0.5) * bounds.cellWidth;
        const y = bounds.minY + (row + 0.5) * bounds.cellHeight;
        return { x, y };
    }
    const quad = getCellQuad(scene, config, col, row);
    const cx = (quad[0].x + quad[1].x + quad[2].x + quad[3].x) / 4;
    const cy = (quad[0].y + quad[1].y + quad[2].y + quad[3].y) / 4;
    return { x: cx, y: cy };
};

/** Dibuja el tablero tipo ajedrez en la escena */
const drawBoard = (
    scene: Scene,
    config: BoardConfig = DEFAULT_BOARD_CONFIG,
    colorLight: number = 0xc4d4a0,
    colorDark: number = 0x8bac0f
): Phaser.GameObjects.Graphics => {
    const graphics = scene.add.graphics();
    graphics.setDepth(-1);

    if (!hasPerspective(config)) {
        const bounds = getBoardBounds(scene, config);
        const { cellWidth, cellHeight, minX, minY } = bounds;
        const gap = 2;
        for (let row = 0; row < config.rows; row++) {
            for (let col = 0; col < config.cols; col++) {
                const isLight = (col + row) % 2 === 0;
                const color = isLight ? colorLight : colorDark;
                const x = minX + col * cellWidth + gap / 2;
                const y = minY + row * cellHeight + gap / 2;
                const w = cellWidth - gap;
                const h = cellHeight - gap;
                graphics.fillStyle(color);
                graphics.fillRect(x, y, w, h);
            }
        }
        return graphics;
    }

    for (let row = 0; row < config.rows; row++) {
        for (let col = 0; col < config.cols; col++) {
            const isLight = (col + row) % 2 === 0;
            const color = isLight ? colorLight : colorDark;
            const quad = getCellQuad(scene, config, col, row);
            const points = quad.map(p => ({ x: p.x, y: p.y }));
            graphics.fillStyle(color);
            graphics.fillPoints(points, true, true);
        }
    }
    return graphics;
};

export type { BoardConfig, Cell } from './type';
export { DEFAULT_BOARD_CONFIG } from './type';
export { getBoardBounds, worldToCell, worldToNearestCell, cellToWorld, drawBoard };