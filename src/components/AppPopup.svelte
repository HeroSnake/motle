<script>
	import { Input } from 'sveltestrap'
    export let playerName
</script>

<Input autofocus bind:value={playerName}/>