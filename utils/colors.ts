import chromajs from 'chroma-js'

export type RGB = [red: number, green: number, blue: number]
export type HSV = [hue: number, saturation: number, value: number]
export type OkLCh = [lightness: number, chroma: number, hue: number]

export function hsv2rgb(hue: number, saturation: number, value: number): RGB {
	return chromajs.hsv(hue, saturation, value).rgb()
}

export function rgb2hsv(
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
	const [l, c, h] = chromajs.hsv(hue, saturation, value).oklch()

	const [, , h2] = chromajs
		.hsv(hue, Math.max(0.001, saturation), Math.max(0.001, value))
		.oklch()

	if (l === 0 || c === 0) {
		return [l, c, h2]
	}

	return [l, c, h]
}

export function oklch2hsv(
	lightness: number,
	chroma: number,
	hue: number,
	previousHue?: number
): HSV {
	const [h, s, v] = chromajs.oklch(lightness, chroma, hue).hsv()

	return [chroma === 0 || lightness === 0 ? (previousHue ?? 0) : h, s, v]
}

export function oklch2rgb(lightness: number, chroma: number, hue: number): RGB {
	return chromajs.oklch(lightness, chroma, hue).rgb()
}
