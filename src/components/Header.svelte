<script>
    import Icon from 'svelte-awesome'
	import { lightbulbO, star, user, refresh } from 'svelte-awesome/icons'
    import MainFlame from './Flames/MainFlame.svelte';
    import { game } from '../game'
    import { config } from '../config.js'

    $: theme = config.themes.find(t => t.name == $game.user.theme)

    $: username = $game.user.username.length ? $game.user.username : ' - '
</script>

<div class="header">
    <span class="logo" style="color:{theme};" on:click={game.changeTheme}>M</span>
    <div class="mid-container">
        <span on:click={() => game.setModalName(true)} class="username">
            <Icon data={ user }/><span>{@html username}</span>
        </span>
        <span><Icon data={ star }/>{$game.user.highScore}</span>
        <MainFlame />
        <span on:click={game.reset}><Icon class="reset" data={ refresh }/>{ $game.user.reroll }</span>
    </div>
    <span class="help {$game.clues > 0 ? 'up' : 'down'}" on:click={game.useClue}>
        <Icon data={ lightbulbO } scale={2}/>
        <small>x{$game.clues - $game.cluedIdx.length}</small>
    </span>
</div>
