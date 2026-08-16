<script>
    import Icon from 'svelte-awesome'
    import { slide } from 'svelte/transition'
    import { Col } from '@sveltestrap/sveltestrap'
    import { arrowLeft, checkCircle } from 'svelte-awesome/icons'
    import { game } from '../game.js'
    import { longpress } from '../action.js'

    const keyInput = event => {
        let val = event.key.toUpperCase()
        if ($game.status == 'start') {
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
        }
    }
</script>

<svelte:window on:keydown={keyInput}/>
{#if ['pending', 'start'].includes($game.status)}
    <div class="keyboard" transition:slide>
        <Col xs="12" class="keyboard-container">
            {#each $game.keyboard as key, index}
                {#if index == 20}
                    <button class="keyboard-key keyboard-input enter" on:click={ game.checkAttempt } on:keydown={ game.checkAttempt }>
                        <Icon data={ checkCircle } scale={1.5}/>
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
