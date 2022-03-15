<script>
    import { getContext } from 'svelte';
    import Popup from './AppPopup.svelte';

    export let playerName

    const { open } = getContext('simple-modal');
    const showSurprise = () => open(Popup, {playerName: playerName});
</script>

<span on:click={showSurprise}>{playerName}</span>