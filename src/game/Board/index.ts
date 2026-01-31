import type { Scene } from 'phaser';
import type { BoardConfig, BoardCorners, BoardPerspectivePositions, Cell } from './type';
import { DEFAULT_BOARD_CONFIG } from './type';

/** Límites del tablero en coordenadas mundo (min/max, tamaño de celda) */
export interface BoardBounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    cellWidth: number;
    cellHeight: number;
}

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

export class Board {
    private hoverGraphics?: Phaser.GameObjects.Graphics;

    constructor(
        private readonly scene: Scene,
        private readonly config: BoardConfig = DEFAULT_BOARD_CONFIG
    ) {}

    /** Devuelve si la config tiene perspectiva activa */
    private hasPerspective(): boolean {
        const offset = this.config.vanishingPointYOffset ?? 0;
        const shrink = this.config.perspectiveShrink ?? 0;
        return offset > 0 && shrink > 0;
    }

    /** Obtiene los parámetros de perspectiva a partir de getBoardBounds y config */
    private getPerspectiveParams(): PerspectiveParams {
        const bounds = this.getBoardBounds();
        const { minX, maxX, minY, maxY } = bounds;
        const perspective = this.hasPerspective();
        const vpX = (minX + maxX) / 2;
        const vpY = minY - (this.config.vanishingPointYOffset ?? 0);
        const baseWidth = maxX - minX;
        const baseHeight = maxY - minY;
        return {
            vpX, vpY, baseWidth, baseHeight, minX, maxX, minY, maxY,
            hasPerspective: perspective
        };
    }

    /** Devuelve las 4 esquinas del cuadrilátero de la celda (col, row) en orden: inf-izq, inf-derecha, sup-derecha, sup-izq */
    private getCellQuad(col: number, row: number): { x: number; y: number }[] {
        const params = this.getPerspectiveParams();
        if (!params.hasPerspective) {
            const bounds = this.getBoardBounds();
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
        const shrink = this.config.perspectiveShrink ?? 0;
        const yCompression = this.config.perspectiveYCompression ?? 1;
        const rows = this.config.rows;
        const cols = this.config.cols;
        const depthBottom = rows - 1 - row;
        const depthTop = rows - row;

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
    }

    /** Comprueba si un punto está dentro de un cuadrilátero (ray-casting) */
    private static pointInQuad(px: number, py: number, quad: { x: number; y: number }[]): boolean {
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
    }

    /** Área del tablero en coordenadas mundo (delimitada por la pared del fondo_01) */
    getBoardBounds(): BoardBounds {
        const w = this.scene.scale.width;
        const h = this.scene.scale.height;
        const minX = this.config.marginLeft ?? this.config.margin;
        const maxX = w - (this.config.marginRight ?? this.config.margin);
        const minY = this.config.marginTop ?? this.config.margin;
        const maxY = h - (this.config.marginBottom ?? this.config.margin);
        const cellWidth = (maxX - minX) / this.config.cols;
        const cellHeight = (maxY - minY) / this.config.rows;
        return { minX, maxX, minY, maxY, cellWidth, cellHeight };
    }

    /**
     * Calcula y devuelve las posiciones del tablero teniendo en cuenta la perspectiva.
     * - Sin perspectiva: esquinas = rectángulo (margin), bounds = mismo que getBoardBounds.
     * - Con perspectiva: esquinas = 4 vértices del trapecio, bounds = min/max reales.
     */
    getBoardPerspectivePositions(): BoardPerspectivePositions {
        const rect = this.getBoardBounds();
        const { cols, rows } = this.config;

        if (!this.hasPerspective()) {
            const { minX, maxX, minY, maxY } = rect;
            return {
                corners: {
                    topLeft: { x: Math.round(minX), y: Math.round(minY) },
                    topRight: { x: Math.round(maxX), y: Math.round(minY) },
                    bottomRight: { x: Math.round(maxX), y: Math.round(maxY) },
                    bottomLeft: { x: Math.round(minX), y: Math.round(maxY) }
                },
                bounds: {
                    minX: Math.round(minX),
                    maxX: Math.round(maxX),
                    minY: Math.round(minY),
                    maxY: Math.round(maxY)
                }
            };
        }

        const topLeftQuad = this.getCellQuad(0, 0);
        const topRightQuad = this.getCellQuad(cols - 1, 0);
        const bottomRightQuad = this.getCellQuad(cols - 1, rows - 1);
        const bottomLeftQuad = this.getCellQuad(0, rows - 1);

        const roundPoint = (p: { x: number; y: number }) => ({ x: Math.round(p.x), y: Math.round(p.y) });
        const corners: BoardCorners = {
            topLeft: roundPoint(topLeftQuad[3]),
            topRight: roundPoint(topRightQuad[2]),
            bottomRight: roundPoint(bottomRightQuad[1]),
            bottomLeft: roundPoint(bottomLeftQuad[0])
        };

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const quad = this.getCellQuad(col, row);
                for (const p of quad) {
                    if (p.x < minX) minX = p.x;
                    if (p.x > maxX) maxX = p.x;
                    if (p.y < minY) minY = p.y;
                    if (p.y > maxY) maxY = p.y;
                }
            }
        }

