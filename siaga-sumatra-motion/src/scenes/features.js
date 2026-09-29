import { E, prog, io, enter, pose, h, place, lerp, s, draw } from '../engine.js';
import { icon, shotCard } from '../components.js';
import { header, stepBadge, X0, CW, text } from './common.js';
import { camera } from './s04_peta.js';

// shared: kicker + headline + usage_flow badge + step detail line
function shell(root, ctx, { kicker, title, step, size = 70 }) {
  const S = ctx.data.chart_data.usage_flow.steps[step - 1];
  const hdr = header(root, { kicker, title, size });
  const badge = stepBadge(root, S, X0, 526);
  const det = text(root, 'body', S.detail, X0, 598, CW);
  det.style.fontSize = '28px';
  return (t, OUT) => {
    hdr(t, OUT);
    enter(badge, t, 0.6, OUT, { dx: -30, dy: 0 });
    enter(det, t, 0.8, OUT, { dy: 14 });
  };
}

function pulseRing(card, cx, cy, size = 0.16) {
  const r = card.ring(cx - size / 2, cy - (size / 2) / card.aspect, size, size / card.aspect);
  r.style.borderRadius = '50%';
  return r;
}

function ringFade(el, t, t0, t1) {
  const k = E.outBack(prog(t, t0, 0.5)) * (1 - E.inCubic(prog(t, t1, 0.35)));
  el.style.opacity = Math.min(1, k).toFixed(3);
  el.style.transform = `scale(${lerp(1.25, 1, Math.min(1, k)).toFixed(3)})`;
}

// 06_deteksi
export const s06 = {
  id: '06_deteksi', chapter: ['06', 'Deteksi Dini'], dur: 6.5,
  build(root, ctx) {
    const sh = shell(root, ctx, { kicker: 'Fitur · Deteksi Dini', title: 'Kenali *tanda bahaya* lebih awal', step: 2 });
    const card = shotCard(root, ctx, 'deteksi', { w: 540, hgt: 880 });
    place(card.el, 270, 660);
    const r1 = card.ring(0.03, 0.295, 0.94, 0.27);
    const r2 = card.ring(0.03, 0.66, 0.94, 0.155);
    ctx.cue(0.8, 'soft'); ctx.cue(2.3, 'tick'); ctx.cue(4.2, 'tick');
    const OUT = 5.85;
    return t => {
      sh(t, OUT);
      enter(card.el, t, 0.7, OUT, { dy: 140, s0: 0.92, din: 1.1 });
      camera(card, t, [{ t: 0, z: 1, fx: 0.5, fy: 0.12 }, { t: 2.4, z: 1, fx: 0.5, fy: 0.43, d: 1.1 }, { t: 4.4, z: 1, fx: 0.5, fy: 0.76, d: 1.1 }]);
      ringFade(r1, t, 2.3, 4.0);
      ringFade(r2, t, 4.3, 6.0);
    };
  },
};

