type GameType = 'typesetting' | 'shower'

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
					payload: payload,
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
