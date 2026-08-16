<script>
    import Icon from 'svelte-awesome'
	import { lightbulbO, star, user, refresh } from 'svelte-awesome/icons'
    import MainFlame from './Flames/MainFlame.svelte'
    import { game } from '../game.js'
    import { progression } from '../progression.js'
    import { config } from '../config.js'

    $: username = $game.user.username || 'Player'
    $: xpPerLevel = config.xpSystem.baseXp * (1 + ($progression.level - 1) * 0.1)
    $: xpPercent = ($progression.xp / xpPerLevel) * 100
    $: currentTheme = config.themes.find(t => t.id === $progression.currentTheme)
    $: cluesLeft = Math.max($game.clues - $game.cluedIdx.length, 0)

    function cycleTheme() {
        const currentIdx = config.themes.findIndex(t => t.id === $progression.currentTheme)
        const nextIdx = (currentIdx + 1) % config.themes.length
        progression.setTheme(config.themes[nextIdx].id)
    }
</script>

<div class="header">
    <!-- Left Section: Logo & Level -->
    <div class="header-left">
        <button class="logo-btn" on:click={cycleTheme} title="Click to change theme">
            <span class="logo">M</span>
        </button>
        <div class="level-section">
            <div class="level-number">LV {$progression.level}</div>
            <div class="xp-bar">
                <div class="xp-fill" style="width: {xpPercent}%"></div>
            </div>
        </div>
    </div>

    <!-- Center Section: Player Name & Score -->
    <div class="header-center">
        <div class="player-name-field">
            <Icon data={user} scale={1.2} />
            <input
                type="text"
                class="name-input"
                value={username}
                on:input={game.inputName}
                placeholder="Your name"
                maxlength="12"
                title="Click to edit username"
            />
        </div>
        <div class="stats-row">
            <div class="stat-item">
                <Icon data={star} scale={1.1} />
                <span class="stat-value">{$game.user.highScore}</span>
            </div>
            <div class="stat-divider"></div>
            <MainFlame />
        </div>
    </div>

    <!-- Right Section: Actions -->
    <div class="header-right">
        <button
            class="action-btn clue-btn {cluesLeft === 0 ? 'disabled' : ''}"
            on:click={game.useClue}
            disabled={cluesLeft === 0}
            title="Use a clue"
        >
            <Icon data={lightbulbO} scale={1.3} />
            <span class="action-count">{cluesLeft}</span>
        </button>
        <button
            class="action-btn reroll-btn"
            on:click={game.reroll}
            title="Reroll word"
        >
            <Icon data={refresh} scale={1.3} />
            <span class="action-count">{$game.user.reroll}</span>
        </button>
    </div>
</div>

<style>
    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 12px;
        height: auto;
        background: transparent;
    }

    /* Left Section */
    .header-left {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 0 0 auto;
    }

    .logo-btn {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        border: 2px solid currentColor;
        background: rgba(255, 255, 255, 0.05);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        padding: 0;
        font-family: inherit;
    }

    .logo-btn:active {
        transform: scale(0.95);
    }

    .logo {
        font-size: 28px;
        font-weight: bold;
        font-family: 'Playfair', serif;
        display: block;
    }

    .level-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
    }

    .level-number {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
        line-height: 1;
    }

    .xp-bar {
        width: 48px;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        overflow: hidden;
        border: 0.5px solid rgba(255, 255, 255, 0.2);
    }

    .xp-fill {
        height: 100%;
        background: linear-gradient(90deg, currentColor, rgba(255, 255, 255, 0.8));
        transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
    }

    /* Center Section */
    .header-center {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        min-width: 0;
    }

    .player-name-field {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        padding: 6px 8px;
        font-family: inherit;
        color: currentColor;
    }

    .name-input {
        background: transparent;
        border: none;
        color: currentColor;
        font-family: inherit;
        font-size: 12px;
        font-weight: 600;
        outline: none;
        padding: 0 4px;
        min-width: 60px;
        max-width: 80px;
    }

    .name-input::placeholder {
        color: rgba(255, 255, 255, 0.4);
    }

    .name-input:focus {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        padding: 2px 6px;
    }

    .stats-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
    }

    .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        font-weight: 600;
    }

    .stat-divider {
        width: 1px;
        height: 16px;
        background: rgba(255, 255, 255, 0.2);
    }

    /* Right Section */
    .header-right {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 0 0 auto;
    }

    .action-btn {
        position: relative;
        width: 44px;
        height: 44px;
        border-radius: 10px;
        border: 1.5px solid currentColor;
        background: rgba(255, 255, 255, 0.08);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        color: currentColor;
        font-family: inherit;
        padding: 0;
    }

    .action-btn:active:not(.disabled) {
        transform: scale(0.92);
        background: rgba(255, 255, 255, 0.15);
    }

    .action-btn.disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .action-count {
        position: absolute;
        top: 2px;
        right: 2px;
        font-size: 10px;
        font-weight: 700;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        padding: 1px 3px;
        min-width: 14px;
        text-align: center;
        line-height: 1;
    }

    @media (max-width: 600px) {
        .header {
            padding: 10px 8px;
            gap: 8px;
        }

        .logo-btn {
            width: 44px;
            height: 44px;
        }

        .logo {
            font-size: 24px;
        }

        .player-name-field {
            padding: 5px 8px;
        }

        .name-input {
            font-size: 11px;
            min-width: 50px;
            max-width: 60px;
        }

        .action-btn {
            width: 40px;
            height: 40px;
        }
    }
</style>
