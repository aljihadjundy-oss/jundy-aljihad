import { E, prog, enter, pose, h, place, lerp } from '../engine.js';
import { headline, brandLogo } from '../components.js';
import { X0, CW, text } from './common.js';

// 14_outro — disclaimer prototipe + CTA (copy from narrasi_referensi.md, 10_outro)
export default {
  id: '14_outro', chapter: ['14', 'Penutup'], dur: 6.5,
  build(root, ctx) {
    const tile = h('div', 'abs', root);
    place(tile, 330, 330, 420, 540);
    Object.assign(tile.style, { background: '#fff', borderRadius: '50px', boxShadow: '0 60px 120px -40px rgba(0,0,0,0.65)' });
    const logo = brandLogo(tile, ctx, { w: 340 });
    place(logo, 40, 30);
    const title = headline(root, 'Kenali risiko,\n*siap menghadapi bencana.*', { x: 60, y: 940, w: 960, size: 68, align: 'center' });
    const note = h('div', 'panel', root);
    place(note, X0, 1170, CW, 250);
    note.innerHTML = `<div class="kicker" style="position:absolute;left:36px;top:32px;font-size:22px;color:var(--amber)">Prototipe — perlu validasi sebelum digunakan</div>
      <div style="position:absolute;left:36px;top:80px;width:860px;font-size:30px;font-weight:600;line-height:1.4;color:rgba(255,255,255,.85)">Tampilan ini masih berupa prototipe dan akan terus disempurnakan bersama BPBD Kabupaten Agam.</div>`;
    const fade = h('div', 'layer', root);
    fade.style.background = 'var(--navy-dark)';

    ctx.cue(0.65, 'whoosh', { gain: 0.7 });
    ctx.cue(1.25, 'soft');
    ctx.cue(1.6, 'swell');
    return t => {
      const k = E.outExpo(prog(t, 0.65, 1.2));
      tile.style.clipPath = `circle(${lerp(0, 460, k).toFixed(1)}px at 210px 270px)`;
      pose(tile, { y: (1 - k) * 60, s: lerp(0.9, 1, k) });
      title.update(t, 1.25, null);
      enter(note, t, 2.0, null, { dy: 40 });
      fade.style.opacity = E.inOutCubic(prog(t, 5.6, 0.9)).toFixed(3);
    };
  },
};
