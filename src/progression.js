import { writable } from 'svelte/store'
import { saveToLocalStorage, getLocalStorage } from './action.js'
import { config } from './config.js'

function createProgression() {
	let progression = getLocalStorage('progression', {
		level: 1,
		xp: 0,
		totalXp: 0,
		unlockedSkins: ['default'],
		currentSkin: 'default',
		currentTheme: 'arcade-dark',
		stats: {
			gamesPlayed: 0,
			gamesWon: 0,
			perfectGames: 0,
			streak: 0,
			totalScore: 0
		}
	})

	const { subscribe, set, update } = writable(progression)

	function addXpInternal(p, amount) {
		p.xp += amount
		p.totalXp += amount

		const xpPerLevel = config.xpSystem.baseXp * (1 + (p.level - 1) * 0.1)
		while (p.xp >= xpPerLevel) {
			p.xp -= xpPerLevel
			p.level += 1

			// Unlock new skin every 5 levels
			if (p.level % 5 === 0 && config.skins[p.level]) {
				p.unlockedSkins.push(config.skins[p.level].id)
			}
		}
	}

	function addXp(amount) {
		update(p => {
			addXpInternal(p, amount)
			saveToLocalStorage('progression', p)
			return p
		})
	}

	function setSkin(skinId) {
		update(p => {
			if (p.unlockedSkins.includes(skinId)) {
				p.currentSkin = skinId
				saveToLocalStorage('progression', p)
			}
			return p
		})
	}

	function setTheme(themeId) {
		update(p => {
			p.currentTheme = themeId
			saveToLocalStorage('progression', p)
			return p
		})
	}

	function updateStats(gameResult) {
		update(p => {
			p.stats.gamesPlayed += 1
			if (gameResult.won) {
				p.stats.gamesWon += 1
				const attempts = gameResult.attempts
				if (attempts === 1) p.stats.perfectGames += 1
				addXpInternal(p, config.xpSystem.winXp + (6 - attempts) * config.xpSystem.attemptBonus)
			} else {
				addXpInternal(p, config.xpSystem.lossXp)
				p.stats.streak = 0
			}
			p.stats.totalScore += gameResult.score || 0
			saveToLocalStorage('progression', p)
			return p
		})
	}

	return {
		subscribe,
		addXp,
		setSkin,
		setTheme,
		updateStats
	}
}

export const progression = createProgression()
