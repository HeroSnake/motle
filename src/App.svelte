<script>
	import { Styles, Col, Input } from 'sveltestrap'
	import { config } from './config.js'
	import Icon from 'svelte-awesome'
	import { arrowDown, arrowLeft, repeat, share, lightbulbO, star, clockO, user } from 'svelte-awesome/icons'
	import { slide } from 'svelte/transition'
	import { game } from './game.js'

	let displayModal = false
	let displayDef

	$: placeHolderNumber = Math.abs(config.maxTry - $game.attempts.length)

	$: userName = $game.userData.username

	const keyInput = event => {
		let val = event.key.toUpperCase()
		if ($game.status == 'start') {
			if (!displayModal) {
				if ($game.keyboard.find(k => k.value == val)) {
					game.inputVal(val)
				} else if (val == 'BACKSPACE') {
					game.suppVal()
				} else if (val == 'ENTER') {
					game.checkAttempt()
				} else if (val == 'ARROWRIGHT') {
					game.goRight()
				} else if (val == 'ARROWLEFT') {
					game.goLeft()
				}
			} else if (val == 'ENTER') {
				displayModal = false
			}
		}
	}
</script>

<Styles />
<svelte:window on:keydown={keyInput}/>
{#if displayModal}
	<div transition:slide class="custom-modal" on:click|self={() => displayModal = false}>
	</div>
	<div transition:slide class="custom-modal-content">
		<Input class="text-center" autofocus on:input={game.inputName} bind:value={userName}/>
	</div>
{/if}
<div class="top-container">
	<img class="logo" src="/logo.png" alt="logo">
	<span on:click={() => displayModal = true} class="username"><Icon data={ user }/>&nbsp;{@html userName}</span>
	<span><Icon data={ star }/>&nbsp;{$game.userData.highScore}</span>
	<span><Icon data={ clockO }/>&nbsp;{$game.userData.streak}</span>
	<span class="help {$game.clues > 0 ? 'up' : 'down'}" on:click={game.useClue}>
		<Icon data={ lightbulbO } scale={2}/>
		<small>x{$game.clues - $game.cluedIdx.length}</small>
	</span>
</div>

{#if !['pending', 'start'].includes($game.status)}
	<div class="gif-container {$game.status}" transition:slide>
		<img src="/img/{$game.status}.gif" alt="{$game.status}">
		<span class="answer" on:click={() => displayDef = !displayDef}>{$game.word}</span>
		{#if displayDef}
			<div transition:slide>
				<iframe id="inlineFrameExample" title="Inline Frame Example" width="300" height="200" src="https://fr.wiktionary.org/wiki/{$game.word.toLowerCase()}#Étymologie"></iframe>
			</div>
		{/if}
		<span>Score | { game.getScore() }</span>
		<div class="buttons-block">
			<button on:click={game.resetGame}><Icon data={ repeat } scale={2}/>REJOUER</button>
			<button on:click={game.getSharing}><Icon data={ share } scale={2}/>Partager</button>
		</div>
	</div>
{/if}
<Col xs="12" lg="8" class="main-container">
	{#each $game.attempts as entry, iw}
		<div class="words-container">
			{#each entry as letter, il}
				<div class="word-block { letter.status } {(($game.attempts.length - 1) == iw && $game.inputIndex == il) ? 'input-index' : ''}" on:click={() => ($game.attempts.length - 1) == iw && game.customInput(il)}>
					{ letter.value }
			</div>
			{/each}
		</div>
	{/each}
	{#if ['pending', 'start'].includes($game.status)}
		{#each Array(placeHolderNumber) as __}
			<div class="words-container">
				{#each [...$game.word] as _}
					<div class="word-block back"></div>
				{/each}
			</div>
		{/each}
	{/if}
</Col>
{#if $game.userData.username == 'tgm'}
	<h1>{$game.word}</h1>
{/if}
{#if ['pending', 'start'].includes($game.status)}
	<div class="keyboard" transition:slide>
		<Col xs="12" lg="5" class="keyboard-container">
			{#each $game.keyboard as key, index}
				{#if index == 20}
					<div class="keyboard-key keyboard-input enter" on:click={ game.checkAttempt }>
						<Icon data={ arrowDown }/>
					</div>
				{/if}
				<div class="keyboard-letter keyboard-input { key.status }" on:click={() => game.inputVal(key.value)}>{ key.value }</div>
			{/each}
			<div class="keyboard-key keyboard-input supp" on:click={ game.suppVal }>
				<Icon data={ arrowLeft }/>
			</div>
		</Col>
	</div>
{/if}
