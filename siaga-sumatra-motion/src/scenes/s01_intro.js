import { E, prog, enter, pose, h, place, lerp } from '../engine.js';
import { headline, icon, brandLogo } from '../components.js';

// 01_intro — judul & logo
export default {
  id: '01_intro', chapter: ['01', 'Pembuka'], dur: 6,
  build(root, ctx) {
    // white logo tile, revealed by an expanding circle
    const tile = h('div', 'abs', root);
    place(tile, 290, 360, 500, 640);
    tile.style.background = '#fff';
    tile.style.borderRadius = '56px';
    tile.style.boxShadow = '0 60px 120px -40px rgba(0,0,0,0.65)';
    const logo = brandLogo(tile, ctx, { w: 400 });
    place(logo, 50, 38);

    const kick = h('div', 'abs kicker', root, 'Modul Implementasi Kabupaten Agam');
    place(kick, 0, 1098, 1080);
    kick.style.textAlign = 'center';
    const title = headline(root, 'Sistem Informasi dan Aksi\n*Siaga Bencana* Sumatra', { x: 60, y: 1152, w: 960, size: 70, align: 'center' });

    const row = h('div', 'abs', root);
    place(row, 0, 1420, 1080);
    row.style.display = 'flex';
    row.style.justifyContent = 'center';
    row.style.gap = '16px';
    const hazards = [['flood', 'Banjir'], ['flash', 'Banjir Bandang'], ['slide', 'Tanah Longsor']];
    const chips = hazards.map(([ic, label]) => {
      const c = h('div', 'chip', row, `${icon(ic)}${label}`);
      c.style.position = 'relative';
      c.style.fontSize = '28px';
      c.style.padding = '12px 22px 12px 16px';
      c.style.gap = '10px';
      c.style.color = '#fff';
      return c;
    });

    ctx.cue(0.35, 'whoosh', { gain: 0.8 });
    ctx.cue(1.3, 'soft');
    chips.forEach((_, i) => ctx.cue(2.65 + i * 0.13, 'pop'));
    ctx.cue(5.15, 'swoosh');

    const OUT = 5.2;
    return t => {
      // tile: circle reveal + settle, then flies to the chrome badge position (top-left)
      const kin = E.outExpo(prog(t, 0.3, 1.2));
      const fly = E.inOutCubic(prog(t, OUT, 0.8));
      const r = lerp(0, 520, kin);
      tile.style.clipPath = `circle(${r.toFixed(1)}px at 250px 320px)`;
      const sc = lerp(0.9, 1, kin) * lerp(1, 0.128, fly);
      // badge centre in chrome = (104, 150); tile centre = (540, 680)
      pose(tile, { x: lerp(0, 104 - 540, fly), y: lerp(0, 150 - 680, fly) + (1 - kin) * 40, s: sc, o: 1 - E.inCubic(prog(t, OUT + 0.55, 0.25)) });
      logo.style.transform = `translate3d(0,${((1 - E.outExpo(prog(t, 0.55, 1.2))) * 60).toFixed(1)}px,0)`;

      enter(kick, t, 1.3, OUT, { dy: 24 });
      title.update(t, 1.45, OUT);
      chips.forEach((c, i) => enter(c, t, 2.65 + i * 0.13, OUT + i * 0.05, { dy: 40, s0: 0.85 }));
    };
  },
};