// 07_jalur — card right, decorative route drawing left
export const s07 = {
  id: '07_jalur', chapter: ['07', 'Jalur Evakuasi'], dur: 6.5,
  build(root, ctx) {
    const sh = shell(root, ctx, { kicker: 'Fitur · Jalur Evakuasi', title: 'Rute dan *titik aman* terdekat', step: 4 });
    const card = shotCard(root, ctx, 'jalur', { w: 520, hgt: 880 });
    place(card.el, 488, 660);
    const you = pulseRing(card, 0.30, 0.57, 0.14);
    const safe = pulseRing(card, 0.77, 0.37, 0.14);
    you.style.borderColor = '#6E9BF0';
    safe.style.borderColor = '#5DBB63';

    const svg = s('svg', { width: 380, height: 820, class: 'abs' }, root);
    place(svg, X0, 690);
    const route = s('path', { d: 'M70 760 C 70 600, 300 620, 290 470 S 60 330, 120 190 S 150 90, 150 40', fill: 'none', stroke: '#3FB6C4', 'stroke-width': 10, 'stroke-linecap': 'round', pathLength: 1 }, svg);
    const dash = s('path', { d: route.getAttribute('d'), fill: 'none', stroke: '#0A1E36', 'stroke-width': 4, 'stroke-dasharray': '14 18' }, svg);
    const a = h('div', 'abs', root, `<span style="display:inline-flex;width:30px;height:30px;border-radius:50%;background:#6E9BF0;border:6px solid #fff;vertical-align:middle"></span> <b style="font-size:26px;vertical-align:middle;margin-left:8px">Lokasi Anda</b>`);
    place(a, X0 + 50, 690 + 740);
    const b = h('div', 'abs', root, `<span style="display:inline-flex;width:64px;height:64px;border-radius:50% 50% 50% 8px;transform:rotate(-45deg);background:#5DBB63;vertical-align:middle"></span> <b style="font-size:26px;vertical-align:middle;margin-left:10px">Titik aman</b>`);
    place(b, X0 + 118, 690 - 20);
    const dot = h('div', 'abs', root);
    Object.assign(dot.style, { width: '26px', height: '26px', borderRadius: '50%', background: '#fff', boxShadow: '0 0 0 8px rgba(255,255,255,.2)' });

    ctx.cue(0.8, 'soft'); ctx.cue(1.6, 'whoosh', { gain: 0.5 }); ctx.cue(4.0, 'pop');
    const OUT = 5.85;
    return t => {
      sh(t, OUT);
      enter(card.el, t, 0.7, OUT, { dx: 120, dy: 0, s0: 0.94, r0: 4, din: 1.1 });
      camera(card, t, [{ t: 0, z: 1, fx: 0.5, fy: 0 }, { t: 2.8, z: 1.3, fx: 0.52, fy: 0.5, d: 1.3 }, { t: 5.2, z: 1.08, fx: 0.5, fy: 0.72, d: 1.4 }]);
      const pulse = (t % 1.2) / 1.2;
      [you, safe].forEach((r, i) => {
        const on = E.linear(prog(t, 2.9 + i * 0.3, 0.3)) * (1 - E.linear(prog(t, 5.0, 0.3)));
        r.style.opacity = (on * (1 - pulse * 0.6)).toFixed(3);
        r.style.transform = `scale(${lerp(0.8, 1.4, pulse).toFixed(3)})`;
      });
      const rk = E.inOutCubic(prog(t, 1.5, 2.6));
      const ex = E.inCubic(prog(t, OUT, 0.45));
      draw(route, rk);
      svg.style.opacity = dash.style.opacity = (E.linear(prog(t, 1.4, 0.3)) * (1 - ex)).toFixed(3);
      enter(a, t, 1.4, OUT, { dy: 16 });
      enter(b, t, 3.8, OUT, { dy: 16, s0: 0.7 });
      const L = route.getTotalLength();
      const pt = route.getPointAtLength(L * rk);
      // the walker travels from "Lokasi Anda" (end of path) to "Titik aman"
      pose(dot, { x: X0 + pt.x - 13, y: 690 + pt.y - 13, o: rk > 0 && rk < 1 ? 1 - ex : 0 });
    };
  },
};

// 08_siaga — card left, checklist ticks drawn onto the screenshot's checkboxes
export const s08 = {
  id: '08_siaga', chapter: ['08', 'Mode Siaga'], dur: 6.5,
  build(root, ctx) {
    const sh = shell(root, ctx, { kicker: 'Fitur · Mode Siaga', title: 'Kebutuhan dasar *sebelum* bencana', step: 3 });
    const card = shotCard(root, ctx, 'siaga', { w: 520, hgt: 880 });
    place(card.el, X0, 660);
    const ys = [0.465, 0.525, 0.586, 0.649, 0.705, 0.755, 0.802, 0.85];
    const ticks = ctx.assets.shots.siaga.ok ? ys.map(y => {
      const r = card.ring(0.906 - 0.024, y - 0.024 / card.aspect, 0.048, 0.048 / card.aspect);
      Object.assign(r.style, { border: 'none', background: 'var(--green)', borderRadius: '6px' });
      r.innerHTML = `<svg viewBox="0 0 24 24" style="width:100%;height:100%"><path d="M5 12.8l4.4 4.4L19.2 7.4" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></svg>`;
      return r;
    }) : [];
    const big = h('div', 'abs', root, icon('backpack').replace('class="ico ', 'style="width:150px;height:150px;color:#F2B81F" class="ico '));
    place(big, 650, 720);
    const msg = text(root, '', 'Mode Siaga membantu menyiapkan kebutuhan dasar sebelum bencana datang.', 650, 910, 358);
    Object.assign(msg.style, { fontSize: '36px', fontWeight: '700', lineHeight: '1.3' });
    ctx.cue(0.8, 'soft');
    ticks.forEach((_, i) => ctx.cue(2.4 + i * 0.28, 'tick', { gain: 0.55 }));
    const OUT = 5.85;
    return t => {
      sh(t, OUT);
      enter(card.el, t, 0.7, OUT, { dx: -120, dy: 0, s0: 0.94, r0: -4, din: 1.1 });
      camera(card, t, [{ t: 0, z: 1, fx: 0.5, fy: 0 }, { t: 2.3, z: 1, fx: 0.5, fy: 0.8, d: 1.3 }]);
      ticks.forEach((r, i) => {
        const k = E.outBack(prog(t, 2.4 + i * 0.28, 0.4));
        r.style.opacity = Math.min(1, k * 3).toFixed(3);
        r.style.transform = `scale(${k.toFixed(3)})`;
        draw(r.querySelector('path'), E.outCubic(prog(t, 2.5 + i * 0.28, 0.3)));
      });
      enter(big, t, 1.2, OUT, { dy: 40, s0: 0.6 });
      enter(msg, t, 1.5, OUT, { dy: 30 });
    };
  },
};

