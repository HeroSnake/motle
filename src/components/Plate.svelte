<script>
    import { Col } from "sveltestrap"
    import { game } from "../game.js"
    import { config } from "../config.js"
    import Letter from "./Letter.svelte"
    import Endgame from './Endgame.svelte'
    import Godmode from './Godmode.svelte'

    $: placeHolderNumber = Math.abs(config.maxTry - $game.attempts.length);
</script>

<Col xs="12" lg="8" class="page">
    <Endgame />
    {#each $game.attempts as entry, iw}
        <div class="words-container">
            {#each entry as letter, il}
                <Letter
                    {letter}
                    isInputIndex={$game.attempts.length - 1 == iw && $game.inputIndex == il}
                    on:click={() => $game.attempts.length - 1 == iw && game.customInput(il)}
                />
            {/each}
        </div>
    {/each}
    {#if ["pending", "start"].includes($game.status)}
        {#each Array(placeHolderNumber) as __}
            <div class="words-container">
                {#each [...$game.word] as _}
                    <Letter filter={`background-color: hsl(0, 0%, ${Math.floor(Math.random() * 27) + 30}%);`} />
                {/each}
            </div>
        {/each}
    {/if}
    <Godmode />
</Col>
