import App from './App.svelte';

var app = new App({
	target: document.body
});

// Prevent double-tap to zoom
let lastTouchEnd = 0;
	document.addEventListener(
	'touchend',
	(event) => {
		const now = new Date().getTime();
		if (now - lastTouchEnd <= 300) {
		event.preventDefault();
		}
		lastTouchEnd = now;
	},
	false
);

// Prevent pinch-to-zoom
document.addEventListener(
	'touchstart',
	(event) => {
		if (event.touches.length > 1) {
		event.preventDefault();
		}
	},
	{ passive: false }
);

document.addEventListener(
	'gesturestart',
	(event) => {
		event.preventDefault();
	},
	{ passive: false }
);

export default app;
