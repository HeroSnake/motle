<script>
	import { Styles, Col, Input } from 'sveltestrap'
	import { words } from './words.js'
	import { config } from './config.js'
	import Icon from 'svelte-awesome'
	import { arrowDown, arrowLeft, repeat, share } from 'svelte-awesome/icons'
	import { blur } from 'svelte/transition'
	import { user } from './stores.js'

	const revealDelay = config.revealDelay
	const gameStatus = config.gameStatus
	const transitions = config.transitions

	let userData
	let userHistory
	const unsubscribe = user.subscribe(value => {
		userData = value.userData
		userHistory = value.userHistory
	})

	let maxTry = config.maxTry
	let history = []
	let keysMapped = []
	let status
	let error = ''
	let wordsFiltered = []
	let stringWord
	let word = []
	let dab = []
	let playerScore
	let displayModal = false
	let sharingString
	let inputIndex

	if(!localStorage.getItem('data')) {
		localStorage.clear()
	}
	$: placeHolderNumber = Math.abs(maxTry - history.length - 1)
	$: dabString = dab.map(l => l.value)

	const saveUserData = () => {
		localStorage.setItem('data', JSON.stringify(userData))
		localStorage.setItem('history', JSON.stringify(userHistory))
	}

	const startGame = () => {
		keysMapped = Array.from(config.keys, k => ({...k}))
		status = gameStatus[0]
		history = []
		playerScore = 0
		inputIndex = 1
		wordsFiltered = Object.freeze([...words.filter(w => w.length >= config.minLength && w.length <= config.maxLength)])
		if((userHistory.word ?? '') == '') {
			const idx = Math.floor(Math.random() * wordsFiltered.length)
			stringWord = wordsFiltered[idx]
			word = [...stringWord].map(l => ({ value: l, status: ''}))
			userHistory.word = idx
			history = []
		} else {
			stringWord = wordsFiltered[userHistory.word % wordsFiltered.length]
			word = [...stringWord].map(l => ({ value: l, status: ''}))
			history = userHistory.current
		}
		word.forEach((l,i) => dab.push({value: i == 0 ? l.value : '', status: 'unchecked'}))
		saveUserData()
	}

	const inputVal = val => {
		const value = val.toUpperCase()
		dab[inputIndex].value = value
		if(inputIndex < word.length - 1) {
			inputIndex++
		}
	}

	const suppVal = () => {
		dab[inputIndex].value = ''
		if(inputIndex > 1) {
			inputIndex--
		}
	}

	const updateCurrentGame = () => {
		userHistory.current = [...history]
		userHistory.dab = [...dab]
		saveUserData()
	}

	const clearCurrentGame = () => {
		userHistory.current = []
		userHistory.dab = []
		dab = []
		userHistory.word = ''
		saveUserData()
	}

	const dabValue = async () => {
		if(dab.findIndex(l => l.value == '') != -1 || status != 'start') {
			return
		}
		if (!wordsFiltered.includes(dabString.join(''))) {
			error = 'error'
			const inter = setInterval(() => error = error.length ? '' : 'error', 250)
			clearInterval(inter)
			setTimeout(() => {
				clearInterval(inter)
				error = ''
			}, 250)
			return
		}
		let entry = []
		let unchecked = []

		for (let i = 0; i < word.length; i++) {
			let letter = { value: dab[i].value.toUpperCase(), status: 'invalid' }
			if(letter.value == word[i].value) {
				word[i].status = 'valid'
				keysMapped.find(k => k.value == letter.value).status = 'valid'
				letter.status = 'valid'
			} else {
				unchecked.push(word[i].value)
			}
			entry.push(letter)
		}
		entry.map(letter => {
			if(letter.status == 'valid') {
				return letter
			}
			const idx = unchecked.indexOf(letter.value)
			if(idx != -1) {
				letter.status = 'in-word'
				keysMapped.find(k => k.value == letter.value).status = 'in-word'
				unchecked.splice(idx, 1)
			} else if(word.findIndex(l => l.value == letter.value) == -1) {
				keysMapped.find(k => k.value == letter.value).status = 'invalid'
			}
		})

		await revealDab(entry)
		if (!word.filter(l => l.status != 'valid').length) { 	//WIN
			winGame()
		} else if (history.length == maxTry) {					//LOOSE
			looseGame()
		}
		saveUserData()

		keysMapped = keysMapped
	}

	const winGame = () => {
		status = gameStatus[1]
		userData.streak++
		clearCurrentGame()
		computeScore()
		computeSharing()
	}

	const looseGame = () => {
		status = gameStatus[2]
		userData.streak = 0
		clearCurrentGame()
	}

	const inputName = (e) => {
		userData.username = e.target.value
		saveUserData()
	}

	const computeSharing = () => {
		sharingString = config.sharingHheader + "\n"
		userHistory.games.slice(-1).pop().forEach(w => {
			w.forEach(l => {
				if(l.status == 'valid'){
					sharingString += '🟩'
				} else if(l.status == 'in-word') {
					sharingString += '🟨'
				} else if(l.status = 'invalid'){
					sharingString += '⬛'
				}
			})
			sharingString += "\nScore | " + playerScore
		})
	}

	const keyInput = event => {
		let val = event.key.toUpperCase()
		if(status == 'start') {
			if(!displayModal) {
				if(keysMapped.find(k => k.value == val)) {
					inputVal(val)
				} else if(val == 'BACKSPACE') {
					suppVal()
				} else if(val == 'ENTER') {
					dabValue()
				}
				updateCurrentGame()
			} else if(val == 'ENTER') {
				displayModal = false
			}
		}
	}

	const revealDab = async word => {
		dab = word.map(l => ({...l, status: 'unchecked'}))
		for (let [i, l] of word.entries()) {
			dab[i] = l
			await laPause()
		}
		word.forEach(() => dab.push({value: '', status: 'unchecked'}))
		suppVal()
		history = [...history, word]
	}

	const computeScore = () => {
		let valids = word.map(l => l.value)
		let bonus = 0
		history.forEach((w, attempNumber) => {
			w.forEach((l,i) => {
				if(l.status == 'valid' && i > 0 && valids[i] != '') {
					playerScore += Math.pow(3, config.maxTry - attempNumber)
					valids[i] = ''
				} else if(l.status == 'in-word') {
					bonus++
				}
			})
		})

		if (bonus) {
			playerScore *= 1 + bonus / 20
		}

		playerScore = Math.ceil(playerScore)
		if (playerScore > userData.highScore) {
			userData.highScore = playerScore
		}

		userHistory.games.push(history)
		saveUserData()
	}

	const getSharing = () => {
		computeSharing()
		navigator.clipboard.writeText(sharingString)
	}

	const customInput = (index) => {
		if(index > 0) {
			inputIndex = index
		}
	}

	const laPause = () => new Promise(resolve => setTimeout(resolve, revealDelay))

	startGame()
