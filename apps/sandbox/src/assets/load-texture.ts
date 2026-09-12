import type { Engine, Texture, TextureOptions } from "@hadron/engine";

function createDefaultTextureImage(): Promise<ImageBitmap> {
  const size = 128;
  const majorSquareSize = 32;
  const minorSquareSize = 8;
  const pixels = new Uint8ClampedArray(size * size * 4);

  const lightMajorSquareShade = 96;
  const darkMajorSquareShade = 72;
  const lightMinorSquareShadeOffset = 6;
  const darkMinorSquareShadeOffset = -6;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const offset = (y * size + x) * 4;
      const isLightMajorSquare =
        (Math.floor(x / majorSquareSize) + Math.floor(y / majorSquareSize)) % 2 === 0;
      const isLightMinorSquare =
        (Math.floor(x / minorSquareSize) + Math.floor(y / minorSquareSize)) % 2 === 0;
      const majorSquareShade = isLightMajorSquare ? lightMajorSquareShade : darkMajorSquareShade;
      const minorSquareShadeOffset = isLightMinorSquare
        ? lightMinorSquareShadeOffset
        : darkMinorSquareShadeOffset;
      const shade = majorSquareShade + minorSquareShadeOffset;

      pixels[offset] = shade;
      pixels[offset + 1] = shade;
      pixels[offset + 2] = shade;
      pixels[offset + 3] = 255;
    }
  }

  return createImageBitmap(new ImageData(pixels, size, size));
}

export async function loadTexture(
  engine: Engine,
  url: string,
  options?: TextureOptions,
): Promise<Texture> {
  try {
    return await engine.loadTexture(url, options);
  } catch (error) {
    console.warn(`Could not load texture: ${url}. Using the default texture.`, error);

    return engine.createTexture(await createDefaultTextureImage(), {
      ...options,
      minFilter: "nearest",
      magFilter: "nearest",
    });
  }
}
