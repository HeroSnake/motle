<script>
	import { Styles } from 'sveltestrap'
	import { game } from './game.js'
	import ModalName from './components/ModalName.svelte'
	import Header from './components/Header.svelte'
	import Endgame from './components/Endgame.svelte'
	import Plate from './components/Plate.svelte'
	import Keyboard from './components/Keyboard.svelte'
</script>

<Styles />
<div class="plate {$game.userData.theme}">

	<ModalName />

	<Header />

	<Endgame />

	<Plate />

	{#if $game.userData.username == 'tgm'}
		<h1>{$game.word}</h1>
	{/if}

	<Keyboard />
</div>
