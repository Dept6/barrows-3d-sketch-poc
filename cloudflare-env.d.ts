export {};

declare global {
	/** Cloudflare/Worker runtime variables; add as needed */
	const __STATIC_CONTENT: unknown;
	interface Env {
		// Define KV/bindings here if used
	}
}
