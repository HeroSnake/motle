<script>
	import { Styles } from 'sveltestrap'
	import { game } from './game.js'
	import ModalName from './components/ModalName.svelte'
	import Header from './components/Header.svelte'
	import Plate from './components/Plate.svelte'
	import Keyboard from './components/Keyboard.svelte'
	import Godmode from './components/Godmode.svelte'
</script>

<Styles />
<div class="h-100 {$game.user.theme} {!['pending', 'start'].includes($game.status) ? 'end-game' : ''}">

	<ModalName />

	<Header />

	<Godmode />

	<Plate />

	<Keyboard />

</div>
