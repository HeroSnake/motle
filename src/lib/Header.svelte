<script>
    import Icon from 'svelte-awesome'
	import { lightbulbO, star, user, refresh } from 'svelte-awesome/icons'
    import MainFlame from './Flames/MainFlame.svelte'
    import { game, showModalName } from '../game.js'
    import { theme } from '../theme.js'
    import { config } from '../config.js'

    $: username = $game.user.username || ' - '
</script>

<div class="header">
    <span class="logo" style="color:{$theme.preview};" on:click={theme.changeTheme}>M</span>
    <div class="mid-container">
        <span on:click={() => showModalName.set(true)} class="username">
            <Icon data={ user }/><span>{@html username}</span>
        </span>
        <span><Icon data={ star }/>{$game.user.highScore}</span>
        <MainFlame />
        <span on:click={game.reroll}><Icon class="reset" data={ refresh }/>{ $game.user.reroll }</span>
    </div>
    <span class="help {$game.clues > 0 ? 'up' : 'down'}" on:click={game.useClue}>
        <Icon data={ lightbulbO } scale={2}/>
        <small>x{Math.max($game.clues - $game.cluedIdx.length, 0)}</small>
    </span>
</div>
