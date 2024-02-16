<script>
	import { Styles } from 'sveltestrap'
	import { game } from './game.js'
	import ModalName from './components/ModalName.svelte'
	import Header from './components/Header.svelte'
	import Plate from './components/Plate.svelte'
	import Keyboard from './components/Keyboard.svelte'
</script>

<Styles />
<div class="{$game.user.theme} {!['pending', 'start'].includes($game.status) ? 'end-game' : ''}">

	<ModalName />

	<Header />

	<Plate />

	<Keyboard />

</div>
