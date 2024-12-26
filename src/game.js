import { writable } from 'svelte/store'
import { words } from './words.js'
import { config } from './config'
import { playableWords } from './playableWords.js'

const gameStatus = ['start', 'success', 'fail', 'pending', 'reroll']
const GameStateMachine = {
    // NewState: [OldState]
    start: gameStatus,
    success: gameStatus,
    fail: gameStatus,
    pending: gameStatus,
    reroll: ['start'],
}

function createGame()
{
    // Helpers
    const laPause = t => new Promise(resolve => setTimeout(resolve, t))

    const saveToLocalStorage = (key, value) => {localStorage.setItem(key, JSON.stringify(value))}
    const storeUser = user => saveToLocalStorage('data', user)
    const storeHistory = history => saveToLocalStorage('history', history)

    const initConfig = (key, defaultLocalStorage) => {
        let userLocalStorage = null
        try {
            userLocalStorage = JSON.parse(localStorage.getItem(key))
        } catch {}

        if (!userLocalStorage) {
            return defaultLocalStorage
        }

        for (const key in defaultLocalStorage) {
            if (!Object.hasOwnProperty.call(userLocalStorage, key)) {
                userLocalStorage[key] = defaultLocalStorage[key];
            }
        }

        return userLocalStorage
    }

    let gameInstance, currentLetter, currentWord, userString
    let user = initConfig('data', {...config.defaultLocalStorage.data})
    let history = initConfig('history', {...config.defaultLocalStorage.history})
    const wordsFiltered = Object.freeze([...words.filter(w => w.length >= config.minLength && w.length <= config.maxLength)])
    const playableWordsFiltered = Object.freeze([...playableWords.filter(w => w.length >= config.minLength && w.length <= config.maxLength)])
    let word = ''
    let modalName = false
    let godMode = user.username == config.godMode

    const getNextAttempt = word => [...word].map((l, i) => ({
        value: !i ? l : '',
        status: !i ? 'valid' : 'unchecked',
        newStatus: !i ? 'valid' : 'unchecked',
        showAttemp: false,
        locked: false,
    }))

    const unique = (value, index, self) => self.indexOf(value) === index

    const initKeyboard = () => {
        let status = 'unchecked'
        const valids = []
        const invalids = []
        const inWord = []
        history.attempts.forEach(w => w.forEach(k => {
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

    function init() {
        if (history.word == -1) {
            const idx = Math.floor(Math.random() * playableWordsFiltered.length)
            word = playableWordsFiltered[idx]
            history.attempts = [getNextAttempt(word)]
            history.word = idx
        } else {
            word = playableWordsFiltered[history.word % playableWordsFiltered.length]
            if (!history.attempts.length) {
                history.attempts = [getNextAttempt(word)]
            }
        }
    }

    init()

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

    const initGameStatus = () => update(game => {
        if (history.fundedLetters.length == word.length) {
            game.status = 'success'
        } else if (game.attempts[game.attempts.length - 1].map(l => l.status).includes('unchecked')) {
            // Player has not submited this try yet
            game.status = 'start'
        } else if (game.attempts.length == config.maxTry) {
            game.status = 'fail'
        }
        return game
    })

    const changeFlame = flame => update(game => {
        game.user.selectedFlame = flame

        return game
    })

    const reroll = () => changeGameState('reroll')

    const resetGame = () => update(game => {
        const idx = Math.floor(Math.random() * playableWordsFiltered.length)
        game.status = gameStatus[0]
        game.attempts = [getNextAttempt(playableWordsFiltered[idx])]
        game.inputIndex = 1
        game.word = playableWordsFiltered[idx]
        game.fundedLetters = []
        game.history.word = idx
        game.keyboard = game.keyboard.map(k => ({...k, status: 'unchecked'}))
        game.cluedIdx = []
        return game
    })

    // L'ordre dans les conditions est très important !!
    const updateLetter = letter => update(game => {
        if (game.status == 'pending') {
            return game
        }
        letter = letter.toUpperCase()

        if (letter == '' && currentLetter == '' && game.inputIndex == 1 && game.fundedLetters.length) {
            updateFoundedLetters()
        } else {
            if (letter == '' && game.inputIndex > 1 && (currentLetter == '' || game.cluedIdx.includes(game.inputIndex) || currentWord[game.inputIndex].locked)) {
                game.inputIndex--
            }

            // Prevent writing same letter ad the first in second position and locked words
            if ((game.inputIndex != 1 || [...game.word].shift() != letter) && !currentWord[game.inputIndex].locked) {
                currentWord[game.inputIndex].value = letter
            }

            if (letter != '' && game.inputIndex < game.word.length - 1 && (game.inputIndex != 1 || [...game.word].shift() != letter)) {
                game.inputIndex++
            }
        }

        updateClueLetter()

        return game
    })

    /**
     * Compute word founded letter
     */
    const updateFoundedLetters = () => update(game => {
        let increaseCursor = true
        game.attempts[game.attempts.length - 1].forEach((a, i) => {
            a.value = a.locked ? a.value : ''
            if (game.fundedLetters.includes(i)) {
                // Keeping current value if letter is locked
                a.value = a.locked ? a.value : [...game.word][i]
                increaseCursor && customInput(i + 1)
            } else {
                increaseCursor = false
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

    const toggleLockLetter = index => update(game => {
        if (index > 0 && index < game.word.length && currentWord[index].value != '') {
            currentWord[index].locked = !currentWord[index].locked
        }
        return game
    })

    const goLeft = () => customInput(gameInstance.inputIndex - 1)
    const goRight = () => customInput(gameInstance.inputIndex + 1)

    const goHome = () => customInput(1)
    const goEnd = () => customInput(currentWord.length - 1)

    const updateLastAttempt = attempt => update(game => {
        game.attempts.splice(game.attempts.length - 1, 1, attempt)
        return game
    })

    const checkAttempt = async () => {
        if (currentWord.findIndex(l => l.value == '') != -1 || gameInstance.status != 'start') {
            return
        }

        //ERREUR MOT INCONNU
        if (!(wordsFiltered.includes(userString) || playableWordsFiltered.includes(userString))) {
            updateLastAttempt(currentWord.map((l, i) => ({...l, status: 'error' })))
            await laPause(config.errorDelay)
            updateLastAttempt(currentWord.map((l, i) => ({...l, status: i == 0 ? 'valid' : 'unchecked' })))
            return
        }

        changeGameState('pending')
        const arrayWord = [...gameInstance.word]
        let unchecked = []
        let valids = []

        currentWord.forEach((letter, i) => letter.value == arrayWord[i] ? valids.push(i) : unchecked.push(arrayWord[i]))

        for (const [i, letter] of currentWord.entries()) {
            const keyboardKey = gameInstance.keyboard.find(k => k.value == letter.value)
            if (valids.includes(i)) {
                letter.newStatus = 'valid'
                keyboardKey.status = 'valid'
            } else {
                const idx = unchecked.indexOf(letter.value)
                if (idx != -1) {
                    letter.newStatus = 'in-word'
                    keyboardKey.status = 'in-word'
                    unchecked.splice(idx, 1)
                } else {
                    if (keyboardKey.status == 'unchecked') {
                        keyboardKey.status = 'invalid'
                    }
                    letter.newStatus = 'invalid'
                }
            }

            letter.showAttemp = true
            letter.locked = false
            updateLastAttempt(currentWord)
            await laPause(config.revealDelay)
            letter.status = letter.newStatus
            letter.showAttemp = false
        }

        if (valids.length) {
            gameInstance.fundedLetters = [...gameInstance.fundedLetters, ...valids].filter(unique)
        }

        gameInstance.inputIndex = 1
        update(g => gameInstance)

        if (valids.length == gameInstance.word.length) {
            changeGameState('success')
        } else if (gameInstance.attempts.length == config.maxTry) {
            changeGameState('fail')
        } else {
            gameInstance.attempts.push(getNextAttempt(gameInstance.word))
            updateFoundedLetters()
            updateClueLetter()
            changeGameState('start')
        }
    }

    const changeGameState = status => update(game => {
        // State transition not allowed, returning early
        if (!GameStateMachine[status].includes(game.status)) {
            return game
        }

        if (status == 'success') {
            if (getScore() > game.user.highScore) {
                game.user.highScore = getScore()
            }
            game.user.streak += Math.floor(Math.log2(getScore() / 100))
            if (game.user.reroll < 1 && game.user.streak % 2 == 0) {
                game.user.reroll++
            }
        } else if (status == 'fail') {
            game.user.streak = 0
        } else if (status == 'reroll') {
            if (!game.godMode && game.user.reroll > 0) {
                game.user.reroll--
            } else if (!game.godMode) {
                return game
            }
        }

        game.status = status

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
        if (['start'].includes(game.status) && game.cluedIdx.length < game.clues) {
            currentWord[game.inputIndex] = { value: [...game.word][game.inputIndex], status: 'clued' }
            game.cluedIdx.push(game.inputIndex)
        }

        return game
  	})

    const updateClueLetter = () => update(game => {
        game.cluedIdx.forEach(i => {
            game.attempts[game.attempts.length - 1][i].status = 'clued'
            if (currentWord[i].value == '') {
                game.attempts[game.attempts.length - 1][i].value = [...game.word][i]
            }
        })
        return game
    })

    const inputName = (e) => update(game => {
        game.user.username = e.target.value
        game.godMode = game.user.username == config.godMode
        return game
    })

    const changeTheme = () => update(game => {
        let newTheme = config.themes[(config.themes.findIndex(t => t.name == game.user.theme) + 1) % config.themes.length]
        game.user.theme = newTheme.name
        return game
    })

    const setModalName = (bool) => update(game => {
        game.modalName = bool
        return game
    })

    const clearStorage = () => update(game => {
        game.user = config.defaultLocalStorage.data
        if (game.godMode) {
            game.user.username = config.godMode
        }
        return game
    })

    initGameStatus()

    return {
        subscribe,
        inputVal,
        suppVal,
        customInput,
        goLeft,
        goRight,
        goHome,
        goEnd,
        reroll,
        resetGame,
        getSharing,
        checkAttempt,
        getScore,
        useClue,
        inputName,
        changeTheme,
        setModalName,
        clearStorage,
        changeFlame,
        toggleLockLetter,
    }
}

export const game = createGame()
