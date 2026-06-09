/* ====================================================================
   QUBE VPN — interactions
   ==================================================================== */
(function () {
  'use strict';

  /* ---------------- Connect demo ---------------- */
  const phone = document.getElementById('phone');
  const btn = document.getElementById('connect-btn');
  const statusVal = document.getElementById('status-val');
  const ipVal = document.getElementById('ip-val');
  const locVal = document.getElementById('loc-val');
  const hint = document.getElementById('phone-hint');

  const REAL_IP = '31.40.118.7';
  let connected = false;
  let busy = false;

  function randIp() {
    const r = () => Math.floor(Math.random() * 254) + 1;
    return `10.${r()}.${r()}.${r()}`;
  }

  if (btn) {
    btn.addEventListener('click', () => {
      if (busy) return;
      busy = true;
      if (!connected) {
        phone.dataset.state = 'connecting';
        statusVal.textContent = 'Connecting…';
        locVal.textContent = 'Finding route…';
        hint.textContent = 'Building your secure tunnel…';
        let ticks = 0;
        const scramble = setInterval(() => {
          ipVal.textContent = randIp();
          if (++ticks > 7) {
            clearInterval(scramble);
            phone.dataset.state = 'on';
            statusVal.textContent = 'Protected';
            ipVal.textContent = '185.94.27.' + (Math.floor(Math.random() * 200) + 12);
            locVal.textContent = 'Amsterdam 🇳🇱';
            hint.textContent = 'You\u2019re invisible. Tap again to disconnect.';
            connected = true;
            busy = false;
          }
        }, 130);
      } else {
        phone.dataset.state = 'off';
        statusVal.textContent = 'Unprotected';
        ipVal.textContent = REAL_IP;
        locVal.textContent = 'Exposed';
        hint.textContent = 'Tap the shield to connect';
        connected = false;
        busy = false;
      }
    });
  }

  /* live-ish clock on the phone */
  const clock = document.getElementById('phone-clock');
  function tick() {
    if (!clock) return;
    const d = new Date();
    clock.textContent = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }
  tick();
  setInterval(tick, 30000);

  /* ---------------- Server globe + list ---------------- */
  // x/y are positions on the 520x420 globe (center 260,210 r180)
  const SERVERS = [
    { id: 'nl', flag: '🇳🇱', name: 'Netherlands', city: 'Amsterdam', ping: 12, x: 270, y: 120 },
    { id: 'us', flag: '🇺🇸', name: 'United States', city: 'New York', ping: 78, x: 150, y: 170 },
    { id: 'gb', flag: '🇬🇧', name: 'United Kingdom', city: 'London', ping: 24, x: 232, y: 110 },
    { id: 'jp', flag: '🇯🇵', name: 'Japan', city: 'Tokyo', ping: 132, x: 410, y: 180 },
    { id: 'de', flag: '🇩🇪', name: 'Germany', city: 'Frankfurt', ping: 18, x: 300, y: 150 },
    { id: 'sg', flag: '🇸🇬', name: 'Singapore', city: 'Singapore', ping: 119, x: 388, y: 250 },
    { id: 'au', flag: '🇦🇺', name: 'Australia', city: 'Sydney', ping: 168, x: 405, y: 320 },
    { id: 'br', flag: '🇧🇷', name: 'Brazil', city: 'São Paulo', ping: 142, x: 178, y: 300 },
    { id: 'ca', flag: '🇨🇦', name: 'Canada', city: 'Toronto', ping: 82, x: 165, y: 130 },
    { id: 'fr', flag: '🇫🇷', name: 'France', city: 'Paris', ping: 21, x: 268, y: 158 },
  ];

  const dotsG = document.getElementById('dots');
  const listEl = document.getElementById('server-list');
  const routeLine = document.getElementById('route-line');
  const bannerFlag = document.getElementById('banner-flag');
  const bannerName = document.getElementById('banner-name');
  const bannerSm = document.getElementById('banner-sm');
  const SVGNS = 'http://www.w3.org/2000/svg';

  let activeId = null;

  function pingColor(p) {
    if (p < 40) return 'var(--accent)';
    if (p < 100) return 'var(--yellow)';
    return 'var(--blue)';
  }

  function select(id) {
    const s = SERVERS.find((x) => x.id === id);
    if (!s) return;
    activeId = id;
    // dots
    dotsG.querySelectorAll('.map-dot').forEach((d) => d.classList.toggle('active', d.dataset.id === id));
    // rows
    listEl.querySelectorAll('.server-row').forEach((r) => r.classList.toggle('active', r.dataset.id === id));
    // route line
    routeLine.setAttribute('x2', s.x);
    routeLine.setAttribute('y2', s.y);
    routeLine.setAttribute('opacity', '1');
    // banner
    bannerFlag.textContent = s.flag;
    bannerName.textContent = `${s.city}, ${s.name}`;
    bannerSm.textContent = `~${s.ping} ms · your traffic exits here, invisible to everyone else.`;
  }

  if (dotsG && listEl) {
    SERVERS.forEach((s) => {
      const dot = document.createElementNS(SVGNS, 'circle');
      dot.setAttribute('cx', s.x);
      dot.setAttribute('cy', s.y);
      dot.setAttribute('r', '7');
      dot.setAttribute('fill', pingColor(s.ping));
      dot.setAttribute('stroke', 'var(--line)');
      dot.setAttribute('stroke-width', '2');
      dot.setAttribute('class', 'map-dot');
      dot.dataset.id = s.id;
      dot.addEventListener('click', () => select(s.id));
      dotsG.appendChild(dot);

      const row = document.createElement('div');
      row.className = 'server-row';
      row.dataset.id = s.id;
      row.innerHTML =
        `<span class="server-flag">${s.flag}</span>` +
        `<div><div class="nm">${s.name}</div><div class="pg">${s.city}</div></div>` +
        `<div class="ping"><span class="ping-dot" style="background:${pingColor(s.ping)}"></span>${s.ping} ms</div>`;
      row.addEventListener('click', () => select(s.id));
      listEl.appendChild(row);
    });
    select('nl');
  }

  /* ---------------- Pricing toggle ---------------- */
  const toggle = document.getElementById('price-toggle');
  if (toggle) {
    const amts = document.querySelectorAll('.amt[data-price-month]');
    const bills = document.querySelectorAll('[data-bill]');
    function setCycle(cycle) {
      toggle.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.cycle === cycle));
      amts.forEach((a) => {
        a.textContent = cycle === 'year' ? a.dataset.priceYear : a.dataset.priceMonth;
      });
      bills.forEach((b) => {
        b.textContent = cycle === 'year' ? 'Billed yearly · save 55%' : 'Billed monthly';
      });
    }
    toggle.querySelectorAll('button').forEach((b) => {
      b.addEventListener('click', () => setCycle(b.dataset.cycle));
    });
  }
})();
