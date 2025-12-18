import chromajs from 'chroma-js'

export type RGB = [red: number, green: number, blue: number]
export type HSV = [hue: number, saturation: number, value: number]
export type OkLCh = [lightness: number, chroma: number, hue: number]

export function hsv2rgb(hue: number, saturation: number, value: number): RGB {
	return chromajs.hsv(hue, saturation, value).rgb()
}

export function rgb2hsb(
	red: number,
	green: number,
	blue: number,
	previousHue?: number
): HSV {
	const [h, s, v] = chromajs.rgb(red, green, blue).hsv()

	return [isNaN(h) ? (previousHue ?? 0) : h, s, v]
}

export function hsv2oklch(
	hue: number,
	saturation: number,
	value: number
): OkLCh {
	return chromajs.hsv(hue, saturation, value).oklch()
}

export function oklch2hsv(lightness: number, chroma: number, hue: number): HSV {
	return chromajs.oklch(lightness, chroma, hue).hsv()
}
