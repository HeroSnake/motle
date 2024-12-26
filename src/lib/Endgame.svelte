<script>
    import Icon from 'svelte-awesome'
	import { slide } from 'svelte/transition'
	import { repeat, share } from 'svelte-awesome/icons'
	import { game } from '../game.js'
    import Wiki from './Wiki.svelte'

    let wiki = false

    const toggleWiki = () => {
        wiki = !wiki
    }

    const resetGame = () => {
      wiki = false
      game.resetGame()
    }
</script>

{#if !['pending', 'start'].includes($game.status)}
    <div class="end-game-container {$game.status}" transition:slide>
        {#if $game.status != 'reroll'}
            <img src="/img/{$game.status}.gif" alt="{$game.status}">
        {/if}
        <span class="answer" on:click={toggleWiki} on:keydown={toggleWiki}>{$game.word}</span>

        {#if wiki}
            <Wiki />
        {/if}

        <span>Score | { game.getScore() }</span>
        <div class="buttons-block">
            <button on:click={resetGame}><Icon data={ repeat } scale={2}/>REJOUER</button>
            {#if $game.status != 'reroll'}
                <button on:click={game.getSharing}><Icon data={ share } scale={2}/>Partager</button>
            {/if}
        </div>
    </div>
{/if}
