const byId = (id) => document.getElementById(id);
const music = byId('music');
const musicToggle = byId('music-toggle');
const motionToggle = byId('motion-toggle');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function syncMusic() {
  const playing = !music.paused;
  musicToggle.textContent = playing ? '♫ Pausar música' : '♫ Música';
  musicToggle.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
  musicToggle.setAttribute('aria-pressed', String(playing));
}

function setMotion(enabled) {
  document.body.classList.toggle('motion-off', !enabled);
  motionToggle.textContent = enabled ? '✦ Pausar animación' : '✦ Activar animación';
  motionToggle.setAttribute('aria-pressed', String(enabled));
}

music.addEventListener('playing', syncMusic);
music.addEventListener('pause', syncMusic);
syncMusic();
setMotion(!reducedMotion.matches);
motionToggle.addEventListener('click', () => setMotion(document.body.classList.contains('motion-off')));
musicToggle.addEventListener('click', () => {
  if (music.paused) music.play().catch(syncMusic);
  else music.pause();
});

const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('seen');
      revealObserver.unobserve(entry.target);
    }
  }
}, { threshold: 0.08 });

byId('open').addEventListener('click', () => {
  byId('open').disabled = true;
  byId('cover').classList.add('opening');
  music.volume = 0.6;
  music.play().catch(syncMusic);
  setTimeout(() => {
    byId('cover').hidden = true;
    byId('invitation').hidden = false;
    byId('controls').hidden = false;
    byId('quick-nav').hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.querySelector('#inicio h2').focus({ preventScroll: true });
    document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
  }, reducedMotion.matches ? 0 : 670);
}, { once: true });

const calendar = byId('calendar-days');
const novemberStart = new Date(Date.UTC(2026, 10, 1)).getUTCDay();
const emptyDays = (novemberStart + 6) % 7;
for (let day = 0; day < emptyDays; day += 1) calendar.append(document.createElement('span'));
for (let day = 1; day <= 30; day += 1) {
  const cell = document.createElement('span');
  cell.className = 'day';
  cell.textContent = day;
  if (day === 15) {
    cell.classList.add('marked');
    cell.setAttribute('aria-label', 'Domingo 15 de noviembre, baby shower');
    cell.innerHTML = '<svg class="paw" aria-hidden="true"><use href="#paw"/></svg><span>15</span>';
  }
  calendar.append(cell);
}

const eventTime = new Date('2026-11-15T15:00:00-04:00').getTime();
const countdownUnits = [
  ['days', 86400, Infinity],
  ['hours', 3600, 24],
  ['minutes', 60, 60],
  ['seconds', 1, 60],
];
function updateCountdown() {
  const remaining = Math.max(0, Math.floor((eventTime - Date.now()) / 1000));
  for (const [id, unit, modulus] of countdownUnits) {
    byId(id).textContent = String(Math.floor(remaining / unit) % modulus).padStart(2, '0');
  }
  if (remaining === 0) byId('countdown-label').textContent = '¡LLEGÓ EL DÍA DEL BABY SHOWER!';
}
updateCountdown();
setInterval(updateCountdown, 1000);

// Staggered left/right footprints travel up the margins, then fade away.
for (let trail = 0; trail < 2; trail += 1) {
  for (let step = 0; step < 9; step += 1) {
    const paw = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    paw.classList.add('walking-paw');
    paw.setAttribute('viewBox', '0 0 48 48');
    paw.innerHTML = '<use href="#paw"/>';
    const side = trail === 0 ? 'left' : 'right';
    paw.style[side] = `${2 + (step % 2) * 4}%`;
    paw.style.bottom = `${10 + step * 8}%`;
    paw.style.setProperty('--step-delay', `${step * 0.55 + trail * 6}s`);
    paw.style.setProperty('--paw-angle', `${trail === 0 ? -18 : 18}deg`);
    byId('embers').append(paw);
  }
}
for (let index = 0; index < 20; index += 1) {
  const fly = document.createElement('span');
  fly.className = 'firefly';
  fly.style.left = `${3 + (index * 37) % 94}%`;
  fly.style.top = `${9 + (index * 23) % 81}%`;
  fly.style.setProperty('--fly-size', `${3 + index % 3}px`);
  fly.style.setProperty('--blink', `${3.2 + (index % 6) * 0.7}s`);
  fly.style.setProperty('--drift', `${10 + index % 7}s`);
  fly.style.setProperty('--fly-delay', `${-index * 1.37}s`);
  byId('embers').append(fly);
}

const rsvpMessage = '¡Hola, Enrique! Quiero confirmar mi asistencia al baby shower del 15 de noviembre. Mi nombre es: ';
byId('rsvp').href += '?text=' + encodeURIComponent(rsvpMessage);

byId('share').addEventListener('click', async () => {
  const url = new URL(location.pathname, location.origin).href;
  const text = 'Te invitamos al baby shower el domingo 15 de noviembre de 2026 a las 15:00 en Yuppi Land. 🐾';
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Una aventura en la sabana', text, url });
    } else {
      await navigator.clipboard.writeText(text + '\n' + url);
      byId('share-status').textContent = 'Invitación copiada para compartir.';
    }
  } catch (error) {
    if (error.name !== 'AbortError') byId('share-status').textContent = 'Puedes copiar el enlace desde la barra del navegador.';
  }
});
