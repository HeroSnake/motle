<script>
    import Icon from 'svelte-awesome'
	import { slide } from 'svelte/transition'
	import { repeat, share } from 'svelte-awesome/icons'
	import { game } from '../game.js'
    import Wiki from './Wiki.svelte'

    let wiki = false
</script>

{#if !['pending', 'start'].includes($game.status)}
    <div class="gif-container {$game.status}" transition:slide>
        <img src="/img/{$game.status}.gif" alt="{$game.status}">
        <span class="answer" on:click={() => wiki = !wiki}>{$game.word}</span>

        {#if wiki}
            <Wiki />
        {/if}

        <span>Score | { game.getScore() }</span>
        <div class="buttons-block">
            <button on:click={game.resetGame}><Icon data={ repeat } scale={2}/>REJOUER</button>
            <button on:click={game.getSharing}><Icon data={ share } scale={2}/>Partager</button>
        </div>
    </div>
{/if}
