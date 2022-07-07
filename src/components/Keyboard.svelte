<script>
    import Icon from 'svelte-awesome'
	import { slide } from 'svelte/transition'
    import { Col } from 'sveltestrap'
	import { arrowDown, arrowLeft } from 'svelte-awesome/icons'
    import { game } from '../game.js'

	$: keyInput = event => {
		let val = event.key.toUpperCase()
		if ($game.status == 'start') {
			if (!$game.modalName) {
				if ($game.keyboard.find(k => k.value == val)) {
					game.inputVal(val)
				} else if (val == 'BACKSPACE') {
					game.suppVal()
				} else if (val == 'ENTER') {
					game.checkAttempt()
				} else if (val == 'ARROWRIGHT') {
					game.goRight()
				} else if (val == 'ARROWLEFT') {
					game.goLeft()
				}
			} else if (val == 'ENTER') {
				game.setModalName(false)
			}
		}
	}
</script>

<svelte:window on:keydown={keyInput}/>
{#if ['pending', 'start'].includes($game.status)}
    <div class="keyboard" transition:slide>
        <Col xs="12" lg="5" class="keyboard-container">
            {#each $game.keyboard as key, index}
                {#if index == 20}
                    <div class="keyboard-key keyboard-input enter" on:click={ game.checkAttempt }>
                        <Icon data={ arrowDown }/>
                    </div>
                {/if}
                <div class="keyboard-letter keyboard-input { key.status }" on:click={() => game.inputVal(key.value)}>{ key.value }</div>
            {/each}
            <div class="keyboard-key keyboard-input supp" on:click={ game.suppVal }>
                <Icon data={ arrowLeft }/>
            </div>
        </Col>
    </div>
{/if}
