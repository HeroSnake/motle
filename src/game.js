import { writable } from 'svelte/store'
import { words } from './words.js'
import { config } from './config'

function createGame()
{
    let gameInstance, currentLetter, currentWord, userString
    const gameStatus = ['start', 'success', 'fail', 'pending']
    let userHistory = JSON.parse(localStorage.getItem('history')) ?? {...config.defaultLocalStorage.history}
    const wordsFiltered = Object.freeze([...words.filter(w => w.length >= config.minLength && w.length <= config.maxLength)])
    let word = ''

    // Helpers
    const laPause = t => new Promise(resolve => setTimeout(resolve, t))
    const storeGame = history => localStorage.setItem('history', JSON.stringify(history))
    const getNextAttempt = word => [...word].map((l, i) => ({ value: !i ? l : '', status: !i ? 'valid' :  'unchecked'}))

    // INIT
    if (userHistory.word == -1) {
        const idx = Math.floor(Math.random() * wordsFiltered.length)
        word = wordsFiltered[idx]
        userHistory.attempts = [getNextAttempt(word)]
        userHistory.word = idx
        userHistory.clues = []
    } else {
        word = wordsFiltered[userHistory.word % wordsFiltered.length]
        // TODO: reset du keyboard au chargement
    }
    // END INIT

    // WRITABLE OBJECT
    const { subscribe, set, update } = writable({
        status: gameStatus[0],
        word: word,
        inputIndex: 1,
        attempts: userHistory.attempts,
        keyboard: Array.from(config.keys, k => ({...k})),
        clues: 1,
        cluedIdx: userHistory.clues
    })

    // Adding ref game
    const sub = subscribe(g => {
        gameInstance = g
        currentWord = g.attempts[g.attempts.length - 1]
        currentLetter = currentWord[g.inputIndex].value
        userString = currentWord.map(l => l.value).join('')
        userHistory.attempts = g.attempts
        userHistory.clues = g.cluedIdx
        storeGame(userHistory)
    })

    const updateGameStatus = status => update(g => ({...g, status }))

    const resetGame = () => update(game => {
        const idx = Math.floor(Math.random() * wordsFiltered.length)

        game.status = gameStatus[0]
        game.attempts = [getNextAttempt(wordsFiltered[idx])]
        game.inputIndex = 1
        game.word = wordsFiltered[idx]
        userHistory.word = idx
        userHistory.clues = []
        game.keyboard = game.keyboard.map(k => ({...k, status: 'unchecked'}))

        return game
    })

    // L'ordre dans les condition est très important !!
    const updateLetter = letter => update(game => {
        letter = letter.toUpperCase()

        if (letter == '' && game.inputIndex > 1 && (currentLetter == '' || game.cluedIdx.includes(game.inputIndex))) {
            game.inputIndex--
        }

        if (game.inputIndex != 1 || [...game.word].shift() != letter) {
            game.attempts[game.attempts.length - 1][game.inputIndex].value = letter
        }

        if (letter != '' && game.inputIndex < game.word.length - 1) {
            game.inputIndex++
        }

        game.cluedIdx.map(i => {
            console.log(i);
            if (currentWord[i].value == '') {
                console.log('r');
                game.attempts[game.attempts.length - 1][game.inputIndex].value = [...game.word][i]
            }
        })

        return game
    })

    const inputVal = l => updateLetter(l)
    const suppVal = () => updateLetter('')

    const customInput = index => update(g => {
        if (index > 0 && index < g.word.length) {
            g.inputIndex = index
        }
        return g
    })

    const goLeft = () => customInput(gameInstance.inputIndex - 1)
    const goRight = () => customInput(gameInstance.inputIndex + 1)

    const updateLastAttempt = attempt => update(g => {
        g.attempts.splice(g.attempts.length - 1, 1, attempt)
        return g
    })

    const checkAttempt = async () => {
        if (currentWord.findIndex(l => l.value == '') != -1 || gameInstance.status != 'start') {
            return
        }

        if (!wordsFiltered.includes(userString)) {
            updateLastAttempt(currentWord.map((l, i) => ({...l, status: 'error' })))
            await laPause(config.revealDelay)
            updateLastAttempt(currentWord.map((l, i) => ({...l, status: i == 0 ? 'valid' : 'unchecked' })))
            return
        }

        updateGameStatus('pending')
        const arrayWord = [...gameInstance.word]
        let unchecked = []
        let valids = []

        currentWord.map((letter, i) => {
            if (letter.value == arrayWord[i]) {
                valids.push(i)
            } else {
                unchecked.push(arrayWord[i])
            }
        })

        for (const [i, letter] of currentWord.entries()) {
            const keyboardKey = gameInstance.keyboard.find(k => k.value == letter.value)
            if (valids.includes(i)) {
                letter.status = 'valid'
                keyboardKey.status = 'valid'
            } else {
                const idx = unchecked.indexOf(letter.value)
                if (idx != -1) {
                    letter.status = 'in-word'
                    keyboardKey.status = 'in-word'
                    unchecked.splice(idx, 1)
                } else {
                    keyboardKey.status = 'invalid'
                    letter.status = 'invalid'
                }
            }

            updateLastAttempt(currentWord)
            await laPause(config.revealDelay)
        }

        gameInstance.inputIndex = 1
        update(g => gameInstance)

        if (valids.length == gameInstance.word.length) {
            finishGame('success')
        } else if (gameInstance.attempts.length - 1 == config.maxTry) {
            finishGame('fail')
        } else {
            gameInstance.attempts.push(getNextAttempt(gameInstance.word))
            updateGameStatus('start')
        }

        // saveUserData()
    }

    const finishGame = status => update(game => {
        game.status = status

        if (status == 'success') {
            getScore()
            // userData.streak++
        } else if (status == 'fail') {
            // userData.streak = 0
            // TODO: streak user + highscore
        }

        storeGame({ word: -1, attempts: []})

        // clear only store but not game yet
        return game
    })

    const getScore = () => {
        let valids = [...gameInstance.word]
        let bonus = 0
        let playerScore = 0
        gameInstance.attempts.forEach((w, attemptNumber) => {
            w.forEach((l,i) => {
                if (l.status == 'valid' && i > 0 && valids[i] != '') {
                    playerScore += Math.pow(3, config.maxTry - attemptNumber)
                    valids[i] = ''
                } else if (l.status == 'in-word') {
                    bonus++
                }
            })
        })

        if (bonus) {
            playerScore *= 1 + bonus / 20
        }

        playerScore = Math.ceil(playerScore)
        // if (playerScore > userData.highScore) {
        //     userData.highScore = playerScore
        // }

        return playerScore
    }

    const getSharing = () => {
        let sharingString = config.sharingHeader + '\n'
        gameInstance.attempts.forEach(w => {
            w.forEach(l => {
                if (l.status == 'valid'){
                    sharingString += '🟩'
                } else if (l.status == 'in-word') {
                    sharingString += '🟨'
                } else if (l.status = 'invalid'){
                    sharingString += '⬛'
                }
            })
            sharingString += '\n'
        })
        sharingString += '\nScore | ' + getScore()

		navigator.clipboard.writeText(sharingString)
    }


	const useClue = () => update(game => {
		if(['start'].includes(game.status) && game.cluedIdx.length < game.clues) {
			currentWord[game.inputIndex] = { value: [...game.word][game.inputIndex], status: 'clued' }
			game.cluedIdx.push(game.inputIndex)
		}
        return game
	})

    return {
        subscribe,
        inputVal,
        suppVal,
        customInput,
        goLeft,
        goRight,
        resetGame,
        getSharing,
        checkAttempt,
        getScore,
        useClue,
    }

    // TODOS:
    //  - scoring hightscore + streak
    //  -
    //  -
}

export const game = createGame()
