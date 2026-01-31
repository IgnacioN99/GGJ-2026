/** Opciones para crear una textura sin fondo dummy (blanco/damero). */
export interface CreateTextureWithoutDummyOptions {
  /** Clave de la textura raw ya cargada. */
  rawKey: string;
  /** Clave de la textura de salida que se creará. */
  outputKey: string;
  /** Columnas del spritesheet (opcional). Si no se indica, se crea un solo frame. */
  frameCols?: number;
  /** Filas del spritesheet (opcional). Si no se indica, se crea un solo frame. */
  frameRows?: number;
}
