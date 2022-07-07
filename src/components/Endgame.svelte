<script>
    import Icon from 'svelte-awesome'
	import { slide } from 'svelte/transition'
	import { repeat, share } from 'svelte-awesome/icons'
	import { game } from '../game.js'

	let displayDef
</script>

{#if !['pending', 'start'].includes($game.status)}
    <div class="gif-container {$game.status}" transition:slide>
        <img src="/img/{$game.status}.gif" alt="{$game.status}">
        <span class="answer" on:click={() => displayDef = !displayDef}>{$game.word}</span>
        {#if displayDef}
            <div transition:slide>
                <iframe id="inlineFrameExample" title="Inline Frame Example" width="300" height="200" src="https://fr.wiktionary.org/wiki/{$game.word.toLowerCase()}#Étymologie"></iframe>
            </div>
        {/if}
        <span>Score | { game.getScore() }</span>
        <div class="buttons-block">
            <button on:click={game.resetGame}><Icon data={ repeat } scale={2}/>REJOUER</button>
            <button on:click={game.getSharing}><Icon data={ share } scale={2}/>Partager</button>
        </div>
    </div>
{/if}
