<script>
	import { Styles, Col } from 'sveltestrap'
	import { words } from './words.js'
	import { keys } from './keys.js'
	import Icon from 'svelte-awesome';
	import { arrowDown, arrowLeft } from 'svelte-awesome/icons';

	let history = []
	let maxTry = 6
	let keysMapped = keys

	const index = Math.floor(Math.random() * words.length)
	let temp = words.filter(w => w.length > 4 || w.length < 10)

	let word = [...temp[index]]
	let dab = [word[0]]

	const inputVal = (val) => {
		if(dab.length < word.length) {
			dab = [...dab, val.toUpperCase()]
		}
	}

	const suppVal = () => {
		if(dab.length > 1) {
			dab.pop()
			dab = [...dab]
		}
	}

	const dabValue = () => {
		if(dab.length != word.length || history.length == maxTry) {
			return
		}
		let entry = []
		let unchecked = []

		for (let i = 0; i < word.length; i++) {
			let letter = { value: dab[i].toUpperCase(), status: 'invalid' }
			if(letter.value == word[i]) {
				keysMapped.find(k => k.value == letter.value).status = 'valid'
				letter.status = 'valid'
			} else {
				unchecked.push(word[i])
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
			} else if(!word.includes(letter.value)) {
				keysMapped.find(k => k.value == letter.value).status = 'invalid'
			}
		})

		keysMapped = keysMapped
		history = [...history, entry]
		dab = [word[0]]
	}

</script>
<Styles />

<Col xs="12" lg="8" class="main-container">
	<h1>{words[index]}</h1>
	{#each history as entry}
		<div class="words-container">
			{#each entry as letter}
				<div class="word-block { letter.status }">
					{ letter.value ?? '' }
				</div>
			{/each}
		</div>
	{/each}
	{#if history.length < maxTry }
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