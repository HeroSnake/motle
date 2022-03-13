<script>
	import { Styles, Col } from 'sveltestrap'
	import { words } from './words.js'
	import { config } from './config.js'
	import Icon from 'svelte-awesome';
	import { arrowDown, arrowLeft } from 'svelte-awesome/icons';

	let history = []
	let maxTry = config.maxTry
	let keysMapped = config.keys
	let gameStatus = config.gameStatus

	let wordsFiltered = words.filter(w => w.length >= config.minLength && w.length < config.maxLength)
	let stringWord = wordsFiltered[Math.floor(Math.random() * wordsFiltered.length)]

	const word = [...stringWord].map(l => ({ value: l, status: ''}))

	let dab =  word.map((l, i) => !i ? l.value : '')

	$: gameSuccess = !word.filter(l => l.status != 'success').length

	const inputVal = val => {
		const value = val.toUpperCase()
		if(value != dab[0] || !dab.includes('')) {
			if (dab.includes('')) {
				dab = [word[0].value, value]
			} else if(dab.length < word.length) {
				dab = [...dab, value]
			}
		}
	}

	const suppVal = () => {
		if(dab.length > 1 && !dab.includes('')) {
			dab.pop()
			dab = [...dab]
		}
		if (dab.length <= 1) {
			dab = word.map((l, i) => !i ? l.value : '')
		}
		console.log(dab)
	}

	const dabValue = () => {
		if(dab.length != word.length || dab.includes('') || history.length == maxTry) {
			return
		}
		let entry = []
		let unchecked = []

		for (let i = 0; i < word.length; i++) {
			let letter = { value: dab[i].toUpperCase(), status: 'invalid' }
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

		keysMapped = keysMapped
		history = [...history, entry]
		dab = []
		suppVal()
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

</script>
<Styles />
<svelte:window on:keydown={keyInput}/>
<Col xs="12" lg="8" class="main-container">
	{#if history.length == maxTry || gameSuccess}
		<h1>{stringWord}</h1>
	{/if}
	{#each history as entry}
		<div class="words-container">
			{#each entry as letter}
				<div class="word-block { letter.status }">
					{ letter.value ?? '' }
				</div>
			{/each}
		</div>
	{/each}
	{#if history.length < maxTry && word.length && !gameSuccess}
		<div class="words-container">
			{#each word as option, index}
				<div class="word-block">
					{dab[index] ?? ''}
				</div>
			{/each}
		</div>
	{/if}
</Col>
<div class="keyboard">
	<Col xs="12" lg="5" class="keyboard-container">
		{#each keysMapped as key}
			<div class="keyboard-letter keyboard-input { key.status }" on:click={() => inputVal(key.value)}>{ key.value }</div>
		{/each}
		<div class="keyboard-key keyboard-input" on:click={ dabValue }>
			<Icon data={ arrowDown }/>
		</div>
		<div class="keyboard-key keyboard-input" on:click={ suppVal }>
			<Icon data={ arrowLeft }/>
		</div>
	</Col>
</div>