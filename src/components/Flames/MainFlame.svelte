<script>
    import Basic from "./Basic.svelte";
    import LowPoly from "./LowPoly.svelte";
    import Pixel from "./Pixel.svelte";
    import { game } from '../../game'

    $: angle = Math.min(310, Math.floor(($game.user.streak % 100) / 100 * 310))
</script>

<div style="filter: hue-rotate({angle}deg);">
    {#if $game.user.streak < 100}
        <Basic />
    {:else if $game.user.streak < 200}
        <LowPoly />
    {:else}
        <Pixel />
    {/if}
</div>
