import { h, E, prog } from './engine.js';
import { buildBackground, buildChrome } from './layers.js';
import { SCENES } from './scenes/index.js';

const OVERLAP = 0.5;
const SHOTS = ['home', 'peta', 'zona', 'deteksi', 'jalur', 'siaga', 'edukasi', 'tips', 'bantuan'];
// aspect (h/w) guesses used only while a screenshot file is missing
const FALLBACK_ASPECT = { home: 1.5, peta: 2.19, zona: 2.18, deteksi: 2.11, jalur: 1.96, siaga: 1.89, edukasi: 2.21, tips: 2.1, bantuan: 2.13 };

function loadImg(src) {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => img.decode().then(() => res(img), () => res(img));
    img.onerror = () => res(null);
    img.src = src;
  });
}

async function loadAssets() {
  const A = '../assets';
  const shots = {};
  for (const n of SHOTS) {
    let img = null, src = null;
    for (const ext of ['jpg', 'png', 'jpeg', 'webp']) {
      src = `${A}/screenshots/${n}.${ext}`;
      img = await loadImg(src);
      if (img) break;
    }
    shots[n] = img
      ? { ok: true, src, aspect: img.naturalHeight / img.naturalWidth }
      : { ok: false, src: null, aspect: FALLBACK_ASPECT[n] };
  }
  const photos = [];
  for (const n of ['foto1', 'foto2', 'foto3']) {
    const src = `${A}/photos/${n}.jpg`;
    const img = await loadImg(src);
    photos.push({ ok: !!img, src });
  }
  const cover = `${A}/logo/cover.jpg`;
  await loadImg(cover);
  const data = await (await fetch(`${A}/data.json`)).json();
  const geo = await (await fetch('./geo.json')).json();
  return { assets: { shots, photos, cover }, data, geo };
}

async function init() {
  const stage = document.getElementById('stage');
  const { assets, data, geo } = await loadAssets();

  // timeline
  let t = 0;
  const plan = SCENES.map((sc, i) => {
    const start = i === 0 ? 0 : t - OVERLAP;
    t = start + sc.dur;
    return { sc, start, end: t };
  });
  const total = plan[plan.length - 1].end;
  const chapterStart = {};
  plan.forEach(p => { const n = p.sc.chapter[0]; if (!(n in chapterStart)) chapterStart[n] = p.start; });
  const lightIn = (plan.find(p => p.sc.light)?.start ?? 1e9) - 0.4;
  const lastLight = [...plan].reverse().find(p => p.sc.light);
  const lightOut = lastLight ? lastLight.end - OVERLAP - 0.3 : 1e9;

  const bg = buildBackground(stage, { lightIn, lightOut });
  const cues = [];
  const scenesLayer = h('div', 'layer', stage);
  const ctx = { assets, data, geo, C: data.brand_colors };
  plan.forEach(p => {
    const root = h('div', `scene${p.sc.light ? ' light' : ''}`, scenesLayer);
    root.dataset.id = p.sc.id;
    const sctx = { ...ctx, cue: (lt, type, opt = {}) => cues.push({ t: +(p.start + lt).toFixed(3), type, ...opt }) };
    p.update = p.sc.build(root, sctx);
    p.root = root;
  });
  const chrome = buildChrome(stage, ctx, total);
  const chromeIn = plan[1].start + 0.2, chromeOut = plan[plan.length - 1].start + 0.3;

  window.seek = T => {
    bg.update(T);
    let info = null;
    for (const p of plan) {
      const lt = T - p.start;
      const vis = lt >= -0.0001 && lt <= p.sc.dur + 0.0001;
      p.root.style.display = vis ? '' : 'none';
      if (vis) {
        p.update(lt);
        if (lt >= 0 && (!info || p.start > info.start)) {
          info = { num: p.sc.chapter[0], name: p.sc.chapter[1], start: chapterStart[p.sc.chapter[0]] };
        }
      }
    }
    const visK = E.outExpo(prog(T, chromeIn, 0.8)) * (1 - E.inCubic(prog(T, chromeOut, 0.5)));
    chrome.update(T, info && info.num !== '01' ? info : null, bg.lightK(T), visK);
  };
  window.__timeline = plan.map(p => ({ id: p.sc.id, start: +p.start.toFixed(3), end: +p.end.toFixed(3), chapter: p.sc.chapter }));
  window.__duration = total;
  window.__cues = cues.sort((a, b) => a.t - b.t);
  window.__missing = SHOTS.filter(n => !assets.shots[n].ok);
  await document.fonts.ready;
  window.seek(0);
}

window.__ready = init();
