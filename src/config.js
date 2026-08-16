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
        { id: 'arcade-dark', name: 'Arcade Dark', preview: '#ff00ff', bg: '#0a0e27', accent: '#ff00ff' },
        { id: 'arcade-neon', name: 'Neon', preview: '#00ff88', bg: '#0f0f0f', accent: '#00ff88' },
        { id: 'arcade-retro', name: 'Retro', preview: '#ffaa00', bg: '#1a1410', accent: '#ffaa00' },
        { id: 'arcade-cyber', name: 'Cyber', preview: '#00ffff', bg: '#001a26', accent: '#00ffff' },
    ],
    skins: {
        1: { id: 'default', name: 'Classic', level: 1, colors: ['#667eea', '#764ba2'], emoji: '⭐' },
        5: { id: 'fire', name: 'Fire', level: 5, colors: ['#f093fb', '#f5576c'], emoji: '🔥' },
        10: { id: 'ice', name: 'Frost', level: 10, colors: ['#4facfe', '#00f2fe'], emoji: '❄️' },
        15: { id: 'neon', name: 'Neon', level: 15, colors: ['#00ff88', '#ff00ff'], emoji: '⚡' },
        20: { id: 'gold', name: 'Golden', level: 20, colors: ['#ffd700', '#ffed4e'], emoji: '👑' },
        25: { id: 'cosmic', name: 'Cosmic', level: 25, colors: ['#c471ed', '#12c2e9'], emoji: '🌌' },
    },
    xpSystem: {
        baseXp: 100,
        winXp: 50,
        lossXp: 10,
        attemptBonus: 5
    },
    clues: 1,
    maxTry: 6,
    minLength: 5,
    maxLength: 8,
    revealDelay: 60,
    godMode: 'tgm',
    transitions: {
        time: 40,
        duration: 80
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
