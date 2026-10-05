/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const FALLBACK = `<!doctype html><html><head><meta charset="utf-8">
<title>Server offline</title></head><body style="font-family:sans-serif;text-align:center;padding:4rem">
<h1>🛰️ Ground station offline</h1><p>The home server is down. Back soon.</p></body></html>`;

export default {
  async fetch(request) {
    try {
      const res = await fetch(request);
      if (res.status === 530 || res.status === 502) return fallback();
      return res;
    } catch {
      return fallback();
    }
  },
};

const fallback = () =>
  new Response(FALLBACK, {
    status: 503,
    headers: { "content-type": "text/html; charset=utf-8", "retry-after": "300" },
  });