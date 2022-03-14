<script>
	import { Styles, Col } from 'sveltestrap'
	import { words } from './words.js'
	import { config } from './config.js'
	import Icon from 'svelte-awesome'
	import { arrowDown, arrowLeft, repeat } from 'svelte-awesome/icons'
	import { blur } from 'svelte/transition'

	const revealDelay = config.revealDelay
	const gameStatus = config.gameStatus
	let maxTry = config.maxTry
	let history = []
	let keysMapped = []
	let status
	let error = ''
	let wordsFiltered = []
	let stringWord
	let word = []
	let dab = []
	let playerData = JSON.stringify(localStorage.getItem('user'))
	// console.log(playerData)

	if(playerData == 'null') {
		localStorage.setItem(config.defaultLocalStorage.name, JSON.stringify(config.defaultLocalStorage.data))
	}

	$: placeHolderNumber = Math.abs(maxTry - history.length - 1)
	$: dabString = dab.map(l => l.value)

	const startGame = () => {
		console.log('ocucocu');
		keysMapped = config.keys
		status = gameStatus[0]
		history = []
		wordsFiltered = Object.freeze([...words.filter(w => w.length >= config.minLength && w.length < config.maxLength)])
		stringWord = wordsFiltered[Math.floor(Math.random() * wordsFiltered.length)]
		word = [...stringWord].map(l => ({ value: l, status: ''}))
		dab =  word.map((l, i) => ({value: !i ? l.value : '', status: 'unchecked'}))
	}

	const inputVal = val => {
		const value = val.toUpperCase()
		if(value != dab[0].value || !dabString.includes('')) {
			if (dabString.includes('')) {
				dab = [{value: word[0].value, status: 'unchecked'}, {value, status: 'unchecked'}]
			} else if(dab.length < word.length) {
				dab = [...dab, {value, status: 'unchecked'}]
			}
		}
	}

	const suppVal = () => {
		if(dab.length > 1 && !dabString.includes('')) {
			dab = dab.slice(0, -1)
		}
		if (dab.length <= 1) {
			dab = word.map((l, i) => ({value: !i || l.status == 'valid' ? l.value : '', status: 'unchecked'}))
		}
	}

	const dabValue = async () => {
		if(dab.length != word.length || dab.findIndex(l => l.value == '') != -1 || status != 'start') {
			return
		}
		if (!wordsFiltered.includes(dabString.join(''))) {
			error = 'error'
			const inter = setInterval(() => error = error.length ? '' : 'error', 250)
			setTimeout(() => {
				clearInterval(inter)
				error = ''
			}, 2000)
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
			status = gameStatus[1]
		} else if (history.length == maxTry) {					//LOOSE
			status = gameStatus[2]
		}

		keysMapped = keysMapped
	}

	const keyInput = event => {
		let val = event.key.toUpperCase()
		if(keysMapped.find(k => k.value == val)) {
			inputVal(val)
		} else if(val == 'BACKSPACE') {
			suppVal()
		} else if(val == 'ENTER') {
			dabValue()
		}
	}

	const revealDab = async word => {
		dab = word.map(l => ({...l, status: 'unchecked'}))
		for (let [i, l] of word.entries()) {
			dab[i] = l
			await laPause()
		}

		dab = []
		suppVal()
		history = [...history, word]
	}

	const laPause = () => new Promise(resolve => setTimeout(resolve, revealDelay))

	startGame()
</script>

<Styles />
<svelte:window on:keydown={keyInput}/>
{#if status != 'start'}
	<div class="gif-container {status}" transition:blur={{ delay: 100, duration: 500 }}>
		<img src="/img/{status}.gif" alt="{status}">
		<span class="answer">{stringWord}</span>
		<button class="replay-btn" on:click={startGame}><Icon data={ repeat }/> REJOUER</button>
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
				<div class="word-block { error } {dab[index]?.status ?? ''}">
					{dab[index]?.value ?? ''}
				</div>
			{/each}
		</div>
		{#each Array(placeHolderNumber) as entry}
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
	<div class="keyboard" transition:blur={{ delay: 110, duration: 500 }}>
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