<script>
    import { slide, blur } from 'svelte/transition'
    import { game } from '../../game'
    import { Icon } from "svelte-awesome";
    import { fire } from "svelte-awesome/icons";

    $: angle = Math.min(310, Math.floor(($game.user.streak % 100) / 100 * 310))

    let showFlameSelector = false
    let selectedFlame = 'arcade'

    const flames = {
        arcade: { name: 'Arcade', threshold: 0 },
        glow: { name: 'Glow', threshold: 10 },
        neon: { name: 'Neon', threshold: 25 },
        cosmic: { name: 'Cosmic', threshold: 50 },
    }

    $: if ($game.user.selectedFlame !== false) {
        selectedFlame = $game.user.selectedFlame
    } else {
        for (const [name, flame] of Object.entries(flames)) {
            if ($game.user.streak >= flame.threshold) {
                selectedFlame = name
            }
        }
    }
</script>

<div class="streak-container">
    <button class="streak-btn" on:click={() => showFlameSelector = !showFlameSelector} title="Click to change flame style">
        {#if $game.user.streak == 0}
            <Icon data={fire} scale={1} />
        {:else}
            <div class="flame {selectedFlame}" style="--hue: {angle}deg;">
                <!-- Flame will be rendered via CSS -->
            </div>
        {/if}
        <span class="streak-count">{$game.user.streak}</span>
    </button>

    {#if showFlameSelector}
        <div class="flame-selector" transition:slide>
            {#each Object.entries(flames) as [name, flame]}
                {#if $game.user.streak >= flame.threshold}
                    <button
                        class="flame-option {selectedFlame === name ? 'selected' : ''}"
                        on:click={() => {
                            game.changeFlame(name);
                            selectedFlame = name;
                        }}
                        title={flame.name}
                        transition:blur
                    >
                        <div class="flame-mini {name}" style="--hue: {angle}deg;"></div>
                        <span>{flame.name}</span>
                    </button>
                {/if}
            {/each}
        </div>
    {/if}
</div>

<style>
    .streak-container {
        position: relative;
        display: inline-flex;
        align-items: center;
    }

    .streak-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.08);
        border: 1.5px solid currentColor;
        border-radius: 8px;
        padding: 6px 10px;
        cursor: pointer;
        color: currentColor;
        font-family: inherit;
        font-size: 12px;
        font-weight: 600;
        transition: all 0.2s ease;
    }

    .streak-btn:active {
        transform: scale(0.95);
        background: rgba(255, 255, 255, 0.15);
    }

    /* Flame Displays */
    .flame {
        width: 18px;
        height: 18px;
        position: relative;
        display: inline-block;
    }

    /* Arcade Flame - Bright pixelated style */
    .flame.arcade::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 6px;
        height: 12px;
        background: linear-gradient(to top, #ff4400, #ff8800, #ffcc00);
        clip-path: polygon(20% 0%, 0% 100%, 50% 70%, 100% 100%, 80% 0%);
        animation: arcadeFlame 0.4s ease-in-out infinite;
        filter: hue-rotate(var(--hue));
    }

    /* Glow Flame - Smooth glowing orb */
    .flame.glow::before {
        content: '';
        position: absolute;
        bottom: 2px;
        left: 50%;
        transform: translateX(-50%);
        width: 10px;
        height: 14px;
        background: radial-gradient(circle at 30% 30%, #ffff99, #ff8800, transparent);
        border-radius: 50% 50% 50% 0%;
        animation: glowFlame 0.6s ease-in-out infinite;
        filter: hue-rotate(var(--hue)) blur(1px);
    }

    /* Neon Flame - Electric neon style */
    .flame.neon::before,
    .flame.neon::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        border-radius: 50%;
        filter: hue-rotate(var(--hue));
    }

    .flame.neon::before {
        width: 8px;
        height: 14px;
        background: linear-gradient(to top, #ff0088, #ff44ff);
        clip-path: polygon(30% 0%, 0% 100%, 50% 60%, 100% 100%, 70% 0%);
        animation: neonFlame 0.35s ease-in-out infinite;
        box-shadow: 0 0 8px currentColor;
    }

    .flame.neon::after {
        width: 12px;
        height: 16px;
        background: radial-gradient(circle, rgba(255, 68, 255, 0.4), transparent);
        animation: neonGlow 0.35s ease-in-out infinite;
        z-index: -1;
    }

    /* Cosmic Flame - Multi-colored mystical */
    .flame.cosmic {
        background: linear-gradient(135deg, rgba(255, 0, 255, 0.6), rgba(0, 255, 255, 0.6));
        border-radius: 50%;
        animation: cosmicPulse 0.8s ease-in-out infinite;
        filter: hue-rotate(var(--hue));
    }

    .flame.cosmic::before {
        content: '';
        position: absolute;
        inset: -2px;
        background: linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff00ff);
        border-radius: 50%;
        animation: cosmicRotate 3s linear infinite;
        opacity: 0.5;
        z-index: -1;
    }

    /* Mini Flames for Selector */
    .flame-mini {
        width: 16px;
        height: 16px;
        position: relative;
    }

    .flame-mini.arcade::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 5px;
        height: 10px;
        background: linear-gradient(to top, #ff4400, #ffcc00);
        clip-path: polygon(20% 0%, 0% 100%, 50% 70%, 100% 100%, 80% 0%);
        animation: arcadeFlame 0.4s ease-in-out infinite;
        filter: hue-rotate(var(--hue));
    }

    .flame-selector {
        position: absolute;
        top: 100%;
        left: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 8px;
        background: rgba(0, 0, 0, 0.9);
        border: 1.5px solid currentColor;
        border-radius: 8px;
        margin-top: 4px;
        z-index: 100;
        min-width: 120px;
    }

    .flame-option {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        cursor: pointer;
        color: currentColor;
        font-size: 11px;
        font-family: inherit;
        font-weight: 500;
        opacity: 0.7;
        transition: all 0.2s ease;
    }

    .flame-option:hover {
        background: rgba(255, 255, 255, 0.1);
        opacity: 0.9;
    }

    .flame-option.selected {
        opacity: 1;
        background: rgba(255, 255, 255, 0.15);
        border-color: currentColor;
    }

    /* Animations */
    @keyframes arcadeFlame {
        0%, 100% { height: 12px; opacity: 1; }
        50% { height: 14px; opacity: 0.8; }
    }

    @keyframes glowFlame {
        0%, 100% { height: 14px; width: 10px; opacity: 1; }
        50% { height: 16px; width: 12px; opacity: 0.8; }
    }

    @keyframes neonFlame {
        0%, 100% { height: 14px; opacity: 1; }
        50% { height: 16px; opacity: 0.9; }
    }

    @keyframes neonGlow {
        0%, 100% { width: 12px; height: 16px; opacity: 0.3; }
        50% { width: 16px; height: 18px; opacity: 0.6; }
    }

    @keyframes cosmicPulse {
        0%, 100% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.1); opacity: 1; }
    }

    @keyframes cosmicRotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .streak-count {
        font-weight: 700;
        min-width: 16px;
        text-align: right;
    }
</style>
