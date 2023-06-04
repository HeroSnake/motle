<script>
    import Icon from 'svelte-awesome'
	import { lightbulbO, star, user, fire, refresh } from 'svelte-awesome/icons'
    import MainFlame from './Flames/MainFlame.svelte';
    import { game } from '../game'
    import { config } from '../config.js'

    $: theme = config.themes.find(t => t.name == $game.user.theme)
</script>

<div class="top-container">
    <span class="logo" style="color:{theme};" on:click={game.changeTheme}>M</span>
    <span on:click={() => game.setModalName(true)} class="username"><Icon data={ user }/>&nbsp;{@html $game.user.username}</span>
    <span><Icon data={ star }/>&nbsp;{$game.user.highScore}</span>
    <span>
        {#if $game.user.streak == 0}
            <Icon data={ fire }/>
        {:else}
            <MainFlame />
        {/if}
        &nbsp;{$game.user.streak}
    </span>
    <span on:click={game.reset}><Icon class="reset" data={ refresh }/>&nbsp;{ $game.user.reroll }</span>
    <span class="help {$game.clues > 0 ? 'up' : 'down'}" on:click={game.useClue}>
        <Icon data={ lightbulbO } scale={2}/>
        <small>x{$game.clues - $game.cluedIdx.length}</small>
    </span>
</div>