</script>

<Styles />
<svelte:window on:keydown={keyInput}/>
{#if displayModal}
<div>
	<div class="custom-modal" on:click|self={() => displayModal = false}>
	</div>
	<div class="custom-modal-content">
		<Input class="text-center" autofocus on:input={inputName} bind:value={userData.username}/>
	</div>
</div>
{/if}
<div class="top-container">
	<span on:click={() => displayModal = true}>{@html userData.username}</span>
	<span><span style="font-size:10px;">HighScore</span>&nbsp;|&nbsp;{userData.highScore}</span>
	<span><span style="font-size:10px;">Streak</span>&nbsp;|&nbsp;{userData.streak}</span>
</div>

{#if status != 'start'}
	<div class="gif-container {status}" transition:blur={{ delay: transitions.delay, duration: transitions.duration }}>
		<img src="/img/{status}.gif" alt="{status}">
		<span class="answer">{stringWord}</span>
		<span>Score | { playerScore }</span>
		<button class="replay-btn" on:click={startGame}><Icon data={ repeat } scale={2}/>REJOUER</button>
		<button class="replay-btn" on:click={getSharing}><Icon data={ share } scale={2}/>Partager</button>
	</div>
{/if}
<Col xs="12" lg="8" class="main-container">
	{#each history as entry}
	<div class="words-container">
		{#each entry as letter}
		<div class="word-block { letter.status }">
			{ letter.value ?? '' }
		</div>
		{/each}
	</div>
	{/each}
	{#if status == 'start'}
		<div class="words-container">
			{#each word as _, index}
				<div class="word-block {inputIndex == index ? 'input-index' : ''} { error } {dab[index]?.status ?? ''}" on:click={() => customInput(index)}>
					{dab[index]?.value ?? ''}
				</div>
			{/each}
		</div>
		{#each Array(placeHolderNumber) as __}
			<div class="words-container">
				{#each word as _}
					<div class="word-block back">
					</div>
				{/each}
			</div>
		{/each}
	{/if}
</Col>
<!-- <h1>{stringWord}</h1> -->
{#if status == 'start'}
	<div class="keyboard" transition:blur={{ delay: transitions.delay, duration: transitions.duration }}>
		<Col xs="12" lg="5" class="keyboard-container">
			{#each keysMapped as key, index}
				{#if index == 20}
					<div class="keyboard-key keyboard-input enter" on:click={ dabValue }>
						<Icon data={ arrowDown }/>
					</div>
				{/if}
				<div class="keyboard-letter keyboard-input { key.status }" on:click={() => inputVal(key.value)}>{ key.value }</div>
			{/each}
			<div class="keyboard-key keyboard-input supp" on:click={ suppVal }>
				<Icon data={ arrowLeft }/>
			</div>
		</Col>
	</div>
{/if}
