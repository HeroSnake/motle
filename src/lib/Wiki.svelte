<script>
    import { fade } from 'svelte/transition'
    import { game } from '../game'

    const handleBackdropClick = (e) => {
        if (e.target.classList.contains('wiki-modal-backdrop')) {
            const event = new CustomEvent('close')
            window.dispatchEvent(event)
        }
    }
</script>

<div class="wiki-modal-backdrop" transition:fade={{duration: 200}} on:click={handleBackdropClick}></div>
<div class="wiki-modal" transition:fade={{duration: 200}}>
    <button class="wiki-close" on:click on:keydown aria-label="Close">✕</button>
    <div class="wiki-content">
        <div id="wikiDiv">
            <iframe id="wiki" title="Word Definition" src="https://1mot.net/{$game.word.toLowerCase()}"></iframe>
        </div>
    </div>
</div>

<style>
    .wiki-modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 999;
    }

    .wiki-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
        width: 90vw;
        max-width: 480px;
        max-height: 85vh;
        border-radius: 12px;
        box-sizing: border-box;
    }

    .wiki-content {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .wiki-close {
        position: absolute;
        top: 0;
        right: 0;
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        z-index: 10;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
        touch-action: manipulation;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        background: rgba(0, 0, 0, 0.3);
    }

    .wiki-close:active {
        transform: scale(0.9);
    }

    iframe {
        position: absolute;
        top: -118px;
        width: 100%;
        min-width: 326px;
        height: 500px;
        left: 0;
        border: none;
    }

    #wikiDiv {
        width: 100%;
        min-width: 320px;
        max-width: 420px;
        height: 400px;
        overflow: hidden;
        position: relative;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    @media (max-width: 512px) {
        .wiki-modal {
            width: calc(100vw - 20px);
            max-height: 90vh;
        }

        iframe {
            width: 100%;
            min-width: 280px;
        }

        #wikiDiv {
            width: 100%;
            max-width: 360px;
        }
    }
</style>
