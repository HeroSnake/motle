export const config = {
    keys: [
        { value: 'A', status: 'unchecked', score: 1 },
        { value: 'Z', status: 'unchecked', score: 3 },
        { value: 'E', status: 'unchecked', score: 1 },
        { value: 'R', status: 'unchecked', score: 2 },
        { value: 'T', status: 'unchecked', score: 2 },
        { value: 'Y', status: 'unchecked', score: 3 },
        { value: 'U', status: 'unchecked', score: 2 },
        { value: 'I', status: 'unchecked', score: 1 },
        { value: 'O', status: 'unchecked', score: 1 },
        { value: 'P', status: 'unchecked', score: 1 },
        { value: 'Q', status: 'unchecked', score: 2 },
        { value: 'S', status: 'unchecked', score: 1 },
        { value: 'D', status: 'unchecked', score: 1 },
        { value: 'F', status: 'unchecked', score: 1 },
        { value: 'G', status: 'unchecked', score: 1 },
        { value: 'H', status: 'unchecked', score: 2 },
        { value: 'J', status: 'unchecked', score: 2 },
        { value: 'K', status: 'unchecked', score: 2 },
        { value: 'L', status: 'unchecked', score: 1 },
        { value: 'M', status: 'unchecked', score: 1 },
        { value: 'W', status: 'unchecked', score: 3 },
        { value: 'X', status: 'unchecked', score: 3 },
        { value: 'C', status: 'unchecked', score: 1 },
        { value: 'V', status: 'unchecked', score: 2 },
        { value: 'B', status: 'unchecked', score: 1 },
        { value: 'N', status: 'unchecked', score: 1 }
    ],
    themes: [
        { name: 'light', preview: '#ccc' },
        { name: 'dark', preview: '#d700f999' },
        // { name: 'neon', preview: '' }
    ],
    clues: 1,
    maxTry: 6,
    minLength: 5,
    maxLength: 8,
    revealDelay: 400,
    errorDelay: 100,
    godMode: 'tgm',
    transitions: {
        time: 100,
        duration: 200
    },
    sharingHeader: 'Motle ♾️',
    defaultLocalStorage: {
        data: {
            username: 'No1', //no one
            highScore: 0,
            streak: 0,
            theme: 'dark',
            reroll: 1,
            selectedFlame: false,
        },
        history: {
            attempts: [],
            word: -1,
            clues: [],
            fundedLetters: []
        }
    }
}
