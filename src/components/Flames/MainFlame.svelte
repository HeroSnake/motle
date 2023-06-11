<script>
    import Basic from "./Basic.svelte";
    import LowPoly from "./LowPoly.svelte";
    import Pixel from "./Pixel.svelte";
    import { game } from '../../game'
    import { Icon } from "svelte-awesome";
    import { fire, refresh } from "svelte-awesome/icons";

    $: angle = Math.min(310, Math.floor(($game.user.streak % 100) / 100 * 310))

    let showFlameSelector = false
    let currentFlame = Basic

    const flames = {
        Pixel: { component: Pixel, threshold: 200},
        LowPoly: { component: LowPoly, threshold: 100},
        Basic: { component: Basic, threshold: 0},
    }

    $: if ($game.user.selectedFlame !== false) {
        currentFlame = flames[$game.user.selectedFlame].component
    } else {
        for (const {component, threshold} of Object.values(flames)) {
            if ($game.user.streak >= threshold) {
                currentFlame = component
                break
            }
        }
    }

    $: console.log(currentFlame);
</script>

<span class="streak" on:click|self={() => showFlameSelector = !showFlameSelector}>
    {#if $game.user.streak == 0}
        <Icon data={ fire }/>
    {:else}
        <div class="flame-holder" style="filter: hue-rotate({angle}deg);">
            <svelte:component this={currentFlame}/>
        </div>
    {/if}
    {$game.user.streak}
    {#if showFlameSelector}
        <div class="flame-selector">
            {#each Object.entries(flames).reverse() as [name, flame]}
                {#if $game.user.streak >= flame.threshold}
                    <span on:click={() => game.changeFlame(name)}>
                        <svelte:component this={flame.component}/>
                    </span>
                {/if}
            {/each}
            <span on:click={() => game.changeFlame(false)} >
                <Icon data={ refresh }/>
            </span>
        </div>
    {/if}
</span>

<style>
    .streak {
        position: relative;
    }

    .flame-holder {
        pointer-events: none;
    }

    .flame-selector {
        padding: 1em;
        border-radius: .3em;
        background-color: #171420;
        position: absolute;
        top: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: .5em;
    }
</style>
