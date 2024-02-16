<script>
    export let letter = {
        showAttemp: false,
        status: 'back',
        value: '',
        newStatus: ''
    };
    export let isInputIndex = false;

    export let filter = ''
</script>

<div style={filter} on:click on:keydown class="flip-card {letter.showAttemp ? 'show-attemp' : ''} { isInputIndex ? 'input-index' : ''}">
    <div class="flip-card-inner">
        <div class="word-block flip-card-front {letter.status}">
            {letter.value}
        </div>
        <div class="word-block flip-card-back {letter.newStatus}">
            {letter.value}
        </div>
    </div>
</div>

<style>
    .flip-card {
        height: 50px;
        width: 50px;
        perspective: 1000px; /* Remove this if you don't want the 3D effect */
    }

    /* This container is needed to position the front and back side */
    .flip-card-inner {
        position: relative;
        width: 100%;
        height: 100%;
        text-align: center;
        transform-style: preserve-3d;
    }

    .show-attemp .flip-card-inner {
        transition: transform 0.6s;
    }

    /* Do an horizontal flip when you move the mouse over the flip box container */
    .flip-card.show-attemp .flip-card-inner {
        transform: rotateY(180deg);
    }

    /* Position the front and back side */
    .flip-card-front,
    .flip-card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        -webkit-backface-visibility: hidden; /* Safari */
        backface-visibility: hidden;
    }

    /* Style the back side */
    .flip-card-back {
        transform: rotateY(180deg);
    }
</style>
