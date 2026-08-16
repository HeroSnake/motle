<script>
	import { Styles } from '@sveltestrap/sveltestrap'
	import { game } from '../game.js'
	import { progression } from '../progression.js'
	import Header from '../lib/Header.svelte'
	import Plate from '../lib/Plate.svelte'
	import Keyboard from '../lib/Keyboard.svelte'
</script>

<Styles />
<div class="{$progression.currentTheme} {!['pending', 'start'].includes($game.status) ? 'end-game' : ''}" style="height:100svh;">
	<Header />
	<Plate />
	<Keyboard />
</div>
