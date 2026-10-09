/// <reference types="@sveltejs/kit" />

import { build, files, version } from '$service-worker'

/**
 * Motle offline shell.
 *
 * Strategy
 *   - build assets (content-hashed JS/CSS/fonts/gifs): cache-first, immutable
 *   - navigations + everything else same-origin: network-first, cache fallback
 *   - cross-origin (freedictionaryapi.com): not intercepted, goes straight to network
 *
 * Precaching uses individual puts rather than cache.addAll so one 404 cannot abort
 * the whole install — a failed addAll leaves the app with no service worker at all.
 */

const CACHE = `motle-${version}`
const ASSETS = [...build, ...files]
const ASSET_SET = new Set(ASSETS)

// The SPA shell is not part of `build` when nothing is prerendered, so ask for it
// explicitly. Failure is tolerated — navigation falls back to the runtime cache.
const PRECACHE = [...ASSETS, '/']

self.addEventListener('install', event => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE)
			await Promise.all(
				PRECACHE.map(url =>
					cache.add(new Request(url, { cache: 'reload' })).catch(err => {
						console.warn('[sw] precache skipped', url, err)
					})
				)
			)
			await self.skipWaiting()
		})()
	)
})

self.addEventListener('activate', event => {
	event.waitUntil(
		(async () => {
			const keys = await caches.keys()
			await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))
			await self.clients.claim()
		})()
	)
})

async function cacheFirst(request) {
	const cached = await caches.match(request)
	if (cached) return cached

	try {
		const response = await fetch(request)
		if (response.ok) {
			const cache = await caches.open(CACHE)
			await cache.put(request, response.clone())
		}
		return response
	} catch {
		// A hashed asset that is neither cached nor reachable is unrecoverable, but
		// respondWith still needs a Response instead of a rejected promise.
		return new Response('', { status: 504, statusText: 'Offline' })
	}
}

async function networkFirst(request) {
	const cache = await caches.open(CACHE)

	try {
		const response = await fetch(request)
		// opaque and error responses must never displace a good cache entry
		if (response.ok && response.type === 'basic') {
			await cache.put(request, response.clone())
		}
		return response
	} catch {
		const cached = await cache.match(request)
		if (cached) return cached

		if (request.mode === 'navigate') {
			const shell = await cache.match('/')
			if (shell) return shell
		}

		return new Response('Hors ligne', {
			status: 503,
			statusText: 'Offline',
			headers: { 'Content-Type': 'text/plain; charset=utf-8' },
		})
	}
}

self.addEventListener('fetch', event => {
	const { request } = event

	if (request.method !== 'GET') return

	const url = new URL(request.url)
	// leave third-party requests (word definitions) completely alone
	if (url.origin !== self.location.origin) return

	if (ASSET_SET.has(url.pathname)) {
		event.respondWith(cacheFirst(request))
		return
	}

	event.respondWith(networkFirst(request))
})