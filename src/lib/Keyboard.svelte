<script>
    import Icon from 'svelte-awesome'
    import { slide } from 'svelte/transition'
    import { Col } from '@sveltestrap/sveltestrap'
    import { arrowDown, arrowLeft } from 'svelte-awesome/icons'
    import { game, showModalName } from '../game.js'
    import { longpress } from '../action.js'

    $: keyInput = event => {
        let val = event.key.toUpperCase()
        if ($game.status == 'start') {
            if (!$game.modalName) {
                if ($game.keyboard.find(k => k.value == val)) {
                    game.inputVal(val)
                } else {
                    switch (val) {
                        case 'BACKSPACE':
                            game.suppVal()
                            break
                        case 'ENTER':
                            game.checkAttempt()
                            break
                        case 'ARROWRIGHT':
                            game.goRight()
                            break
                        case 'ARROWLEFT':
                            game.goLeft()
                            break
                        case 'HOME':
                            game.goStart()
                            break
                        case 'END':
                            game.goEnd()
                            break
                    }
                }
            } else if (val == 'ENTER') {
                showModalName.set(false)
            }
        }
    }
</script>

<svelte:window on:keydown={keyInput}/>
{#if ['pending', 'start'].includes($game.status) && !$game.modalName}
    <div class="keyboard" transition:slide>
        <Col xs="12" lg="5" class="keyboard-container">
            {#each $game.keyboard as key, index}
                {#if index == 20}
                    <button class="keyboard-key keyboard-input enter" on:click={ game.checkAttempt } on:keydown={ game.checkAttempt }>
                        <Icon data={ arrowDown }/>
                    </button>
                {/if}
                <button class="keyboard-letter keyboard-input { key.status }" on:click={() => game.inputVal(key.value)} on:keydown={() => game.inputVal(key.value)}>{ key.value }</button>
            {/each}
            <button class="keyboard-key keyboard-input supp" on:click={ game.suppVal } use:longpress on:longpress={game.clearAttempt}>
                <Icon data={ arrowLeft }/>
            </button>
        </Col>
    </div>
{/if}
