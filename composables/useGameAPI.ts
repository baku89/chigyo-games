type GameType = 'typesetting' | 'shower'

// JSONデータの中野数値を指定された精度に丸め込む
function roundJSON(json: any, precision = 0) {
	const mul = 10 ** precision
	return JSON.parse(
		JSON.stringify(json, (_key, value) => {
			if (typeof value === 'number') {
				return Math.round(value * mul) / mul
			}
			return value
		})
	)
}

export const useGameAPI = () => {
	const config = useRuntimeConfig()

	/**
	 * Submit game data to API
	 */
	async function submitGameData(
		gameType: GameType,
		playerType: number,
		payload: any
	) {
		try {
			const response = await $fetch(`${config.public.apiBaseUrl}/submit.php`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: {
					game_type: gameType,
					player_type: playerType,
					payload: roundJSON(payload),
				},
			})

			console.log('Game data submitted successfully:', response)
			return response
		} catch (error) {
			console.error('Failed to submit game data:', error)
			throw error
		}
	}

	/**
	 * Get game records from API
	 */
	async function getGameRecords(
		gameType: GameType,
		limit: number,
		playerType?: number
	) {
		try {
			const params = new URLSearchParams({
				game_type: gameType,
				limit: limit.toString(),
			})

			if (playerType !== undefined) {
				params.append('player_type', playerType.toString())
			}

			const response = await $fetch(
				`${config.public.apiBaseUrl}/records.php?${params}`
			)

			console.log('Game records retrieved successfully:', response)
			return response
		} catch (error) {
			console.error('Failed to retrieve game records:', error)
			throw error
		}
	}

	return {
		submitGameData,
		getGameRecords,
	}
}
