import { writable } from 'svelte/store'

import { saveToLocalStorage, getLocalStorage } from './action.js'
import { config } from './config.js'

function createThemeStore() {

    let themeIdx = getLocalStorage('theme', 1)

    const { subscribe, set } = writable(config.themes[themeIdx] ?? config.themes[0])

    /** Make theme do cycles */
    function changeTheme() {
        themeIdx = (themeIdx + 1) % config.themes.length
        set(config.themes[themeIdx])
        saveToLocalStorage('theme', themeIdx)
    }

    return {
        subscribe,
        changeTheme,
    }
}

export const theme = createThemeStore()
