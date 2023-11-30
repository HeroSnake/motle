<script>
    import { slide } from 'svelte/transition'
    import { game } from '../game'
</script>

<div transition:slide id="wikiDiv">
    <iframe id="wiki" title="Word Definition" src="https://1mot.net/{$game.word.toLowerCase()}"></iframe>
</div>

<style>
    iframe {
        background-color: white;
        position: absolute;
        top: -118px;
        width: 326px;
        height: 500px;
        left: 0;
    }
    #wikiDiv {
        width: 326px;
        height: 400px;
        overflow: hidden;
        position: relative;
    }
</style>
