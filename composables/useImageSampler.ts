import {vec2, vec3} from 'linearly'

export type RGB01 = vec3 // RGB values normalized to 0-1 range
export type UV = vec2 // UV coordinates (0-1 range)

export interface ImageSamplerOptions {
	/**
	 * The URL of the image to load
	 */
	imageUrl: string

	/**
	 * Whether to use bilinear interpolation for sampling
	 * @default true
	 */
	interpolate?: boolean
}

/**
 * Composable for loading and sampling images
 * Provides functionality to sample RGB values from an image using UV coordinates (0-1 range)
 */
export const useImageSampler = (options: ImageSamplerOptions) => {
	const {imageUrl, interpolate = true} = options

	const imageData = ref<ImageData | null>(null)
	const isLoaded = ref(false)
	const isLoading = ref(false)
	const error = ref<string | null>(null)

	/**
	 * Load the image and extract its pixel data
	 */
	const loadImage = async (): Promise<void> => {
		if (isLoading.value) return

		isLoading.value = true
		error.value = null

		try {
			const img = new Image()
			img.crossOrigin = 'anonymous'

			await new Promise<void>((resolve, reject) => {
				img.onload = () => {
					const canvas = document.createElement('canvas')
					const ctx = canvas.getContext('2d')
					if (!ctx) {
						reject(new Error('Could not get canvas context'))
						return
					}

					canvas.width = img.width
					canvas.height = img.height

					ctx.drawImage(img, 0, 0)
					imageData.value = ctx.getImageData(0, 0, img.width, img.height)
					isLoaded.value = true
					resolve()
				}

				img.onerror = () =>
					reject(new Error(`Failed to load image: ${imageUrl}`))
				img.src = imageUrl
			})
		} catch (err) {
			error.value =
				err instanceof Error ? err.message : 'Unknown error occurred'
			console.error('Error loading image:', err)
		} finally {
			isLoading.value = false
		}
	}

	/**
	 * Get pixel RGB values at specific pixel coordinates
	 */
	const getPixelRGB = (position: vec2): RGB01 => {
		if (!imageData.value) return [0, 0, 0]

		const width = imageData.value.width
		const height = imageData.value.height
		const data = imageData.value.data

		// Clamp coordinates to image bounds
		const clampedPos = vec2.clamp(position, [0, 0], [width - 1, height - 1])
		const flooredPos = vec2.floor(clampedPos)

		const index = (flooredPos[1] * width + flooredPos[0]) * 4

		return [
			(data[index] ?? 0) / 255,
			(data[index + 1] ?? 0) / 255,
			(data[index + 2] ?? 0) / 255,
		] as RGB01
	}

	/**
	 * Sample RGB values using UV coordinates (0-1 range) with optional bilinear interpolation
	 * @param uv - UV coordinates [u, v] where u is horizontal (0-1, left to right) and v is vertical (0-1, bottom to top)
	 */
	const sampleRGB = (uv: UV): RGB01 => {
		if (!imageData.value) return [0, 0, 0]

		const width = imageData.value.width
		const height = imageData.value.height

		// Convert UV coordinates to pixel coordinates
		const pixelPos = vec2.multiply(uv, [width - 1, height - 1])

		if (!interpolate) {
			return getPixelRGB(vec2.round(pixelPos))
		}

		// Bilinear interpolation
		const floorPos = vec2.floor(pixelPos)
		const ceilPos = vec2.clamp(
			vec2.add(floorPos, [1, 1]),
			[0, 0],
			[width - 1, height - 1]
		)
		const frac = vec2.subtract(pixelPos, floorPos)

		const topLeft = getPixelRGB(floorPos)
		const topRight = getPixelRGB([ceilPos[0], floorPos[1]])
		const bottomLeft = getPixelRGB([floorPos[0], ceilPos[1]])
		const bottomRight = getPixelRGB(ceilPos)

		// Interpolate horizontally using vec3
		const top = vec3.lerp(topLeft, topRight, frac[0])
		const bottom = vec3.lerp(bottomLeft, bottomRight, frac[0])

		// Interpolate vertically
		return vec3.lerp(top, bottom, frac[1])
	}

	return {
		imageData: readonly(imageData),
		isLoaded: readonly(isLoaded),
		isLoading: readonly(isLoading),
		error: readonly(error),
		loadImage,
		sampleRGB,
	}
}
