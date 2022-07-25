<script>
    import { slide } from 'svelte/transition'
	import { Input } from 'sveltestrap'
	import { game } from '../game.js'
</script>

{#if $game.modalName}
    <div transition:slide class="custom-modal" on:click|self={() => game.setModalName(false)}></div>
{/if}
{#if $game.modalName}
    <div class="custom-modal-content">
        <Input class="text-center" autofocus on:input={game.inputName} bind:value={$game.user.username}/>
    </div>
{/if}
