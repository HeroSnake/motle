<script context="module">
    let cache = { word: null, data: null }
</script>

<script>
    import { fade } from 'svelte/transition'
    import { game } from '../game'
    import { onMount } from 'svelte'

    let data = null
    let error = false
    let loading = true

    onMount(async () => {
        const word = $game.word.toLowerCase()
        if (cache.word === word && cache.data) {
            data = cache.data
            loading = false
            return
        }
        try {
            const res = await fetch(`https://freedictionaryapi.com/api/v1/entries/fr/${word}`)
            if (!res.ok) throw new Error()
            data = await res.json()
            cache = { word, data }
        } catch {
            error = true
        } finally {
            loading = false
        }
    })

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
        {#if loading}
            <p class="wiki-loading">Chargement...</p>
        {:else if error || !data}
            <p class="wiki-error">Définition introuvable</p>
        {:else}
            <h2 class="wiki-word">{data.word}</h2>
            {#each data.entries as entry}
                <div class="wiki-entry">
                    <span class="wiki-pos">{entry.partOfSpeech}</span>
                    {#if entry.pronunciations?.length}
                        <span class="wiki-ipa">{entry.pronunciations[0].text}</span>
                    {/if}
                    {#each entry.senses as sense, i}
                        <p class="wiki-def"><span class="wiki-def-num">{i + 1}.</span> {sense.definition}</p>
                        {#each sense.examples as ex}
                            <p class="wiki-example">« {ex} »</p>
                        {/each}
                        {#if sense.synonyms?.length}
                            <p class="wiki-syn">Synonymes : {sense.synonyms.map(s => s.word ?? s).join(', ')}</p>
                        {/if}
                    {/each}
                    {#if entry.synonyms?.length}
                        <p class="wiki-syn">Synonymes : {entry.synonyms.map(s => s.word ?? s).join(', ')}</p>
                    {/if}
                    {#if entry.antonyms?.length}
                        <p class="wiki-syn">Antonymes : {entry.antonyms.map(a => a.word ?? a).join(', ')}</p>
                    {/if}
                </div>
            {/each}
        {/if}
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
        padding: 20px;
        overflow-y: auto;
        max-height: 75vh;
        background: rgba(0, 0, 0, 0.85);
        border-radius: 12px;
        color: #eee;
    }

    .wiki-close {
        position: absolute;
        top: -12px;
        right: -12px;
        background: rgba(0, 0, 0, 0.6);
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
        color: #fff;
    }

    .wiki-close:active {
        transform: scale(0.9);
    }

    .wiki-loading, .wiki-error {
        text-align: center;
        padding: 40px 0;
        font-size: 1.1em;
        opacity: 0.7;
    }

    .wiki-word {
        text-transform: uppercase;
        font-size: 1.6em;
        margin: 0 0 12px;
        letter-spacing: 2px;
    }

    .wiki-entry {
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .wiki-entry:last-child {
        border-bottom: none;
    }

    .wiki-pos {
        display: inline-block;
        font-style: italic;
        opacity: 0.7;
        font-size: 0.95em;
        margin-right: 8px;
    }

    .wiki-ipa {
        opacity: 0.5;
        font-size: 0.9em;
    }

    .wiki-def {
        margin: 8px 0 4px;
        line-height: 1.4;
    }

    .wiki-def-num {
        font-weight: bold;
        margin-right: 4px;
        opacity: 0.6;
    }

    .wiki-example {
        margin: 2px 0 2px 16px;
        font-style: italic;
        opacity: 0.6;
        font-size: 0.9em;
    }

    .wiki-syn {
        margin: 4px 0;
        font-size: 0.85em;
        opacity: 0.6;
    }

    @media (max-width: 512px) {
        .wiki-modal {
            width: calc(100vw - 20px);
            max-height: 90vh;
        }
    }
</style>
