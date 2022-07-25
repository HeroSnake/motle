import { writable } from 'svelte/store'
import { words } from './words.js'
import { config } from './config'

function createGame()
{
    let gameInstance, currentLetter, currentWord, userString
    const gameStatus = ['start', 'success', 'fail', 'pending']
    let user = JSON.parse(localStorage.getItem('data')) ?? {...config.defaultLocalStorage.data}
    let history = JSON.parse(localStorage.getItem('history')) ?? {...config.defaultLocalStorage.history}
    const wordsFiltered = Object.freeze([...words.filter(w => w.length >= config.minLength && w.length <= config.maxLength)])
    let word = ''
    let modalName = false
    let godMode = user.username == config.godMode
    let hitMarker = new Audio('./audio/hitMarker.mp3')

    // Helpers
    const laPause = t => new Promise(resolve => setTimeout(resolve, t))

    const storeUser = user => localStorage.setItem('data', JSON.stringify(user))

    const storeHistory = history => localStorage.setItem('history', JSON.stringify(history))

    const getNextAttempt = word => [...word].map((l, i) => ({ value: !i ? l : '', status: !i ? 'valid' :  'unchecked'}))

    const unique = (value, index, self) => self.indexOf(value) === index

    const initKeyboard = () => {
        let status = 'unchecked'
        const valids = []
        const invalids = []
        const inWord = []
        history.attempts.map(w => w.map(k => {
            if (k.status == 'in-word') {
                inWord.push(k.value)
            } else if (k.status == 'invalid') {
                invalids.push(k.value)
            } else if (k.status == 'valid') {
                valids.push(k.value)
            }
        }))
        return config.keys.map(k => {
            status = 'unchecked'
            if (valids.includes(k.value)) {
                status = 'valid'
            } else if (inWord.includes(k.value)) {
                status = 'in-word'
            } else if (invalids.includes(k.value)) {
                status = 'invalid'
            }
            return {...k, status}
        })
    }

    // INIT
    if (history.word == -1) {
        const idx = Math.floor(Math.random() * wordsFiltered.length)
        word = wordsFiltered[idx]
        history.attempts = [getNextAttempt(word)]
        history.word = idx
    } else {
        word = wordsFiltered[history.word % wordsFiltered.length]
        // TODO: reset du keyboard au chargement
    }
    // END INIT

    // WRITABLE OBJECT
    const { subscribe, set, update } = writable({
        status: gameStatus[0],
        word: word,
        inputIndex: 1,
        attempts: history.attempts,
        fundedLetters: history.fundedLetters,
        keyboard: initKeyboard(),
        clues: 1,
        user: user,
        history: history,
        cluedIdx: history.clues,
        modalName: modalName,
        godMode: godMode
    })

    // Adding ref game
    const sub = subscribe(game => {
        gameInstance = game
        currentWord = game.attempts[game.attempts.length - 1]
        currentLetter = currentWord[game.inputIndex].value
        userString = currentWord.map(l => l.value).join('')
        history.attempts = game.attempts
        history.clues = game.cluedIdx
        history.fundedLetters = game.fundedLetters
        storeUser(game.user)
        storeHistory(game.history)
    })

    const initGame = () => update(game => {
        if (history.word == -1) {
            const idx = Math.floor(Math.random() * wordsFiltered.length)
            word = wordsFiltered[idx]
            history.attempts = [getNextAttempt(word)]
            history.word = idx
        } else {
            word = wordsFiltered[history.word % wordsFiltered.length]
            // TODO: reset du keyboard au chargement
        }
        if (history.fundedLetters.length == word.length) {
            game.status = 'success'
        }
        else if (game.attempts.length == config.maxTry) {
            game.status = 'fail'
        }
        return game
    })

    const updateGameStatus = status => update(game => ({...game, status }))

    const reset = () => update(game => {
        if(game.godMode || game.user.reroll > 0) {
            if(!game.godMode) {
                game.user.reroll--
            }
            storeUser(game.user)
            resetGame()
        }
        return game
    })

    const resetGame = () => update(game => {
        const idx = Math.floor(Math.random() * wordsFiltered.length)
        game.status = gameStatus[0]
        game.attempts = [getNextAttempt(wordsFiltered[idx])]
        game.inputIndex = 1
        game.word = wordsFiltered[idx]
        game.fundedLetters = []
        game.history.word = idx
        game.keyboard = game.keyboard.map(k => ({...k, status: 'unchecked'}))
        game.cluedIdx = []
        storeHistory(user.history)
        storeUser(game.user)
        return game
    })

    // L'ordre dans les condition est très important !!
    const updateLetter = letter => update(game => {
        if(game.status == 'pending') {
            return game
        }
        letter = letter.toUpperCase()

        if (letter == '' && game.inputIndex > 1 && (currentLetter == '' || game.cluedIdx.includes(game.inputIndex))) {
            game.inputIndex--
        }

        if (game.inputIndex != 1 || [...game.word].shift() != letter) {
            game.attempts[game.attempts.length - 1][game.inputIndex].value = letter
        }

        // compute word founded letter
        if (letter == '' && game.inputIndex == 1 && game.fundedLetters.length) {
            game.attempts[game.attempts.length - 1].map((a, i) => a.value = game.fundedLetters.includes(i) ? [...game.word][i] : '')
        }

        if (letter != '' && game.inputIndex < game.word.length - 1 && (game.inputIndex != 1 || [...game.word].shift() != letter)) {
            game.inputIndex++
        }

        game.cluedIdx.map(i => {
            if (currentWord[i].value == '') {
                game.attempts[game.attempts.length - 1][game.inputIndex].value = [...game.word][i]
            }
        })
        return game
    })

    const inputVal = l => updateLetter(l)
    const suppVal = () => updateLetter('')

    const customInput = index => update(game => {
        if (index > 0 && index < game.word.length) {
            game.inputIndex = index
        }
        return game
    })

    const goLeft = () => customInput(gameInstance.inputIndex - 1)
    const goRight = () => customInput(gameInstance.inputIndex + 1)

    const updateLastAttempt = attempt => update(game => {
        game.attempts.splice(game.attempts.length - 1, 1, attempt)
        return game
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
                    if(keyboardKey.status == 'initial') {
                        keyboardKey.status = 'invalid'
                    }
                    letter.status = 'invalid'
                }
            }

            updateLastAttempt(currentWord)
            await laPause(config.revealDelay)
        }

        if (valids.length) {
            gameInstance.fundedLetters = [...gameInstance.fundedLetters, ...valids].filter(unique)
        }

        gameInstance.inputIndex = 1
        await update(g => gameInstance)

        if (valids.length == gameInstance.word.length) {
            finishGame('success')
        } else if (gameInstance.attempts.length == config.maxTry) {
            finishGame('fail')
        } else {
            gameInstance.attempts.push(getNextAttempt(gameInstance.word))
            updateGameStatus('start')
            suppVal()
        }
        storeUser(user)
        storeHistory(history)
    }

    const finishGame = status => update(game => {
        game.status = status
        if (status == 'success') {
            if(getScore() > game.user.highScore) {
                game.user.highScore = getScore()
            }
            game.user.streak++
            if(game.user.reroll < 1 && game.user.streak % 2 == 0) {
                game.user.reroll++
            }
        } else if (status == 'fail') {
            game.user.streak = 0
        }
        storeUser(game.user)
        storeHistory({ ...game.history, word: -1, attempts: []})
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
                    bonus += config.keys.find(k => k.value == l.value).score
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

    const inputName = (e) => update(game => {
        game.user.username = e.target.value
        game.godMode = game.user.username == config.godMode
		storeUser(game.user)
        return game
    })

    const changeTheme = () => update(game => {
        let newTheme = config.themes[(config.themes.findIndex(t => t.name == game.user.theme) + 1) % config.themes.length]
        game.user.theme = newTheme.name
        storeUser(game.user)
        return game
    })

    const setModalName = (bool) => update(game => {
        game.modalName = bool
        return game
    })

    const clearStorage = () => update(game => {
        localStorage.clear()
        game.user = config.defaultLocalStorage.data
        if(game.godMode) {
            game.user.username = config.godMode
        }
        storeUser(game.user)
        storeHistory(game.history)
        return game
    })

    initGame()

    return {
        subscribe,
        inputVal,
        suppVal,
        customInput,
        goLeft,
        goRight,
        reset,
        resetGame,
        getSharing,
        checkAttempt,
        getScore,
        useClue,
        inputName,
        changeTheme,
        setModalName,
        clearStorage
    }
}

export const game = createGame()