// 09_edukasi_tips — two cards, feed-style scroll
export const s09 = {
  id: '09_edukasi_tips', chapter: ['09', 'Edukasi & Tips Cepat'], dur: 7.5,
  build(root, ctx) {
    const sh = shell(root, ctx, { kicker: 'Fitur · Edukasi & Tips Cepat', title: 'Panduan *singkat,* mudah dipahami', step: 3 });
    const A = shotCard(root, ctx, 'edukasi', { w: 440, hgt: 820 });
    const B = shotCard(root, ctx, 'tips', { w: 440, hgt: 820 });
    place(A.el, X0, 712);
    place(B.el, 568, 740);
    const la = text(root, 'kicker', 'Edukasi Kebencanaan', X0 + 8, 664, 440);
    const lb = text(root, 'kicker', 'Tips Cepat', 576, 692, 440);
    la.style.fontSize = lb.style.fontSize = '24px';
    ctx.cue(0.8, 'soft'); ctx.cue(1.0, 'soft');
    const OUT = 6.85;
    return t => {
      sh(t, OUT);
      [[A.el, 0.7, -1], [B.el, 0.95, 1]].forEach(([el, tin, dir]) => {
        const { k, x } = io(t, tin, OUT, 1.1, 0.45);
        pose(el, { x: dir * 100 * (1 - k), y: 60 * (1 - k) - 28 * x, r: dir * (2.5 + 6 * (1 - k)), o: k * (1 - x) });
      });
      A.setView(1, 0.5, lerp(0, 1, E.inOutCubic(prog(t, 2.2, 4.0))));
      B.setView(1, 0.5, lerp(0, 1, E.inOutCubic(prog(t, 2.6, 4.0))));
      enter(la, t, 1.3, OUT, { dy: 12 });
      enter(lb, t, 1.5, OUT, { dy: 12 });
    };
  },
};

// 10_bantuan_lapor — Pusat Bantuan (screenshot) + Lapor Bencana
export const s10 = {
  id: '10_bantuan_lapor', chapter: ['10', 'Bantuan & Lapor'], dur: 8.5,
  build(root, ctx) {
    const steps = ctx.data.chart_data.usage_flow.steps;
    const hdr = header(root, { kicker: 'Fitur · Pusat Bantuan & Lapor Bencana', title: 'Saat butuh *pertolongan* dan saat perlu *melapor*', size: 66 });
    const card = shotCard(root, ctx, 'bantuan', { w: 470, hgt: 960 });
    place(card.el, X0, 580);
    const r1 = card.ring(0.03, 0.232, 0.94, 0.128);
    const r2 = card.ring(0.03, 0.392, 0.94, 0.2);

    const block = (y, ic, title, body, step) => {
      const g = h('div', 'abs', root);
      place(g, 584, y, 424);
      g.innerHTML = `<div style="width:76px;height:76px;border-radius:22px;background:rgba(242,184,31,.16);color:#F2B81F;display:flex;align-items:center;justify-content:center">${icon(ic).replace('class="ico ', 'style="width:46px;height:46px" class="ico ')}</div>
        <div style="font-size:42px;font-weight:800;margin-top:20px">${title}</div>
        <div style="font-size:28px;font-weight:500;line-height:1.35;color:rgba(255,255,255,.75);margin-top:10px">${body}</div>`;
      const b = stepBadge(g, step, 0, 0);
      b.style.position = 'relative';
      b.style.display = 'inline-flex';
      b.style.marginTop = '20px';
      return g;
    };
    // body copy from narrasi_referensi.md (08_bantuan)
    const A = block(600, 'lifebuoy', 'Pusat Bantuan', 'Menghubungkan warga dengan nomor darurat dan posko terdekat.', steps[5]);
    const B = block(1090, 'megaphone', 'Lapor Bencana', 'Memudahkan warga melaporkan kondisi di lapangan.', steps[4]);

    ctx.cue(0.8, 'soft'); ctx.cue(1.3, 'pop'); ctx.cue(2.5, 'tick'); ctx.cue(4.7, 'tick'); ctx.cue(4.3, 'pop');
    const OUT = 7.85;
    return t => {
      hdr(t, OUT);
      enter(card.el, t, 0.7, OUT, { dy: 140, s0: 0.92, din: 1.1 });
      camera(card, t, [{ t: 0, z: 1, fx: 0.5, fy: 0 }, { t: 2.4, z: 1.3, fx: 0.5, fy: 0.29, d: 1.1 }, { t: 4.8, z: 1.25, fx: 0.5, fy: 0.5, d: 1.1 }, { t: 7.0, z: 1, fx: 0.5, fy: 0.25, d: 1.3 }]);
      ringFade(r1, t, 2.4, 4.3);
      ringFade(r2, t, 4.8, 6.6);
      enter(A, t, 1.3, OUT, { dx: 70, dy: 0 });
      enter(B, t, 4.3, OUT, { dx: 70, dy: 0 });
    };
  },
};
