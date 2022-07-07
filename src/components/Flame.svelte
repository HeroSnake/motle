<script>
	import { config } from '../config.js'
	import { game } from '../game.js'

	$: getColor = (i) => {
		if ($game.userData.username == 'tgm' || $game.userData.streak >= 99) {
			return config.ranks[i % config.ranks.length]
		} else {
			return config.ranks[Math.min(Math.floor($game.userData.streak/5), config.ranks.length - 1)]
		}
	}

</script>

<div class="fire">
	{#each Array(50) as _, i}
		<div class="particle" style="background-image: radial-gradient({i % 4 == 0 ? '#ff5000' : getColor(i) } 20%, #fff0 70%);" />
	{/each}
</div>

<style>
	body {
		background-color: #300808;
		margin: 0;
	}

	.fire {
		font-size: 3px;
		filter: blur(0.02em);
		-webkit-filter: blur(0.02em);
		position: relative;
		width: 10em;
		height: 10em;
	}

	.particle {
		animation: rise 1s ease-in infinite;
		background-image: radial-gradient(#ff5000 20%, #ff500000 70%);
		border-radius: 50%;
		mix-blend-mode: screen;
		opacity: 0;
		position: absolute;
		bottom: 0;
		width: 5em;
		height: 5em;
	}
	.particle:nth-of-type(1) {
		animation-delay: 0.2734457388s;
		left: calc((100% - 5em) * 0);
	}
	.particle:nth-of-type(2) {
		animation-delay: 0.9403400252s;
		left: calc((100% - 5em) * 0.02);
	}
	.particle:nth-of-type(3) {
		animation-delay: 0.8522349417s;
		left: calc((100% - 5em) * 0.04);
	}
	.particle:nth-of-type(4) {
		animation-delay: 0.2966079301s;
		left: calc((100% - 5em) * 0.06);
	}
	.particle:nth-of-type(5) {
		animation-delay: 0.208211064s;
		left: calc((100% - 5em) * 0.08);
	}
	.particle:nth-of-type(6) {
		animation-delay: 0.6962406571s;
		left: calc((100% - 5em) * 0.1);
	}
	.particle:nth-of-type(7) {
		animation-delay: 0.5617181123s;
		left: calc((100% - 5em) * 0.12);
	}
	.particle:nth-of-type(8) {
		animation-delay: 0.1634589037s;
		left: calc((100% - 5em) * 0.14);
	}
	.particle:nth-of-type(9) {
		animation-delay: 0.308981123s;
		left: calc((100% - 5em) * 0.16);
	}
	.particle:nth-of-type(10) {
		animation-delay: 0.7763932263s;
		left: calc((100% - 5em) * 0.18);
	}
	.particle:nth-of-type(11) {
		animation-delay: 0.0303190566s;
		left: calc((100% - 5em) * 0.2);
	}
	.particle:nth-of-type(12) {
		animation-delay: 0.5930347802s;
		left: calc((100% - 5em) * 0.22);
	}
	.particle:nth-of-type(13) {
		animation-delay: 0.04970953s;
		left: calc((100% - 5em) * 0.24);
	}
	.particle:nth-of-type(14) {
		animation-delay: 0.4020040321s;
		left: calc((100% - 5em) * 0.26);
	}
	.particle:nth-of-type(15) {
		animation-delay: 0.6143729173s;
		left: calc((100% - 5em) * 0.28);
	}
	.particle:nth-of-type(16) {
		animation-delay: 0.2890775131s;
		left: calc((100% - 5em) * 0.3);
	}
	.particle:nth-of-type(17) {
		animation-delay: 0.571062967s;
		left: calc((100% - 5em) * 0.32);
	}
	.particle:nth-of-type(18) {
		animation-delay: 0.7120909944s;
		left: calc((100% - 5em) * 0.34);
	}
	.particle:nth-of-type(19) {
		animation-delay: 0.9830303912s;
		left: calc((100% - 5em) * 0.36);
	}
	.particle:nth-of-type(20) {
		animation-delay: 0.5111453467s;
		left: calc((100% - 5em) * 0.38);
	}
	.particle:nth-of-type(21) {
		animation-delay: 0.6555420851s;
		left: calc((100% - 5em) * 0.4);
	}
	.particle:nth-of-type(22) {
		animation-delay: 0.8311586896s;
		left: calc((100% - 5em) * 0.42);
	}
	.particle:nth-of-type(23) {
		animation-delay: 0.4029760895s;
		left: calc((100% - 5em) * 0.44);
	}
	.particle:nth-of-type(24) {
		animation-delay: 0.0870751659s;
		left: calc((100% - 5em) * 0.46);
	}
	.particle:nth-of-type(25) {
		animation-delay: 0.473352983s;
		left: calc((100% - 5em) * 0.48);
	}
	.particle:nth-of-type(26) {
		animation-delay: 0.6493430936s;
		left: calc((100% - 5em) * 0.5);
	}
	.particle:nth-of-type(27) {
		animation-delay: 0.1330329484s;
		left: calc((100% - 5em) * 0.52);
	}
	.particle:nth-of-type(28) {
		animation-delay: 0.2933684363s;
		left: calc((100% - 5em) * 0.54);
	}
	.particle:nth-of-type(29) {
		animation-delay: 0.4496150549s;
		left: calc((100% - 5em) * 0.56);
	}
	.particle:nth-of-type(30) {
		animation-delay: 0.1052605508s;
		left: calc((100% - 5em) * 0.58);
	}
	.particle:nth-of-type(31) {
		animation-delay: 0.4714220786s;
		left: calc((100% - 5em) * 0.6);
	}
	.particle:nth-of-type(32) {
		animation-delay: 0.1569601451s;
		left: calc((100% - 5em) * 0.62);
	}
	.particle:nth-of-type(33) {
		animation-delay: 0.1837271313s;
		left: calc((100% - 5em) * 0.64);
	}
	.particle:nth-of-type(34) {
		animation-delay: 0.1563733925s;
		left: calc((100% - 5em) * 0.66);
	}
	.particle:nth-of-type(35) {
		animation-delay: 0.7833638979s;
		left: calc((100% - 5em) * 0.68);
	}
	.particle:nth-of-type(36) {
		animation-delay: 0.3382361431s;
		left: calc((100% - 5em) * 0.7);
	}
	.particle:nth-of-type(37) {
		animation-delay: 0.3675653802s;
		left: calc((100% - 5em) * 0.72);
	}
	.particle:nth-of-type(38) {
		animation-delay: 0.8192209177s;
		left: calc((100% - 5em) * 0.74);
	}
	.particle:nth-of-type(39) {
		animation-delay: 0.343174599s;
		left: calc((100% - 5em) * 0.76);
	}
	.particle:nth-of-type(40) {
		animation-delay: 0.6893273913s;
		left: calc((100% - 5em) * 0.78);
	}
	.particle:nth-of-type(41) {
		animation-delay: 0.5631561193s;
		left: calc((100% - 5em) * 0.8);
	}
	.particle:nth-of-type(42) {
		animation-delay: 0.8141051791s;
		left: calc((100% - 5em) * 0.82);
	}
	.particle:nth-of-type(43) {
		animation-delay: 0.4642032968s;
		left: calc((100% - 5em) * 0.84);
	}
	.particle:nth-of-type(44) {
		animation-delay: 0.3427024134s;
		left: calc((100% - 5em) * 0.86);
	}
	.particle:nth-of-type(45) {
		animation-delay: 0.4153131406s;
		left: calc((100% - 5em) * 0.88);
	}
	.particle:nth-of-type(46) {
		animation-delay: 0.7433109309s;
		left: calc((100% - 5em) * 0.9);
	}
	.particle:nth-of-type(47) {
		animation-delay: 0.4020679792s;
		left: calc((100% - 5em) * 0.92);
	}
	.particle:nth-of-type(48) {
		animation-delay: 0.9408430272s;
		left: calc((100% - 5em) * 0.94);
	}
	.particle:nth-of-type(49) {
		animation-delay: 0.5120701988s;
		left: calc((100% - 5em) * 0.96);
	}
	.particle:nth-of-type(50) {
		animation-delay: 0.375793209s;
		left: calc((100% - 5em) * 0.98);
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(0) scale(1);
		}
		25% {
			opacity: 1;
		}
		to {
			opacity: 0;
			transform: translateY(-10em) scale(0);
		}
	}
</style>
