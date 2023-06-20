<script>
    import Basic from "./Basic.svelte";
    import LowPoly from "./LowPoly.svelte";
    import Pixel from "./Pixel.svelte";
    import { slide, blur } from 'svelte/transition'
    import { game } from '../../game'
    import { Icon } from "svelte-awesome";
    import { fire } from "svelte-awesome/icons";

    $: angle = Math.min(310, Math.floor(($game.user.streak % 100) / 100 * 310))

    let showFlameSelector = false
    let currentFlame = Basic

    const flames = {
        Pixel: { name: 'Pixel', component: Pixel, threshold: 200},
        LowPoly: { name: 'LowPoly', component: LowPoly, threshold: 100},
        Basic: { name: 'Basic', component: Basic, threshold: 0},
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
        <div class="flame-selector" transition:slide>
            {#each Object.entries(flames).reverse() as [name, flame]}
                {#if $game.user.streak >= flame.threshold}
                    <span on:click={() => game.changeFlame(name)} class="flame-option {flame.name == $game.user.selectedFlame ? 'selected' : ''}" transition:blur style="filter: hue-rotate({angle}deg);">
                        <svelte:component this={flame.component}/>
                    </span>
                {/if}
            {/each}
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
        border-radius: 0 0 .3em .3em;
        background-color: #171420;
        position: absolute;
        top: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: .5em;
        top: 57px;
    }
    .flame-option {
        opacity: 0.7;
    }
    .selected {
        opacity: 1;
    }
</style>
