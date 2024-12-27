<script>
    import { slide } from 'svelte/transition'
	import { Input } from '@sveltestrap/sveltestrap'
	import { game, showModalName } from '../game.js'
</script>

{#if $showModalName}
    <div transition:slide class="custom-modal" on:click|self={() => showModalName.set(false)}></div>
    <div class="custom-modal-content">
        <Input class="text-center" autofocus on:input={game.inputName} bind:value={$game.user.username}/>
    </div>
{/if}
