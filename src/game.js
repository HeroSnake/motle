import { writable } from 'svelte/store'
import { words } from './words.js'
import { config } from './config'
import { playableWords } from './playableWords.js'
import { laPause, lePulse, unique, saveToLocalStorage, getLocalStorage } from './action.js'

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
    // Instance game var
    let gameInstance, currentLetter, currentWord, userString
    let user = getLocalStorage('data', {...config.defaultLocalStorage.data})
    let history = getLocalStorage('history', {...config.defaultLocalStorage.history})

    // Dictionary of words
    const wordsFiltered = Object.freeze([...words.filter(w => w.length >= config.minLength && w.length <= config.maxLength)])
    const playableWordsFiltered = Object.freeze([...playableWords.filter(w => w.length >= config.minLength && w.length <= config.maxLength)])

    const getNextAttempt = word => [...word].map((l, i) => ({
        value: !i ? l : '',
        status: !i ? 'valid' : 'unchecked',
        newStatus: !i ? 'valid' : 'unchecked',
        showAttemp: false,
        locked: false,
        clued: false,
    }))

    function updateKeyboard() {
        const forceKey = new Map()

        // Taking only done attempts
        for (const attempt of history.attempts.slice(0, -1)) {
            const letterStatus = attempt.reduce((c, i) => {
                !c.has(i.value) && c.set(i.value, [])
                c.get(i.value).push(i.status)
                return c
            }, new Map())

            letterStatus.forEach((s, l) => {
                // Don't change allready valid values
                if (forceKey.get(l) === 'valid') {
                    return
                }
                if (s.findIndex(v => v !== 'invalid') === -1) {
                    // Only invalids
                    forceKey.set(l, 'invalid')
                } else if (s.includes('valid') && s.includes('invalid') && !s.includes('in-word')) {
                    forceKey.set(l, 'valid')
                } else {
                    forceKey.set(l, 'in-word')
                }
            });
        }

        return config.keys.map(k => ({...k, status: forceKey.get(k.value) || 'unchecked'}))
    }

    function init() {
        if (history.word == -1) {
            const idx = Math.floor(Math.random() * playableWordsFiltered.length)
            history.attempts = [getNextAttempt(playableWordsFiltered[idx])]
            history.word = idx
        } else {
            const word = playableWordsFiltered[history.word % playableWordsFiltered.length]
            if (!history.attempts.length) {
                history.attempts = [getNextAttempt(word)]
            }
        }
    }

    init()

    // WRITABLE OBJECT
    const { subscribe, set, update } = writable({
        status: gameStatus[0],
        word: playableWordsFiltered[history.word],
        inputIndex: 1,
        attempts: history.attempts,
        fundedLetters: history.fundedLetters,
        keyboard: updateKeyboard(),
        clues: 1,
        user,
        history,
        cluedIdx: history.clues,
        godMode: user.username == config.godMode,
    })

    // Adding ref game
    subscribe(game => {
        gameInstance = game
        currentWord = game.attempts[game.attempts.length - 1]
        currentLetter = currentWord[game.inputIndex]
        userString = currentWord.map(l => l.value).join('')
        history.attempts = game.attempts
        history.clues = game.cluedIdx
        history.fundedLetters = game.fundedLetters
        saveToLocalStorage('data', game.user)
        saveToLocalStorage('history', game.history)
    })

    function initGameStatus() {
        if (history.fundedLetters.length == gameInstance.word.length) {
            gameInstance.status = 'success'
        } else if (gameInstance.attempts.length == config.maxTry && !currentWord.map(l => l.status).includes('unchecked')) {
            // Last attempt allready submited
            gameInstance.status = 'fail'
        }

        update(game => gameInstance)
    }

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
        game.keyboard = structuredClone(config.keys)
        game.cluedIdx = []
        return game
    })

    // L'ordre dans les conditions est très important !!
    function updateLetter(letter) {
        if (gameInstance.status != 'start') {
            return
        }
        letter = letter.toUpperCase()

        if (letter == '' && currentLetter.value == '' && gameInstance.inputIndex == 1) {
            clearAttempt()
            updateFoundedLetters()
        } else {
            if (letter == '' && (currentLetter.value == '' || currentLetter.status == 'clued' || currentLetter.locked)) {
                goLeft()
            }

            // Prevent writing same letter ad the first in second position and locked words
            if ((gameInstance.inputIndex != 1 || gameInstance.word[0] != letter) && !currentLetter.locked) {
                currentLetter.value = letter
                currentLetter.status = 'unchecked'
                update(game => gameInstance)
            }

            if (letter != '' && (gameInstance.inputIndex != 1 || gameInstance.word[0] != letter)) {
                goRight()
            }
        }
    }

    /** Compute word founded letter */
    const updateFoundedLetters = () => update(game => {
        updateClueLetter()
        let increaseCursor = true
        currentWord.forEach((a, i) => {
            if (game.fundedLetters.includes(i) || a.clued) {
                // Keeping current value if letter is locked
                !a.locked && (a.value = [...game.word][i])
                increaseCursor && customInput(i + 1)
            } else {
                increaseCursor = false
            }
        })

        return game
    })

    const inputVal = l => updateLetter(l)
    const suppVal = () => updateLetter('')
    const clearAttempt = () => update(game => {
        // If not first key and not locked we clear the tile
        currentWord.forEach((l, k) => k && !l.locked && (l.value = ''))
        game.inputIndex = 1
        return game
    })

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
    const goStart = () => customInput(1)
    const goEnd = () => customInput(currentWord.length - 1)

    const updateLastAttempt = attempt => update(game => {
        game.attempts.splice(game.attempts.length - 1, 1, attempt)
        return game
    })

    async function checkAttempt() {
        if (currentWord.findIndex(l => l.value == '') != -1 || gameInstance.status != 'start') {
            return
        }

        //ERREUR MOT INCONNU
        if (!(wordsFiltered.includes(userString) || playableWordsFiltered.includes(userString))) {
            await lePulse(config.transitions.duration, 4, async () => {
                updateLastAttempt(currentWord.map((l, i) => ({...l, status: 'error' })))
                await laPause(config.transitions.time)
                updateLastAttempt(currentWord.map((l, i) => ({...l, status: i == 0 ? 'valid' : 'unchecked' })))
            })
            return
        }

        changeGameState('pending')
        const arrayWord = [...gameInstance.word]
        let unchecked = []
        let valids = []

        currentWord.forEach((letter, i) => letter.value == arrayWord[i] ? valids.push(i) : unchecked.push(arrayWord[i]))

        for (const [i, letter] of currentWord.entries()) {
            if (valids.includes(i)) {
                letter.newStatus = 'valid'
            } else {
                const idx = unchecked.indexOf(letter.value)
                if (idx != -1) {
                    letter.newStatus = 'in-word'
                    unchecked.splice(idx, 1)
                } else {
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

        update(g => gameInstance)

        if (valids.length == gameInstance.word.length) {
            changeGameState('success')
        } else if (gameInstance.attempts.length == config.maxTry) {
            changeGameState('fail')
        } else {
            gameInstance.attempts.push(getNextAttempt(gameInstance.word))
            gameInstance.keyboard = updateKeyboard()
            gameInstance.inputIndex = 1
            update(g => gameInstance)
            updateFoundedLetters()
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

    function getScore() {
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

    function getSharing() {
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

    function useClue() {
        if (['start'].includes(gameInstance.status) && (gameInstance.cluedIdx.length < gameInstance.clues || gameInstance.godMode)) {
            gameInstance.cluedIdx.push(gameInstance.inputIndex)
            goRight()
            update(g => gameInstance)
            updateClueLetter(true)
        }
    }

    function updateClueLetter(force = false) {
        gameInstance.cluedIdx.forEach(i => {
            if (currentWord[i].value == '' || force) {
                currentWord[i].status = 'clued'
                currentWord[i].clued = true
                currentWord[i].value = [...gameInstance.word][i]
            }
        })

        update(game => gameInstance)
    }

    const inputName = (e) => update(game => {
        game.user.username = e.target.value
        game.godMode = game.user.username == config.godMode
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
        clearAttempt,
        customInput,
        goLeft,
        goRight,
        goStart,
        goEnd,
        reroll,
        resetGame,
        getSharing,
        checkAttempt,
        getScore,
        useClue,
        inputName,
        clearStorage,
        changeFlame,
        toggleLockLetter,
    }
}

export const game = createGame()

export const showModalName = writable(false)
