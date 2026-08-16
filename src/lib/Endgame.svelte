<script>
    import Icon from 'svelte-awesome'
	import { slide } from 'svelte/transition'
	import { repeat, share } from 'svelte-awesome/icons'
	import { game } from '../game.js'
	import { progression } from '../progression.js'
    import Wiki from './Wiki.svelte'

    let wiki = false

    const toggleWiki = () => {
        wiki = !wiki
        if (wiki) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
    }

    const closeWiki = () => {
        wiki = false
        document.body.style.overflow = ''
    }

    const resetGame = () => {
        wiki = false
        document.body.style.overflow = ''
        game.resetGame()
    }
</script>

{#if !['pending', 'start'].includes($game.status)}
    <div class="end-game-container {$game.status}" transition:slide>
        {#if $game.status != 'reroll'}
            <img src="/img/{$game.status}.gif" alt="{$game.status}">
        {/if}
        <span class="answer" on:click={toggleWiki} on:keydown={toggleWiki} role="button" tabindex="0">{$game.word}</span>

        <span class="score-text">Score | { game.getScore() }</span>
        <div class="buttons-block">
            <button class="end-btn replay-btn" on:click={resetGame} title="Play again">
                <Icon data={ repeat } scale={1.8}/>
                <span>REJOUER</span>
            </button>
            {#if $game.status != 'reroll'}
                <button class="end-btn share-btn" on:click={game.getSharing} title="Share result">
                    <Icon data={ share } scale={1.8}/>
                    <span>PARTAGER</span>
                </button>
            {/if}
        </div>
    </div>
{/if}

{#if wiki}
    <div class="wiki-popup-wrapper {$progression.currentTheme}">
        <Wiki on:click={closeWiki} on:keydown={(e) => e.key === 'Escape' && closeWiki()} />
    </div>
{/if}
