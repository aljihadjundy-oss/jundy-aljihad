import { E, prog, enter, pose, h, place, lerp, fmt } from '../engine.js';
import { header, X0, CW, text } from './common.js';

// 02_masalah (bagian 1) — foto dokumentasi + disaster_context_note (sensitif: kecil, tenang, bersumber)
export default {
  id: '02a_masalah_konteks', chapter: ['02', 'Kenapa Dibutuhkan'], dur: 10,
  build(root, ctx) {
    const hdr = header(root, { kicker: 'Mengapa dibutuhkan', title: 'Kabupaten Agam rawan *banjir,* *banjir bandang,* dan *tanah longsor.*', size: 72 });

    // photo stack — each photo is a card in the composition with a slow inner drift
    const stack = h('div', 'abs', root);
    place(stack, 0, 0, 1080, 1920);
    stack.style.transformOrigin = '540px 640px';
    const layout = [
      { x: 70, y: 640, r: -5, from: [-120, 0] },
      { x: 300, y: 800, r: 4, from: [140, 0] },
      { x: 110, y: 975, r: -2, from: [0, 160] },
    ];
    const PW = 700, PH = 467;
    const cards = ctx.assets.photos.map((p, i) => {
      const c = h('div', 'abs', stack);
      place(c, layout[i].x, layout[i].y, PW, PH);
      c.style.borderRadius = '26px';
      c.style.overflow = 'hidden';
      c.style.boxShadow = '0 40px 80px -30px rgba(0,0,0,0.7), 0 0 0 6px #fff';
      const img = h('img', 'abs', c);
      img.src = p.src;
      place(img, 0, 0, PW, PH);
      img.style.objectFit = 'cover';
      return { c, img };
    });
    const cap = text(root, 'small', 'Dokumentasi kondisi bencana Sumatra, akhir 2025 (lampiran laporan). Lokasi spesifik tiap foto tidak disebutkan dalam sumber. Foto udara: ANTARA.', X0, 1500, 900);

    // --- BNPB context card (quiet: no count-up, no red, source + disclaimer always visible)
    const f = ctx.data.chart_data.disaster_context_note;
    const card = h('div', 'panel', root);
    place(card, X0, 1130, CW, 470);
    card.style.background = 'rgba(10,30,54,0.92)';
    card.style.border = '2px solid rgba(255,255,255,0.16)';
    const lab = text(card, 'kicker', 'Konteks skala kejadian · Sumatra akhir 2025', 40, 34, 860);
    lab.style.fontSize = '22px';
    lab.style.color = 'rgba(255,255,255,0.6)';
    const figs = [
      [fmt(f.figures.meninggal), 'meninggal'],
      [fmt(f.figures.hilang), 'hilang'],
      [`${fmt(f.figures.mengungsi_ribu, 1)} ribu`, 'mengungsi'],
      [fmt(f.figures.rumah_rusak), 'rumah rusak'],
    ];
    const figEls = figs.map(([v, l], i) => {
      const el = text(card, '', `<div style="font-size:44px;font-weight:700;color:#fff;line-height:1.1">${v}</div><div style="font-size:24px;font-weight:500;color:rgba(255,255,255,0.62);margin-top:4px">${l}</div>`,
        40 + (i % 2) * 440, 84 + Math.floor(i / 2) * 106, 400);
      return el;
    });
    const disc = text(card, '', 'Data gabungan 3 provinsi (Aceh, Sumut, Sumbar), bukan angka khusus Agam', 40, 318, 856);
    Object.assign(disc.style, { fontSize: '28px', fontWeight: '700', color: '#fff', lineHeight: '1.3', padding: '14px 20px',
      borderLeft: '6px solid var(--amber)', background: 'rgba(224,161,0,0.14)', borderRadius: '6px' });
    const src = text(card, '', `Sumber: ${f.source}`, 40, 418, 856);
    Object.assign(src.style, { fontSize: '22px', fontWeight: '600', color: 'rgba(255,255,255,0.6)' });

    [0.95, 1.55, 2.15].forEach(t => ctx.cue(t, 'soft', { gain: 0.5 }));

    const OUT = 9.35, CARD = 5.2;
    return t => {
      hdr(t, OUT);
      // photos arrive one by one, then the stack recedes when the context card appears
      const recede = E.inOutCubic(prog(t, CARD - 0.2, 0.9));
      const ex = E.inCubic(prog(t, OUT, 0.45));
      pose(stack, { y: -40 * recede - 30 * ex, s: lerp(1, 0.66, recede), o: lerp(1, 0.4, recede) * (1 - ex) });
      cards.forEach(({ c, img }, i) => {
        const tin = 0.9 + i * 0.6;
        const k = E.outExpo(prog(t, tin, 1.0));
        const L = layout[i];
        pose(c, { x: L.from[0] * (1 - k), y: L.from[1] * (1 - k) + 40 * (1 - k), r: L.r * k + (1 - k) * L.r * 2, s: lerp(0.9, 1, k), o: E.linear(prog(t, tin, 0.35)) });
        const drift = prog(t, tin, 9);
        img.style.transform = `scale(${lerp(1.1, 1.0, drift).toFixed(4)}) translate3d(${((i % 2 ? -1 : 1) * lerp(0, 14, drift)).toFixed(2)}px,0,0)`;
      });
      enter(cap, t, 2.6, CARD - 0.4, { dy: 16 });

      enter(card, t, CARD + 0.2, OUT, { dy: 50, din: 1.0 });
      enter(lab, t, CARD + 0.45, null, { dy: 10 });
      figEls.forEach((el, i) => enter(el, t, CARD + 0.6 + i * 0.12, null, { dy: 14, din: 0.9 }));
      enter(disc, t, CARD + 1.0, null, { dy: 14 });
      enter(src, t, CARD + 1.1, null, { dy: 10 });
    };
  },
};