        return {
            corners,
            bounds: {
                minX: Math.round(minX),
                maxX: Math.round(maxX),
                minY: Math.round(minY),
                maxY: Math.round(maxY)
            }
        };
    }

    /** Convierte coordenadas mundo (x, y) a celda del tablero (col, row). Devuelve null si está fuera. */
    worldToCell(worldX: number, worldY: number): Cell | null {
        const bounds = this.getBoardBounds();
        if (!this.hasPerspective()) {
            if (worldX < bounds.minX || worldX > bounds.maxX || worldY < bounds.minY || worldY > bounds.maxY) {
                return null;
            }
            const col = Math.floor((worldX - bounds.minX) / bounds.cellWidth);
            const row = Math.floor((worldY - bounds.minY) / bounds.cellHeight);
            const colClamped = Math.min(col, this.config.cols - 1);
            const rowClamped = Math.min(row, this.config.rows - 1);
            return { col: colClamped, row: rowClamped };
        }
        for (let row = this.config.rows - 1; row >= 0; row--) {
            for (let col = 0; col < this.config.cols; col++) {
                const quad = this.getCellQuad(col, row);
                if (Board.pointInQuad(worldX, worldY, quad)) {
                    return { col, row };
                }
            }
        }
        return null;
    }

    /** Devuelve la celda más cercana a (worldX, worldY). Si el punto está fuera del mapa, devuelve la celda del borde más próxima. */
    worldToNearestCell(worldX: number, worldY: number): Cell {
        const cell = this.worldToCell(worldX, worldY);
        if (cell) return cell;
        if (!this.hasPerspective()) {
            const bounds = this.getBoardBounds();
            const colContinuous = (worldX - bounds.minX) / bounds.cellWidth;
            const rowContinuous = (worldY - bounds.minY) / bounds.cellHeight;
            const col = Math.max(0, Math.min(this.config.cols - 1, Math.round(colContinuous)));
            const row = Math.max(0, Math.min(this.config.rows - 1, Math.round(rowContinuous)));
            return { col, row };
        }
        let nearest: Cell = { col: 0, row: 0 };
        let minDist = Infinity;
        for (let row = 0; row < this.config.rows; row++) {
            for (let col = 0; col < this.config.cols; col++) {
                const { x, y } = this.cellToWorld(col, row);
                const d = (worldX - x) ** 2 + (worldY - y) ** 2;
                if (d < minDist) {
                    minDist = d;
                    nearest = { col, row };
                }
            }
        }
        return nearest;
    }

    /** Convierte celda (col, row) al centro de la celda en coordenadas mundo */
    cellToWorld(col: number, row: number): { x: number; y: number } {
        if (!this.hasPerspective()) {
            const bounds = this.getBoardBounds();
            const x = bounds.minX + (col + 0.5) * bounds.cellWidth;
            const y = bounds.minY + (row + 0.5) * bounds.cellHeight;
            return { x, y };
        }
        const quad = this.getCellQuad(col, row);
        const cx = (quad[0].x + quad[1].x + quad[2].x + quad[3].x) / 4;
        const cy = (quad[0].y + quad[1].y + quad[2].y + quad[3].y) / 4;
        return { x: cx, y: cy };
    }

    /** Dibuja el tablero tipo ajedrez en la escena */
    drawBoard(
        colorLight: number = 0xc4d4a0,
        colorDark: number = 0x8bac0f,
        alpha: number = 0.5
    ): Phaser.GameObjects.Graphics {
        const graphics = this.scene.add.graphics();
        graphics.setDepth(-1);

        if (alpha > 0) {
            if (!this.hasPerspective()) {
                const bounds = this.getBoardBounds();
                const { cellWidth, cellHeight, minX, minY } = bounds;
                const gap = 2;
                for (let row = 0; row < this.config.rows; row++) {
                    for (let col = 0; col < this.config.cols; col++) {
                        const isLight = (col + row) % 2 === 0;
                        const color = isLight ? colorLight : colorDark;
                        const x = minX + col * cellWidth + gap / 2;
                        const y = minY + row * cellHeight + gap / 2;
                        const w = cellWidth - gap;
                        const h = cellHeight - gap;
                        graphics.fillStyle(color, alpha);
                        graphics.fillRect(x, y, w, h);
                    }
                }
            } else {
                for (let row = 0; row < this.config.rows; row++) {
                    for (let col = 0; col < this.config.cols; col++) {
                        const isLight = (col + row) % 2 === 0;
                        const color = isLight ? colorLight : colorDark;
                        const quad = this.getCellQuad(col, row);
                        const points = quad.map(p => ({ x: p.x, y: p.y }));
                        graphics.fillStyle(color, alpha);
                        graphics.fillPoints(points, true, true);
                    }
                }
            }
        }

        this.hoverGraphics = this.scene.add.graphics();
        this.hoverGraphics.setDepth(0);

        return graphics;
    }

    /**
     * Actualiza el borde de la celda bajo el cursor. Usa worldToNearestCell para que
     * el hover siga mostrando la celda más cercana incluso cuando el cursor está fuera
     * del tablero (p. ej. cerca del borde). Llama con coordenadas mundo en pointermove.
     */
    updateHover(worldX: number, worldY: number): void {
        if (!this.hoverGraphics) return;

        this.hoverGraphics.clear();

        const cell = this.worldToNearestCell(worldX, worldY);

        const quad = this.getCellQuad(cell.col, cell.row);
        const points = quad.map(p => ({ x: p.x, y: p.y }));

        this.hoverGraphics.lineStyle(2, 0xffffff, 0.9);
        this.hoverGraphics.strokePoints(points, true, true);
    }

    /** Oculta el borde de hover (p. ej. cuando el cursor sale del canvas). */
    clearHover(): void {
        this.hoverGraphics?.clear();
    }
}

export type { BoardConfig, BoardCorners, BoardGeometricBounds, BoardPerspectivePositions, Cell, Integer, Point } from './type';
export { DEFAULT_BOARD_CONFIG } from './type';
