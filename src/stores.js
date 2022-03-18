import { writable } from 'svelte/store';
import { config } from './config';

const getUser = () => ({
    userData: JSON.parse(localStorage.getItem('data')) ?? {...config.defaultLocalStorage.data},
    userHistory: JSON.parse(localStorage.getItem('history')) ?? {...config.defaultLocalStorage.history},
})

export const user = writable({...getUser()})
