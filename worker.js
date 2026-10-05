// whoops: serves a fallback page when the home server (Cloudflare Tunnel) is unreachable.
// Paste this whole file into the Worker editor and deploy.

export default {
  async fetch(request) {
    try {
      const res = await fetch(request);
      // 530 = tunnel down (error 1033), 502 = tunnel up but the service is down
      if (res.status === 530 || res.status === 502) return fallback(request);
      return res;
    } catch {
      return fallback(request);
    }
  },
};

function fallback(request) {
  const headers = {
    "cache-control": "no-store",
    "retry-after": "30",
    "x-whoops": "1",
  };
  const wantsHtml = (request.headers.get("accept") || "").includes("text/html");
  if (request.method === "HEAD") return new Response(null, { status: 503, headers });
  if (!wantsHtml) {
    return new Response("503: this home server is in transit to its permanent station. Try again later.\n", {
      status: 503,
      headers: { ...headers, "content-type": "text/plain; charset=utf-8" },
    });
  }
  return new Response(HTML, {
    status: 503,
    headers: { ...headers, "content-type": "text/html; charset=utf-8" },
  });
}

const HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<title>In transit</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='30' fill='%23000'/%3E%3Ccircle cx='32' cy='60' r='26' fill='%23000' stroke='%23F2B35E' stroke-width='2'/%3E%3Ccircle cx='32' cy='32' r='5' fill='%23fff'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
:root{
  --void:#000;
  --hull:#E8EBEE;
  --dust:#8A929B;
  --faint:#262B31;
  --corona:#F2B35E;
  --font:"Jost","Futura","Century Gothic","Avenir Next",system-ui,sans-serif;
}
*{box-sizing:border-box}
html{background:var(--void);color:var(--hull);font-family:var(--font);font-weight:400;-webkit-font-smoothing:antialiased}
body{margin:0;min-height:100vh;font-size:17px;line-height:1.55}
a{color:inherit}
:focus-visible{outline:2px solid var(--corona);outline-offset:3px;border-radius:2px}
.num{font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}

#stars{position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}
main,header,footer{position:relative;z-index:1}

/* ---------- top bar ---------- */
.bar{position:absolute;top:0;left:0;right:0;z-index:5;display:flex;justify-content:space-between;align-items:center;
  padding:calc(20px + env(safe-area-inset-top,0px)) clamp(20px,4vw,48px) 20px;font-size:14px;color:var(--dust);letter-spacing:.04em}
.bar strong{color:var(--hull);font-weight:500;letter-spacing:.18em}
.bar .clock span{color:var(--hull)}

/* ---------- hero ---------- */
.hero{position:relative;min-height:100vh;min-height:100svh;overflow:hidden;display:flex;flex-direction:column;align-items:center;
  justify-content:flex-start;text-align:center;padding:clamp(110px,16vh,180px) 24px 34vh}
