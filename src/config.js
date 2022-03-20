export const config = {
    keys: [
        { value: 'A', status: 'unchecked' },
        { value: 'Z', status: 'unchecked' },
        { value: 'E', status: 'unchecked' },
        { value: 'R', status: 'unchecked' },
        { value: 'T', status: 'unchecked' },
        { value: 'Y', status: 'unchecked' },
        { value: 'U', status: 'unchecked' },
        { value: 'I', status: 'unchecked' },
        { value: 'O', status: 'unchecked' },
        { value: 'P', status: 'unchecked' },
        { value: 'Q', status: 'unchecked' },
        { value: 'S', status: 'unchecked' },
        { value: 'D', status: 'unchecked' },
        { value: 'F', status: 'unchecked' },
        { value: 'G', status: 'unchecked' },
        { value: 'H', status: 'unchecked' },
        { value: 'J', status: 'unchecked' },
        { value: 'K', status: 'unchecked' },
        { value: 'L', status: 'unchecked' },
        { value: 'M', status: 'unchecked' },
        { value: 'W', status: 'unchecked' },
        { value: 'X', status: 'unchecked' },
        { value: 'C', status: 'unchecked' },
        { value: 'V', status: 'unchecked' },
        { value: 'B', status: 'unchecked' },
        { value: 'N', status: 'unchecked' }
    ],
    clues: 1,
    maxTry: 6,
    minLength: 5,
    maxLength: 8,
    revealDelay: 100,
    transitions: {
        time: 100,
        duration: 200
    },
    sharingHeader: 'Motle ♾️',
    defaultLocalStorage: {
        data: {
            username: 'No1', //no one
            highScore: 0,
            streak: 0
        },
        history: {
            attempts: [],
            word: -1,
            clues: []
        }
    }
}
