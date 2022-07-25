<script>
	import { Styles } from 'sveltestrap'
	import { game } from './game.js'
	import ModalName from './components/ModalName.svelte'
	import Header from './components/Header.svelte'
	import Endgame from './components/Endgame.svelte'
	import Plate from './components/Plate.svelte'
	import Keyboard from './components/Keyboard.svelte'
	import Godmode from './components/Godmode.svelte'
</script>

<Styles />
<div class="plate {$game.user.theme}">

	<ModalName />

	<Header />

	<Godmode />

	<Endgame />

	<Plate />

	<Keyboard />

</div>