.hero::after{content:"";position:absolute;left:0;right:0;bottom:0;height:18vh;z-index:4;pointer-events:none;background:linear-gradient(transparent,#000)}
.greeting{margin:0 0 18px;color:var(--dust);font-size:15px;letter-spacing:.06em}
h1{margin:0;font-weight:300;font-size:clamp(46px,10.5vw,160px);line-height:1;letter-spacing:.34em;padding-left:.34em;
  text-transform:uppercase;white-space:nowrap}
.sub{margin:28px 0 0;font-size:clamp(19px,2.1vw,25px);font-weight:400;max-width:30ch}
.voice{margin:18px auto 0;max-width:52ch;color:var(--dust)}
.status{display:flex;justify-content:center;margin:40px 0 0;padding:0;list-style:none;border-top:1px solid var(--faint);border-bottom:1px solid var(--faint)}
.status li{padding:14px clamp(14px,2.6vw,34px);text-align:left}
.status li+li{border-left:1px solid var(--faint)}
.status small{display:block;color:var(--dust);font-size:13px;letter-spacing:.03em}
.status b{font-weight:400;font-size:16px;overflow-wrap:anywhere}
.dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--corona);margin-right:8px;vertical-align:1px;animation:blink 2.4s ease-in-out infinite}
.status.ok .dot{background:#7FD9A0;animation:none}
@keyframes blink{50%{opacity:.25}}

/* the sunrise: a planet limb with a star cresting it */
.limb{position:absolute;left:50%;top:76%;width:300vw;max-width:4200px;aspect-ratio:1;transform:translateX(-50%);border-radius:50%;z-index:2;
  background:radial-gradient(circle at 50% 0%,#0b0d10 0,#000 18%);
  box-shadow:inset 0 2px 0 rgba(255,226,186,.55),inset 0 14px 40px rgba(120,150,210,.10),0 -1px 28px rgba(242,179,94,.22),0 -30px 160px rgba(110,140,220,.07)}
.sun{position:absolute;left:50%;top:76%;width:520px;height:520px;margin:-260px 0 0 -260px;z-index:1;pointer-events:none;
  background:radial-gradient(circle,#fff 0 8px,#FFF1D9 11px,rgba(255,214,150,.6) 30px,rgba(242,179,94,.22) 90px,rgba(242,179,94,.06) 190px,transparent 70%);
  animation:rise 7s cubic-bezier(.2,.6,.15,1) .4s both}
.flare{position:absolute;left:50%;top:76%;width:min(1100px,92vw);height:2px;transform:translate(-50%,-1px);z-index:3;pointer-events:none;
  background:linear-gradient(90deg,transparent,rgba(255,236,205,.0) 10%,rgba(255,236,205,.75) 50%,rgba(255,236,205,0) 90%,transparent);
  filter:blur(.4px);animation:flare 7s cubic-bezier(.2,.6,.15,1) .4s both}
@keyframes rise{from{transform:translateY(90px);opacity:.0}to{transform:translateY(-4px);opacity:1}}
@keyframes flare{0%,35%{opacity:0;transform:translate(-50%,-1px) scaleX(.2)}100%{opacity:1;transform:translate(-50%,-1px) scaleX(1)}}
h1{animation:track 4.2s cubic-bezier(.16,.7,.2,1) both}
@keyframes track{from{letter-spacing:.9em;padding-left:.9em;opacity:0}to{letter-spacing:.34em;padding-left:.34em;opacity:1}}
.fadein{animation:fade 1.6s ease 2.2s both}
@keyframes fade{from{opacity:0}to{opacity:1}}

/* ---------- content ---------- */
.wrap{max-width:1200px;margin:0 auto;padding:0 clamp(20px,4vw,48px)}
.section{padding-top:clamp(70px,10vw,120px)}
h2{margin:0;font-weight:300;font-size:clamp(32px,4.2vw,52px);letter-spacing:.02em;line-height:1.1}
.lede{margin:14px 0 0;color:var(--dust);max-width:58ch}
.grid{display:grid;grid-template-columns:minmax(0,8fr) minmax(0,4fr);gap:clamp(28px,4vw,56px);margin-top:44px;align-items:start}

/* game window */
.window{position:relative;border-radius:22px;padding:10px;background:linear-gradient(180deg,#15181c,#0a0b0d);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 30px 80px rgba(0,0,0,.6)}
.screen{position:relative;border-radius:14px;overflow:hidden;background:radial-gradient(ellipse at 30% 20%,#07090c,#000 70%)}
#game{display:block;width:100%;aspect-ratio:5/3;touch-action:none;cursor:crosshair}
#game:focus-visible{outline-offset:-3px}
.msg{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;
  background:rgba(0,0,0,.55);backdrop-filter:blur(2px);opacity:0;pointer-events:none;transition:opacity .35s}
.msg.show{opacity:1;pointer-events:auto}
.msg p{margin:0;font-size:clamp(20px,2.4vw,28px);font-weight:300;letter-spacing:.04em}
.msg span{color:var(--dust);font-size:15px}
.hud{display:flex;flex-wrap:wrap;gap:10px 24px;justify-content:space-between;align-items:center;padding:16px 8px 6px}
.hud h3{margin:0;font-weight:500;font-size:17px}
.hud .meta{margin:2px 0 0;color:var(--dust);font-size:15px}
.hud .sep{display:inline-block;width:1px;height:12px;background:#3A4048;margin:0 12px;vertical-align:-1px}
.btns{display:flex;gap:8px}
button{font:inherit;font-size:15px;color:var(--hull);background:transparent;border:1px solid #3A4048;border-radius:999px;padding:7px 16px;cursor:pointer;transition:border-color .2s,background .2s}
button:hover{border-color:var(--hull)}
button.primary{background:var(--corona);border-color:var(--corona);color:#000;font-weight:500}
button.primary:hover{background:#f7c47c}
.how{margin:10px 8px 4px;color:var(--dust);font-size:15px;max-width:70ch}
.how kbd{font:inherit;border:1px solid #3A4048;border-radius:4px;padding:0 5px;font-size:13px;color:var(--hull)}

/* ISS */
.iss h3{margin:0;font-weight:500;font-size:20px}
.iss p{margin:6px 0 0;color:var(--dust);font-size:15px}
#globe{display:block;width:100%;max-width:380px;aspect-ratio:1;margin:22px auto 8px}
.iss dl{display:grid;grid-template-columns:auto 1fr;gap:9px 18px;margin:18px 0 0;font-size:16px}
.iss dt{color:var(--dust)}
.iss dd{margin:0;text-align:right}
.iss .src{font-size:13px;margin-top:16px}

/* links */
.further{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(24px,4vw,56px);margin-top:44px}
.further h3{margin:0 0 6px;font-weight:400;font-size:15px;color:var(--dust);letter-spacing:.04em}
.further ul{list-style:none;margin:0;padding:0;border-top:1px solid var(--faint)}
.further li{border-bottom:1px solid var(--faint)}
.further a{display:block;padding:18px 0 17px;text-decoration:none;transition:color .2s}
.further a b{display:block;font-weight:400;font-size:19px;line-height:1.3}
.further a span{display:block;color:var(--dust);font-size:15px;margin-top:4px}
.further a i{display:block;font-style:normal;font-size:13px;color:#5d646c;margin-top:8px}
.further a:hover b{color:var(--corona)}

footer{margin-top:clamp(90px,12vw,150px);padding:28px clamp(20px,4vw,48px) calc(28px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--faint);
  display:flex;flex-wrap:wrap;gap:8px 24px;justify-content:space-between;color:var(--dust);font-size:14px}

@media (max-width:900px){
  .grid{grid-template-columns:1fr}
  .further{grid-template-columns:1fr}
}
@media (max-width:600px){
  body{font-size:16px}
  .bar{font-size:13px}
  .bar strong{letter-spacing:.1em}
  h1{letter-spacing:.22em;padding-left:.22em}
  @keyframes track{from{letter-spacing:.6em;padding-left:.6em;opacity:0}to{letter-spacing:.22em;padding-left:.22em;opacity:1}}
  .status{display:grid;grid-template-columns:1fr 1fr;width:100%;max-width:380px}
  .status li:first-child{grid-column:1/-1;border-bottom:1px solid var(--faint)}
  .status li:nth-child(2){border-left:0}
  .hero{padding-bottom:30vh}
  .limb,.sun,.flare{top:80%}
}
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation:none!important;transition:none!important}
}
</style>
</head>
<body>
<canvas id="stars" aria-hidden="true"></canvas>

<header class="bar">
  <strong>YK-01 GROUND STATION</strong>
  <div class="clock">Mission time <span class="num" id="met">00:00:00</span></div>
</header>

<main>
  <section class="hero">
    <p class="greeting" id="greeting">Good evening.</p>
    <h1>In transit</h1>
    <p class="sub fadein">Yann's home server is on its way to its permanent station.</p>
    <p class="voice fadein">I'm afraid the station can't take your call right now. All systems are functioning normally and the crew is in hibernation for the crossing. This page will reconnect by itself the moment the signal returns. In the meantime, there is plenty to see out here.</p>
    <ul class="status fadein" id="status" aria-live="polite">
      <li><small>Requested</small><b id="host">this module</b></li>
      <li><small>Signal</small><b><i class="dot"></i><span id="signal">Lost</span></b></li>
      <li><small>Next check</small><b class="num" id="next">0:30</b></li>
    </ul>
    <div class="sun" aria-hidden="true"></div>
    <div class="limb" aria-hidden="true"></div>
    <div class="flare" aria-hidden="true"></div>
  </section>

  <section class="section wrap" aria-labelledby="wait">
    <h2 id="wait">While you wait</h2>
    <p class="lede">Steer a probe through real gravity, watch the space station cross the planet, or head further out.</p>

    <div class="grid">
      <div>
        <div class="window">
          <div class="screen">
            <canvas id="game" tabindex="0" aria-label="Gravity assist game. Use arrow keys to aim, Enter to launch."></canvas>
            <div class="msg" id="msg" role="status"><p id="msgText"></p><span id="msgSub"></span><button class="primary" id="msgBtn" type="button">Next orbit</button></div>
          </div>
          <div class="hud">
            <div><h3>Gravity assist</h3><p class="meta num"><span id="lvlName">Orbit 1 of 5</span><span class="sep"></span><span id="attempts">Launches: 0</span></p></div>
            <div class="btns">
              <button type="button" id="resetBtn">Clear trails</button>
              <button type="button" id="skipBtn">Skip orbit</button>
            </div>
          </div>
        </div>
        <p class="how">Drag backwards anywhere on the screen and let go to launch the probe, like a slingshot. Planets pull on it, so curve your path into the gold beacon. Keyboard: <kbd>←</kbd><kbd>→</kbd> to aim, <kbd>↑</kbd><kbd>↓</kbd> for power, <kbd>Enter</kbd> to launch.</p>
      </div>

      <aside class="iss" aria-labelledby="issTitle">
        <h3 id="issTitle">The ISS, right now</h3>
        <p>A crew of astronauts, about 400 km up, circling the planet every 92 minutes.</p>
        <canvas id="globe" aria-hidden="true"></canvas>
        <dl>
          <dt>Over</dt><dd class="num" id="issPos">Acquiring</dd>
          <dt>Altitude</dt><dd class="num" id="issAlt">-</dd>
          <dt>Speed</dt><dd class="num" id="issVel">-</dd>
          <dt>Lighting</dt><dd id="issVis">-</dd>
        </dl>
        <p class="src">Live telemetry from wheretheiss.at, refreshed every 5 seconds.</p>
      </aside>
    </div>
  </section>

  <section class="section wrap" aria-labelledby="out">
    <h2 id="out">Further out</h2>
    <p class="lede">The station is dark, but the rest of the sky isn't. A few places worth losing an evening in.</p>
    <div class="further">
      <div>
        <h3>Space</h3>
        <ul>
          <li><a href="https://eyes.nasa.gov/apps/solar-system/" target="_blank" rel="noopener"><b>Eyes on the Solar System</b><span>Ride along with real spacecraft through NASA's live 3D model of the solar system.</span><i>eyes.nasa.gov</i></a></li>
          <li><a href="https://stellarium-web.org/" target="_blank" rel="noopener"><b>Stellarium Web</b><span>A full planetarium in the browser. See tonight's sky from wherever you are.</span><i>stellarium-web.org</i></a></li>
          <li><a href="https://joshworth.com/dev/pixelspace/pixelspace_solarsystem.html" target="_blank" rel="noopener"><b>If the Moon were only 1 pixel</b><span>Scroll across a solar system drawn to scale. Bring patience, and maybe snacks.</span><i>joshworth.com</i></a></li>
        </ul>
      </div>
      <div>
        <h3>Science</h3>
        <ul>
          <li><a href="https://htwins.net/scale2/" target="_blank" rel="noopener"><b>The Scale of the Universe</b><span>Zoom from the smallest meaningful length to the edge of everything we can observe.</span><i>htwins.net</i></a></li>
          <li><a href="https://ciechanow.ski/" target="_blank" rel="noopener"><b>Bartosz Ciechanowski</b><span>Interactive essays on GPS, light, sound and mechanics, made with astonishing care.</span><i>ciechanow.ski</i></a></li>
          <li><a href="https://neal.fun/space-elevator/" target="_blank" rel="noopener"><b>Space Elevator</b><span>Ride from the ground to space and find out what lives at every altitude.</span><i>neal.fun</i></a></li>
        </ul>
      </div>
      <div>
        <h3>Radio and computing</h3>
        <ul>
          <li><a href="https://network.satnogs.org/" target="_blank" rel="noopener"><b>SatNOGS Network</b><span>Hundreds of amateur ground stations, like this one, listening to satellites together.</span><i>network.satnogs.org</i></a></li>
          <li><a href="https://globe.adsbexchange.com/" target="_blank" rel="noopener"><b>ADS-B Exchange</b><span>Every aircraft overhead, decoded live by volunteers with radio receivers.</span><i>adsbexchange.com</i></a></li>
          <li><a href="https://eater.net/8bit" target="_blank" rel="noopener"><b>Ben Eater's 8-bit computer</b><span>Build a working computer from logic chips on breadboards, one wire at a time.</span><i>eater.net</i></a></li>
        </ul>
      </div>
    </div>
  </section>
</main>

<footer>
  <span>yannklein.dev ground station. Transmission resumes on arrival.</span>
  <span>HTTP 503, temporarily unavailable</span>
</footer>

<script>
(function(){
"use strict";
var LIVE = true;
var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
var DPR = Math.min(window.devicePixelRatio || 1, 2);
function $(id){ return document.getElementById(id); }
function pad(n){ return (n < 10 ? "0" : "") + n; }

/* ---------- greeting, clock, host ---------- */
var h = new Date().getHours();
$("greeting").textContent = h >= 5 && h < 12 ? "Good morning." : h >= 12 && h < 18 ? "Good afternoon." : "Good evening.";
$("host").textContent = location.hostname || "this module";
var t0 = Date.now();
setInterval(function(){
  var s = Math.floor((Date.now() - t0) / 1000);
  $("met").textContent = pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s / 60) % 60) + ":" + pad(s % 60);
}, 1000);

/* ---------- signal reacquisition ---------- */
var PERIOD = 30, left = PERIOD;
function setNext(){ $("next").textContent = Math.floor(left / 60) + ":" + pad(left % 60); }
function check(){
  if (!LIVE) { left = PERIOD; return; }
  $("next").textContent = "Checking";
  fetch(location.href, { method: "HEAD", cache: "no-store", redirect: "manual" }).then(function(r){
    var up = r.type === "opaqueredirect" || (!r.headers.get("x-whoops") && r.status < 500);
    if (up) {
      $("status").classList.add("ok");
      $("signal").textContent = "Reacquired";
      $("next").textContent = "Reconnecting";
      setTimeout(function(){ location.reload(); }, 1800);
    } else { left = PERIOD; setNext(); }
  }).catch(function(){ left = PERIOD; setNext(); });
}
setInterval(function(){
  if ($("status").classList.contains("ok")) return;
  left--; if (left <= 0) check(); else setNext();
}, 1000);

/* ---------- starfield ---------- */
var sc = $("stars"), sx = sc.getContext("2d"), stars = [], SW = 0, SH = 0;
function sizeStars(){
  SW = innerWidth; SH = innerHeight;
  sc.width = SW * DPR; sc.height = SH * DPR;
  sx.setTransform(DPR, 0, 0, DPR, 0, 0);
  var n = Math.round(SW * SH / 2600);
  stars = [];
  for (var i = 0; i < n; i++) {
    var z = Math.random();
    stars.push({ x: Math.random() * SW, y: Math.random() * SH, z: z, r: z * z * 1.3 + 0.25, p: Math.random() * 6.28 });
  }
}
function drawStars(t){
  sx.clearRect(0, 0, SW, SH);
  for (var i = 0; i < stars.length; i++) {
    var s = stars[i];
    if (!reduce) { s.x -= 0.012 * (0.2 + s.z); if (s.x < -2) s.x = SW + 2; }
    var a = 0.25 + 0.6 * s.z + (reduce ? 0 : 0.15 * Math.sin(t / 900 + s.p));
    sx.globalAlpha = Math.max(0, Math.min(1, a));
    sx.fillStyle = "#fff";
    sx.fillRect(s.x, s.y, s.r, s.r);
  }
  sx.globalAlpha = 1;
}
sizeStars();
addEventListener("resize", sizeStars);

/* ---------- gravity assist ---------- */
var W = 1000, H = 600, DT = 1 / 240, TMAX = 14, MAXV = 560;
var LEVELS = [
  { name: "First light", start: [120, 300], target: [880, 300, 34], bodies: [[500, 345, 42, 3.0e6]] },
  { name: "Around the back", start: [120, 480], target: [860, 130, 24], bodies: [[500, 300, 70, 1.2e7]] },
  { name: "Two bodies", start: [100, 300], target: [910, 300, 24], bodies: [[380, 210, 45, 6e6], [640, 390, 45, 6e6]] },
  { name: "Hairpin", start: [160, 330], target: [160, 110, 26], bodies: [[620, 300, 55, 1.6e7], [170, 220, 38, 1.5e6]] },
  { name: "Moonrise", start: [100, 520], target: [900, 90, 24], bodies: [[500, 300, 60, 1.3e7]], moon: [500, 300, 150, 18, 1.5e6, 6.0] }
];
var gc = $("game"), g = gc.getContext("2d"), scale = 1, K = 1;
var S = { lvl: 0, state: "aim", launches: 0, ghosts: [], trail: [], p: null, t: 0, acc: 0, aim: { a: -0.12, s: 300 }, drag: null, endT: 0 };

function bodiesAt(L, t){
  var b = L.bodies.slice();
  if (L.moon) { var m = L.moon, an = 2 * Math.PI * t / m[5]; b.push([m[0] + m[2] * Math.cos(an), m[1] + m[2] * Math.sin(an), m[3], m[4]]); }
  return b;
}
function stepP(p, L, t){
  var b = bodiesAt(L, t), ax = 0, ay = 0;
  for (var i = 0; i < b.length; i++) {
    var dx = b[i][0] - p.x, dy = b[i][1] - p.y, d2 = dx * dx + dy * dy;
    if (d2 < b[i][2] * b[i][2]) return "crash";
    var d = Math.sqrt(d2), f = b[i][3] / (d2 + 100);
    ax += f * dx / d; ay += f * dy / d;
  }
  p.vx += ax * DT; p.vy += ay * DT; p.x += p.vx * DT; p.y += p.vy * DT;
  var T = L.target, ex = p.x - T[0], ey = p.y - T[1];
  if (ex * ex + ey * ey < T[2] * T[2]) return "win";
  if (p.x < -150 || p.x > W + 150 || p.y < -150 || p.y > H + 150) return "lost";
  return null;
}
function sizeGame(){
  var w = gc.clientWidth; if (!w) return;
  gc.width = Math.round(w * DPR); gc.height = Math.round(w * 0.6 * DPR);
  scale = gc.width / W;
  K = Math.min(2.2, Math.max(1, 720 / w));
}
new ResizeObserver(sizeGame).observe(gc);

function setLevel(i){
  S.lvl = i; S.state = "aim"; S.ghosts = []; S.trail = []; S.p = null; S.launches = 0;
  var L = LEVELS[i];
  var T = L.target, s0 = L.start;
  S.aim = { a: Math.atan2(T[1] - s0[1], T[0] - s0[0]) * 0.6, s: 300 };
  $("lvlName").textContent = "Orbit " + (i + 1) + " of " + LEVELS.length + ": " + L.name;
  $("attempts").textContent = "Launches: 0";
  $("skipBtn").textContent = i === LEVELS.length - 1 ? "Restart" : "Skip orbit";
  hideMsg();
}
function launch(){
  if (S.state !== "aim") return;
  var L = LEVELS[S.lvl];
  S.p = { x: L.start[0], y: L.start[1], vx: Math.cos(S.aim.a) * S.aim.s, vy: Math.sin(S.aim.a) * S.aim.s };
  S.trail = [[S.p.x, S.p.y]]; S.t = 0; S.acc = 0; S.state = "fly"; S.launches++;
  $("attempts").textContent = "Launches: " + S.launches;
}
function endFlight(result){
  S.ghosts.push(S.trail); if (S.ghosts.length > 8) S.ghosts.shift();
  if (result === "win") {
    S.state = "won";
    var last = S.lvl === LEVELS.length - 1;
    showMsg(last ? "Mission complete" : "Beacon reached",
      S.launches === 1 ? "First try. The flight computer is impressed." : "In " + S.launches + " launches.",
      last ? "Fly it again" : "Next orbit");
  } else {
    S.state = "fail"; S.endT = performance.now();
    S.failText = result === "crash" ? "Impact. The probe met a planet." : result === "lost" ? "Lost to deep space." : "Out of fuel and time.";
  }
}
function showMsg(t, s, b){ $("msgText").textContent = t; $("msgSub").textContent = s; $("msgBtn").textContent = b; $("msg").classList.add("show"); $("msgBtn").focus({ preventScroll: true }); }
function hideMsg(){ $("msg").classList.remove("show"); }
$("msgBtn").onclick = function(){ setLevel((S.lvl + 1) % LEVELS.length); gc.focus({ preventScroll: true }); };
$("skipBtn").onclick = function(){ setLevel((S.lvl + 1) % LEVELS.length); };
$("resetBtn").onclick = function(){ S.ghosts = []; if (S.state !== "fly") { S.trail = []; } };

function toWorld(e){ var r = gc.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; }
gc.addEventListener("pointerdown", function(e){
  if (S.state === "fail") S.state = "aim";
  if (S.state !== "aim") return;
  var w = toWorld(e); S.drag = { x0: w[0], y0: w[1] }; gc.setPointerCapture(e.pointerId);
});
gc.addEventListener("pointermove", function(e){
  if (!S.drag) return;
  var w = toWorld(e), dx = S.drag.x0 - w[0], dy = S.drag.y0 - w[1], len = Math.hypot(dx, dy);
  if (len < 6) return;
  S.aim.a = Math.atan2(dy, dx); S.aim.s = Math.min(MAXV, len * 2.4);
});
gc.addEventListener("pointerup", function(e){
  if (!S.drag) return;
  var w = toWorld(e), len = Math.hypot(S.drag.x0 - w[0], S.drag.y0 - w[1]);
  S.drag = null;
  if (len > 12) launch();
});
gc.addEventListener("pointercancel", function(){ S.drag = null; });
gc.addEventListener("keydown", function(e){
  var k = e.key, used = true;
  if (S.state === "fail") S.state = "aim";
  if (k === "ArrowLeft") S.aim.a -= e.shiftKey ? 0.002 : 0.02;
  else if (k === "ArrowRight") S.aim.a += e.shiftKey ? 0.002 : 0.02;
  else if (k === "ArrowUp") S.aim.s = Math.min(MAXV, S.aim.s + (e.shiftKey ? 2 : 10));
  else if (k === "ArrowDown") S.aim.s = Math.max(40, S.aim.s - (e.shiftKey ? 2 : 10));
  else if (k === "Enter" || k === " ") launch();
  else used = false;
  if (used) e.preventDefault();
});

function circle(x, y, r){ g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); }
function path(pts, alpha, width){
  if (pts.length < 2) return;
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (var i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.strokeStyle = "rgba(232,235,238," + alpha + ")"; g.lineWidth = width; g.stroke();
}
function drawGame(now){
  if (!gc.width) sizeGame();
  var L = LEVELS[S.lvl], t = S.state === "fly" ? S.t : 0;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, gc.width, gc.height);
  g.setTransform(scale, 0, 0, scale, 0, 0);
  g.lineCap = "round"; g.lineJoin = "round";

  // gravity wells
  var b = bodiesAt(L, t);
  for (var i = 0; i < b.length; i++) {
    for (var k = 1; k <= 4; k++) { circle(b[i][0], b[i][1], b[i][2] * (1 + k * 0.85)); g.strokeStyle = "rgba(232,235,238," + (0.06 - k * 0.012) + ")"; g.lineWidth = 1; g.stroke(); }
  }
  if (L.moon) { circle(L.moon[0], L.moon[1], L.moon[2]); g.setLineDash([2, 7]); g.strokeStyle = "rgba(232,235,238,.14)"; g.stroke(); g.setLineDash([]); }

  // ghosts and trail
  for (i = 0; i < S.ghosts.length; i++) path(S.ghosts[i], 0.1, 1.2 * K);
  path(S.trail, 0.85, 1.6 * K);

  // bodies
  for (i = 0; i < b.length; i++) {
    var x = b[i][0], y = b[i][1], r = b[i][2];
    var gr = g.createRadialGradient(x - r * 0.45, y - r * 0.5, r * 0.05, x, y, r * 1.02);
    gr.addColorStop(0, "#C9CED4"); gr.addColorStop(0.35, "#6B727A"); gr.addColorStop(1, "#0E1013");
    circle(x, y, r); g.fillStyle = gr; g.fill();
    g.strokeStyle = "rgba(255,226,186,.18)"; g.lineWidth = 1; g.stroke();
  }

  // beacon
  var T = L.target, pulse = reduce ? 0.5 : (Math.sin(now / 420) + 1) / 2;
  circle(T[0], T[1], T[2] + 10 + pulse * 10); g.strokeStyle = "rgba(242,179,94," + (0.35 - pulse * 0.3) + ")"; g.lineWidth = 1.5; g.stroke();
  circle(T[0], T[1], T[2]); g.strokeStyle = "#F2B35E"; g.lineWidth = 2 * K; g.stroke();
  circle(T[0], T[1], 3); g.fillStyle = "#F2B35E"; g.fill();

  // launch pad
  var s0 = L.start;
  circle(s0[0], s0[1], 12); g.strokeStyle = "rgba(232,235,238,.25)"; g.lineWidth = 1; g.stroke();

  // aim and short prediction
  if (S.state === "aim" || S.state === "fail") {
    var ax = Math.cos(S.aim.a), ay = Math.sin(S.aim.a), len = (30 + S.aim.s * 0.12) * Math.sqrt(K);
    g.beginPath(); g.moveTo(s0[0], s0[1]); g.lineTo(s0[0] + ax * len, s0[1] + ay * len);
    g.strokeStyle = "rgba(242,179,94,.9)"; g.lineWidth = 2 * K; g.stroke();
    var q = { x: s0[0], y: s0[1], vx: ax * S.aim.s, vy: ay * S.aim.s }, steps = 130;
    for (i = 0; i < steps; i++) {
      if (stepP(q, L, i * DT)) break;
      if (i % 10 === 0) { circle(q.x, q.y, 1.4 * K); g.fillStyle = "rgba(232,235,238," + (0.7 * (1 - i / steps)) + ")"; g.fill(); }
    }
    g.fillStyle = "rgba(138,146,155,.9)"; g.font = Math.round(15 * K) + "px Jost, system-ui, sans-serif"; g.textAlign = "left";
    g.fillText("Power " + Math.round(S.aim.s / MAXV * 100) + "%", 24, H - 24);
  }

  // probe
  var px = S.p && S.state === "fly" ? S.p.x : s0[0], py = S.p && S.state === "fly" ? S.p.y : s0[1];
  var pg = g.createRadialGradient(px, py, 0, px, py, 14 * K);
  pg.addColorStop(0, "rgba(255,255,255,.9)"); pg.addColorStop(1, "rgba(255,255,255,0)");
  circle(px, py, 14 * K); g.fillStyle = pg; g.fill();
  circle(px, py, 3.2 * K); g.fillStyle = "#fff"; g.fill();

  // failure caption
  if (S.state === "fail") {
    var a2 = Math.max(0, 1 - (now - S.endT) / 2600);
    if (a2 > 0) { g.fillStyle = "rgba(232,235,238," + a2 + ")"; g.font = "300 " + Math.round(26 * Math.min(K, 1.6)) + "px Jost, system-ui, sans-serif"; g.textAlign = "center"; g.fillText(S.failText, W / 2, 56); }
    else S.state = "aim";
  }
}
function updateGame(dt){
  if (S.state !== "fly") return;
  var L = LEVELS[S.lvl];
  S.acc += Math.min(dt, 0.1);
  var n = 0;
  while (S.acc >= DT && n < 80) {
    var r = stepP(S.p, L, S.t);
    S.t += DT; S.acc -= DT; n++;
    if (n % 3 === 0) S.trail.push([S.p.x, S.p.y]);
    if (!r && S.t > TMAX) r = "time";
    if (r) { S.trail.push([S.p.x, S.p.y]); endFlight(r); return; }
  }
}
setLevel(0);

/* ---------- ISS globe ---------- */
var MASK = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAfAP8HAAAAAAAAAAAAAAAAAAAAAADo//z//wcAAAAAAAACAAAAAAAAAAAAhvvw//8PAPABAAAAwAMAAAAAAAAAwADkw////wEABAAAAABgAAAAAAAAAADAUT8A/v8PAAAAAAwA/j8AuAEAAAAAcBHtDcD/fwAAAAAwAPz/fwMAABCAAQD5w/wD8P8FAAAcAIL7//9//xOAAP/ff0668QD/HwAA+A8At///////v3/w/////x8++B8AAOD/1//7////////jP////+/+AE/gAcAn9f//////////w/w/////wEs4AEAAHz+////////////gL////8HeAAcAADg5///////////9ADgAf7/f4AnAAAAAH78////////H0QAAAiA//8f8AcAAIBB4////////38ADwAQAOD//5//AQAAHAT/////////A3AAAAAA/v//+T8AAGDz//////////8DAQAAAMD/////AwAAsP//////////LwAAAAAA6P///2IAAAD+//////////8CAAAAAAD///8/CAAA4P//////////JwAAAAAA8P///wYAAAD+/unz/////z8AAAAAAAD///8HAAAA/pgPPP//////MQAAAAAA8P//PwAAAMBD9v7n/////wcBAAAAAAD///8AAAAAPkD7f/7///8hEAAAAAAA4P//DwAAAIDhAv/n////f8YAAAAAAAD8//8AAAAA+AdE//////8jDwAAAAAAgP//AwAAAMD/APD/////PxgAAAAAAADw/x8AAAAA/n/v//////8HAAAAAAAAAPwDAgAAAOD////7////fwAAAAAAAACgHyAAAACA//9/f/7///8DAAAAAAAAAPQBAAAAAPj//+cv+P//PwAAAAAAAAAAHjAAAADA/////g/+//8EAAAAAAAAAOBhCAAAAP7//99/4D//AAAAAAAAAAAAPAMEAADA////+Qf84BcAAAAAAAAAAAA/AAAAAPz//58fgAf+QAAAAAAAAAAAAA8AAADg////ewA4gA8EAAAAAAAAAADAAAAAAPz//38BgAP4QQAAAAAAAAAAAAgPAADA////zwAwgAwQAAAAAAAAAAAA9Q8AAPj///8HAAVIAAAAAAAAAAAAAID/AQAA////fwBAAAAQAAAAAAAAAAAA+P8AAGDh//8DAAA0GAAAAAAAAAAAAID/HwAAAPj/HwAAgMIBAAAAAAAAAAAA/P8BAACA//8AAAAYXgAAAAAAAAAAAMD/fwAAAPz/BwAAAOOBAQAAAAAAAAAA/P8/AACA/z8AAABgbtQBAAAAAAAAAOD//w8AAPD/AwAAAAQIeAAAAAAAAAAA/P//AQAA/z8AAACAA4APAQAAAAAAAID//w8AAPD/AwAAAAARsEAAAAAAAAAA+P9/AAAA/j8AAAAAAAAAAAAAAAAAAAD//wcAAPD/QwAAAACAIwAAAAAAAAAA8P9/AAAA/z8EAAAAAD8GIAAAAAAAAAD8/wMAAPD/cQAAAAD4ZwAAAAAAAAAAgP8/AAAA/w8HAAAAgP8HAAAAAAAAAAD4/wMAAOD/MAAAAAD//wEBAAAAAAAAgP8PAAAA/g8DAAAA+P8fAAAAAAAAAAD4PwAAAOB/EAAAAID//wMAAAAAAAAAgP8DAAAA/AMAAAAA+P9/AAAAAAAAAAD8HwAAAMA/AAAAAID//wcAAAAAAAAAwP8BAAAA+AEAAAAA8P9/AAAAAAAAAAD8DwAAAIAPAAAAAAAP/gMAAAAAAAAAwB8AAAAAAAAAAAAAEIAfAAEAAAAAAAD+AwAAAAAAAAAAAAAA8AEgAAAAAAAA4AcAAAAAAAAAAAAAAAAAAAYAAAAAAABeAAAAAAAAAAAAAAAAwAAwAAAAAAAAwAMAAAAAAAAAAAAAAAAIgAEAAAAAAAAeAAAAAAAAAAAAAAAAAAAMAAAAAAAA4AEAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAAAAAAAAAAABAAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAB4AEDwn/8HAAAAAAAAAAAwAAAAAACA/P/h/////w8AAAAAAAAAwAcAAAD4////z///////PwAAAAAAHALwAACA//////////////8HAADw/y///wMAAP7/////////////HwAA+P///38AAID///////////////8AAPL/////BwAO////////////////DwAA8P////8HEPD//////////////z8AAOD/////////////////////////H/AfwP//////////////////////////////////////////////////////////////////////////////////////";
var land = (function(){
  var bin = atob(MASK), out = [], STEP = 2, rows = 90, cols = 180;
  for (var r = 0; r < rows; r++) {
    var lat = (90 - STEP / 2 - r * STEP) * Math.PI / 180, cl = Math.cos(lat), every = Math.max(1, Math.round(1 / Math.max(cl, 0.15)));
    for (var c = 0; c < cols; c++) {
      if (c % every) continue;
      var i = r * cols + c;
      if (bin.charCodeAt(i >> 3) & (1 << (i & 7))) {
        var lon = (-180 + STEP / 2 + c * STEP) * Math.PI / 180;
        out.push([Math.sin(lat), cl, lon]);
      }
    }
  }
  return out;
})();
var gl = $("globe"), gx = gl.getContext("2d");
var ISS = { lat: 20, lon: 0, tlat: null, tlon: null, trail: [] };
var D2R = Math.PI / 180;
function poll(){
  fetch("https://api.wheretheiss.at/v1/satellites/25544", { cache: "no-store" }).then(function(r){ return r.json(); }).then(function(d){
    if (typeof d.latitude !== "number") throw 0;
    if (ISS.tlat === null) { ISS.lat = d.latitude; ISS.lon = d.longitude; }
    ISS.tlat = d.latitude; ISS.tlon = d.longitude;
    ISS.trail.push([d.latitude, d.longitude]); if (ISS.trail.length > 400) ISS.trail.shift();
    $("issPos").textContent = Math.abs(d.latitude).toFixed(1) + "° " + (d.latitude >= 0 ? "N" : "S") + ", " + Math.abs(d.longitude).toFixed(1) + "° " + (d.longitude >= 0 ? "E" : "W");
    $("issAlt").textContent = Math.round(d.altitude) + " km";
    $("issVel").textContent = Math.round(d.velocity).toLocaleString("en-US") + " km/h";
    $("issVis").textContent = d.visibility === "daylight" ? "In sunlight" : "In Earth's shadow";
  }).catch(function(){
    if (ISS.tlat === null) $("issPos").textContent = "Telemetry unavailable";
  });
}
poll(); setInterval(poll, 5000);

function proj(sinLat, cosLat, lon, c){
  var dl = lon - c.lon, cd = Math.cos(dl);
  var z = c.sl * sinLat + c.cl * cosLat * cd;
  return [cosLat * Math.sin(dl), c.cl * sinLat - c.sl * cosLat * cd, z];
}
function drawGlobe(now){
  var w = gl.clientWidth; if (!w) return;
  if (gl.width !== Math.round(w * DPR)) { gl.width = gl.height = Math.round(w * DPR); }
  var size = gl.width, R = size / 2 / 1.13, cx = size / 2, cy = size / 2;
  if (ISS.tlat !== null) {
    ISS.lat += (ISS.tlat - ISS.lat) * 0.04;
    var dlon = ((ISS.tlon - ISS.lon + 540) % 360) - 180;
    ISS.lon += dlon * 0.04;
  } else if (!reduce) { ISS.lon += 0.05; }
  var c = { lon: ISS.lon * D2R, sl: Math.sin(ISS.lat * D2R * 0.85), cl: Math.cos(ISS.lat * D2R * 0.85) };
  gx.clearRect(0, 0, size, size);

  // atmosphere halo
  var halo = gx.createRadialGradient(cx, cy, R * 0.96, cx, cy, R * 1.12);
  halo.addColorStop(0, "rgba(140,170,230,.18)"); halo.addColorStop(1, "rgba(140,170,230,0)");
  gx.fillStyle = halo; gx.beginPath(); gx.arc(cx, cy, R * 1.12, 0, 7); gx.fill();
  var body = gx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
  body.addColorStop(0, "#0d1116"); body.addColorStop(1, "#020304");
  gx.fillStyle = body; gx.beginPath(); gx.arc(cx, cy, R, 0, 7); gx.fill();

  // graticule
  gx.fillStyle = "rgba(232,235,238,.10)";
  for (var la = -60; la <= 60; la += 30) {
    var sL = Math.sin(la * D2R), cL = Math.cos(la * D2R);
    for (var lo = -180; lo < 180; lo += 3) { var p = proj(sL, cL, lo * D2R, c); if (p[2] > 0) gx.fillRect(cx + p[0] * R, cy - p[1] * R, DPR, DPR); }
  }
  for (lo = -180; lo < 180; lo += 30) {
    for (la = -88; la <= 88; la += 3) { var p2 = proj(Math.sin(la * D2R), Math.cos(la * D2R), lo * D2R, c); if (p2[2] > 0) gx.fillRect(cx + p2[0] * R, cy - p2[1] * R, DPR, DPR); }
  }

  // land
  var ds = 1.7 * DPR;
  for (var i = 0; i < land.length; i++) {
    var q = proj(land[i][0], land[i][1], land[i][2], c);
    if (q[2] <= 0) continue;
    gx.globalAlpha = 0.18 + 0.72 * q[2];
    gx.fillStyle = "#E8EBEE";
    gx.fillRect(cx + q[0] * R - ds / 2, cy - q[1] * R - ds / 2, ds, ds);
  }
  gx.globalAlpha = 1;

  // ground track
  if (ISS.trail.length > 1) {
    gx.beginPath(); var started = false;
    for (i = 0; i < ISS.trail.length; i++) {
      var tl = ISS.trail[i], pr = proj(Math.sin(tl[0] * D2R), Math.cos(tl[0] * D2R), tl[1] * D2R, c);
      if (pr[2] <= 0) { started = false; continue; }
      var X = cx + pr[0] * R, Y = cy - pr[1] * R;
      if (!started) { gx.moveTo(X, Y); started = true; } else gx.lineTo(X, Y);
    }
    gx.strokeStyle = "rgba(242,179,94,.7)"; gx.lineWidth = 1.5 * DPR; gx.stroke();
  }

  // station marker
  if (ISS.tlat !== null) {
    var m = proj(Math.sin(ISS.lat * D2R), Math.cos(ISS.lat * D2R), ISS.lon * D2R, c);
    var mx = cx + m[0] * R, my = cy - m[1] * R, ph = reduce ? 0.5 : (now / 1600) % 1;
    gx.beginPath(); gx.arc(mx, my, (6 + ph * 16) * DPR, 0, 7); gx.strokeStyle = "rgba(242,179,94," + (0.6 * (1 - ph)) + ")"; gx.lineWidth = 1.2 * DPR; gx.stroke();
    gx.beginPath(); gx.arc(mx, my, 3.5 * DPR, 0, 7); gx.fillStyle = "#F2B35E"; gx.fill();
  }
  gx.beginPath(); gx.arc(cx, cy, R, 0, 7); gx.strokeStyle = "rgba(232,235,238,.18)"; gx.lineWidth = DPR; gx.stroke();
}

/* ---------- loop ---------- */
var last = performance.now();
function frame(now){
  var dt = (now - last) / 1000; last = now;
  if (!document.hidden) { drawStars(now); updateGame(dt); drawGame(now); drawGlobe(now); }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
</script>
<noscript><p style="text-align:center;color:#8A929B;padding:0 24px 40px">The games and live telemetry need JavaScript, but the links above still work.</p></noscript>
</body>
</html>
`;