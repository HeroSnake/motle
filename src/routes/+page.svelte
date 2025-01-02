<script>
	'use client';

	import { Styles } from '@sveltestrap/sveltestrap'
	import { game } from '../game.js'
	import ModalName from '../lib/ModalName.svelte'
	import Header from '../lib/Header.svelte'
	import Plate from '../lib/Plate.svelte'
	import Keyboard from '../lib/Keyboard.svelte'
	import { theme } from '../theme.js'
	import { put } from "@vercel/blob/client";

	// console.log(clientToken);

	let url
	(async (params) => {
		url = await put('players/blob.txt', 'Hello World!', { access: 'public'});
	})()
</script>

<Styles />
<div class="{$theme.name} {!['pending', 'start'].includes($game.status) ? 'end-game' : ''}" style="height:100svh;">
	<ModalName />
	<Header />
	<Plate />
	<Keyboard />
</div>
