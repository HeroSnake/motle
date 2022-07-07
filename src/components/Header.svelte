<script>
    import Icon from 'svelte-awesome'
	import { lightbulbO, star, user, fire } from 'svelte-awesome/icons'
	import Flame from './Flame.svelte'
    import { game } from '../game'
    import { config } from '../config.js'

    $: theme = config.themes.find(t => t.name == $game.userData.theme)
</script>

<div class="top-container">
    <span class="logo" style="color:{theme};" on:click="{game.changeTheme}">M</span>
    <span on:click={() => game.setModalName(true)} class="username"><Icon data={ user }/>&nbsp;{@html $game.userData.username}</span>
    <span><Icon data={ star }/>&nbsp;{$game.userData.highScore}</span>
    <span>
        {#if $game.userData.streak == 0}
            <Icon data={ fire }/>
        {:else}
            <Flame />
        {/if}
        &nbsp;{$game.userData.streak}
    </span>
    <span class="help {$game.clues > 0 ? 'up' : 'down'}" on:click={game.useClue}>
        <Icon data={ lightbulbO } scale={2}/>
        <small>x{$game.clues - $game.cluedIdx.length}</small>
    </span>
</div>
