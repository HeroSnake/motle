<script>
    import { Col } from 'sveltestrap'
    import { game } from '../game.js'
    import { config } from '../config.js'

	$: placeHolderNumber = Math.abs(config.maxTry - $game.attempts.length)
</script>

<Col xs="12" lg="8" class="main-container">
    {#each $game.attempts as entry, iw}
        <div class="words-container">
            {#each entry as letter, il}
                <div class="word-block { letter.status } {(($game.attempts.length - 1) == iw && $game.inputIndex == il) ? 'input-index' : ''}" on:click={() => ($game.attempts.length - 1) == iw && game.customInput(il)}>
                    { letter.value }
            </div>
            {/each}
        </div>
    {/each}
    {#if ['pending', 'start'].includes($game.status)}
        {#each Array(placeHolderNumber) as __}
            <div class="words-container">
                {#each [...$game.word] as _}
                    <div class="word-block back"></div>
                {/each}
            </div>
        {/each}
    {/if}
</Col>
