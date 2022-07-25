<script>
    import Icon from 'svelte-awesome'
    import { slide } from 'svelte/transition'
    import { timesCircleO, checkCircleO } from 'svelte-awesome/icons'
    import { game } from '../game'

    let cleared = false

    const clearStorage = () => {
        if(!cleared) {
            cleared = true
            game.clearStorage()
            game.resetGame()
            setTimeout(() => {
                cleared = false
            }, 1500)
        }
    }
</script>

{#if $game.godMode && ['pending', 'start'].includes($game.status) && !$game.modalName}
    <div class="godmode" transition:slide>
        <span>{$game.word}</span>
        <div class="clear" on:click={clearStorage}>
            {#if cleared}
                <Icon data={ timesCircleO }/>
            {:else}
                <Icon data={ checkCircleO }/>
            {/if}
        </div>
    </div>
{/if}
