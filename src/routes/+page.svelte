<script>
	import { Styles } from '@sveltestrap/sveltestrap'
	import { game } from '../game.js'
	import ModalName from '../lib/ModalName.svelte'
	import Header from '../lib/Header.svelte'
	import Plate from '../lib/Plate.svelte'
	import Keyboard from '../lib/Keyboard.svelte'
	import { theme } from '../theme.js'
</script>

<Styles />
<div class="{$theme.name} {!['pending', 'start'].includes($game.status) ? 'end-game' : ''}" style="height:100svh;">
	<ModalName />
	<Header />
	<Plate />
	<Keyboard />
</div>
