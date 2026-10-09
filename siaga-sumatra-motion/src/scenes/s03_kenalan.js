import { E, prog, enter, pose, h, place, lerp } from '../engine.js';
import { icon, shotCard, counter } from '../components.js';
import { header, X0, CW, text } from './common.js';

export const FEATURE_ICON = {
  'Peta Risiko': 'map', 'Deteksi Dini': 'alert', 'Jalur Evakuasi': 'route', 'Mode Siaga': 'backpack',
  'Edukasi Kebencanaan': 'book', 'Tips Cepat': 'bolt', 'Pusat Bantuan': 'lifebuoy', 'Lapor Bencana': 'megaphone',
};

// 03_kenalan — kenalan app: halaman pembuka + beranda + grid 8 fitur (app_features)
export default {
  id: '03_kenalan', chapter: ['03', 'Mengenal SIAGA SUMATRA'], dur: 8.5,
  build(root, ctx) {
    const F = ctx.data.chart_data.app_features.features;
    const hdr = header(root, { kicker: 'Mengenal SIAGA SUMATRA', title: 'Menghubungkan *informasi resmi* dengan warga', size: 72 });

    // splash (logo/cover.jpg) + home screenshot as two floating cards
    const cover = h('div', 'shot', root);
    const CWd = 300, CH = Math.round(300 * 1041 / 585);
    place(cover, 150, 575, CWd, CH);
    cover.style.borderRadius = '34px';
    const cimg = h('img', 'abs', cover);
    cimg.src = ctx.assets.cover;
    place(cimg, 0, 0, CWd, CH);
    const home = shotCard(root, ctx, 'home', { w: 400, hgt: 560, radius: 34 });
    place(home.el, 500, 560);
    const HZ = ctx.assets.shots.home.ok ? 1.42 : 1; // crop the white page around the phone mockup
    home.setView(HZ, 0.503, 0);

    const lead = h('div', 'abs', root);
    place(lead, X0, 1170, CW);
    Object.assign(lead.style, { display: 'flex', alignItems: 'baseline', gap: '18px' });
    const num = h('div', null, lead, '0');
    Object.assign(num.style, { fontSize: '84px', fontWeight: '800', color: 'var(--amber)', lineHeight: '1' });
    const lt = h('div', null, lead, 'fitur utama aplikasi');
    Object.assign(lt.style, { fontSize: '36px', fontWeight: '700' });

    const cells = F.map((name, i) => {
      const c = h('div', 'panel', root);
      const cw = 222, chh = 150, gap = 16;
      place(c, X0 + (i % 4) * (cw + gap), 1280 + Math.floor(i / 4) * (chh + gap), cw, chh);
      Object.assign(c.style, { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', textAlign: 'center', borderRadius: '24px' });
      c.innerHTML = `<span style="width:52px;height:52px;color:var(--teal-hi)">${icon(FEATURE_ICON[name] || 'pin').replace('class="ico ', 'style="width:52px;height:52px" class="ico ')}</span><span style="font-size:23px;font-weight:700;line-height:1.15;padding:0 10px">${name}</span>`;
      return c;
    });

    ctx.cue(0.9, 'soft'); ctx.cue(1.2, 'soft');
    cells.forEach((_, i) => ctx.cue(2.6 + i * 0.12, 'pop', { gain: 0.7 }));

    const OUT = 7.85;
    return t => {
      hdr(t, OUT);
      enter(cover, t, 0.8, OUT, { dy: 120, r0: -8, s0: 0.9, din: 1.1 });
      enter(home.el, t, 1.1, OUT, { dy: 140, r0: 6, s0: 0.9, din: 1.1 });
      home.setView(HZ, 0.503, lerp(0.02, 1, E.inOutCubic(prog(t, 3.2, 3.5))));
      enter(lead, t, 2.2, OUT, { dy: 30 });
      counter(num, t, 2.25, 1.2, F.length);
      cells.forEach((c, i) => {
        const tin = 2.6 + i * 0.12;
        const k = E.outBack(prog(t, tin, 0.7));
        const x = E.inCubic(prog(t, OUT + i * 0.03, 0.4));
        pose(c, { y: (1 - k) * 40 - 24 * x, s: lerp(0.7, 1, k), o: E.linear(prog(t, tin, 0.25)) * (1 - x) });
      });
    };
  },
};
