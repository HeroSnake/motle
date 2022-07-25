<script>
    import { slide } from 'svelte/transition'
    import { game } from '../game'
</script>

<div transition:slide>
    <iframe id="inlineFrameExample" title="Inline Frame Example" width="300" height="200" src="https://fr.m.wiktionary.org/wiki/{$game.word.toLowerCase()}#content-collapsible-block-0"></iframe>
</div>
