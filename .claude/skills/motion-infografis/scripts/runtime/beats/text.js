import { E, prog, lerp, pose, h, s, draw, place } from '../engine.js';
import { headline, icon } from '../components.js';
import { div, appear, tone } from './util.js';

// title — kinetic headline (with optional kicker). Over footage it sits plain with a strong shadow.
export const title = {
  defaults: { mode: 'overlay', pos: 'top', glass: false },
  build(box, b, ctx) {
    const S = ctx.S;
    const align = b.align ?? (ctx.mode === 'full' ? 'left' : 'left');
    let kick = null;
    if (b.kicker) { kick = div(box, { marginBottom: `${14 * S}px`, textAlign: align }, b.kicker, 'kicker'); }
    const size = (b.size ?? (ctx.mode === 'full' ? 96 : 78)) * S;
    const hl = headline(box, b.text, { flow: true, size, align, w: ctx.zone.w });
    if (ctx.mode === 'overlay' && !b.glass) hl.el.style.textShadow = '0 4px 0 rgba(0,0,0,.35), 0 0 30px rgba(0,0,0,.55)';
    if (b.upper) hl.el.style.textTransform = 'uppercase'; // hook style: "CARA SKRIPSI\n*PAKE AI??*"
    ctx.cue(ctx.t0, 'soft');
    return lt => {
      if (kick) appear(kick, lt, ctx.t0 - 0.1, ctx.OUT, { dy: 20 });
      hl.update(lt, ctx.t0, ctx.OUT);
    };
  },
};

// quote — pull quote with a big quotation mark
export const quote = {
  defaults: { mode: 'overlay', pos: 'center', glass: true },
  build(box, b, ctx) {
    const S = ctx.S;
    const mark = div(box, { fontSize: `${180 * S}px`, lineHeight: '0.7', fontWeight: '800', color: 'var(--accent2)', height: `${90 * S}px` }, '“');
    const hl = headline(box, b.text, { flow: true, size: (b.size ?? (ctx.mode === 'full' ? 70 : 56)) * S, w: ctx.zone.w - 64 * S, weight: 700 });
    let by = null;
    if (b.by) by = div(box, { marginTop: `${22 * S}px`, fontSize: `${28 * S}px`, fontWeight: '600', color: 'var(--ink-soft)' }, `— ${b.by}`);
    ctx.cue(ctx.t0, 'soft');
    return lt => {
      appear(mark, lt, ctx.t0 - 0.1, ctx.OUT, { dy: 30, s0: 0.6 });
      hl.update(lt, ctx.t0 + 0.1, ctx.OUT, { stagger: 0.04 });
      if (by) appear(by, lt, ctx.t0 + 0.8, ctx.OUT, { dy: 16 });
    };
  },
};

// cta — closing card: headline + a pill (e.g. handle / "Follow untuk part 2") with a nudging arrow
export const cta = {
  defaults: { mode: 'full', pos: 'center', glass: false },
  build(box, b, ctx) {
    const S = ctx.S;
    box.style.textAlign = 'center';
    const hl = headline(box, b.text, { flow: true, size: (b.size ?? 84) * S, align: 'center', w: ctx.zone.w });
    let pill = null, arrow = null;
    if (b.sub || b.handle) {
      const wrap = div(box, { marginTop: `${40 * S}px`, display: 'flex', justifyContent: 'center' });
      pill = div(wrap, { display: 'inline-flex', alignItems: 'center', gap: `${16 * S}px`, padding: `${18 * S}px ${34 * S}px`, borderRadius: '999px',
        background: 'var(--accent2)', color: 'var(--bg)', fontSize: `${34 * S}px`, fontWeight: '800' }, `<span>${b.handle || b.sub}</span>`);
      arrow = div(pill, {}, icon('arrow', 40 * S, 'var(--bg)'));
    }
    ctx.cue(ctx.t0, 'whoosh', { gain: 0.6 });
    if (pill) ctx.cue(ctx.t0 + 0.8, 'pop');
    return lt => {
      hl.update(lt, ctx.t0, ctx.OUT);
      if (pill) {
        const k = E.outBack(prog(lt, ctx.t0 + 0.8, 0.6));
        pose(pill, { s: lerp(0.6, 1, k), o: Math.min(1, k * 2) * (1 - E.inCubic(prog(lt, ctx.OUT, 0.45))) });
        arrow.style.transform = `translateX(${(Math.max(0, Math.sin((lt - ctx.t0) * 5)) * 10 * S).toFixed(1)}px)`;
      }
    };
  },
};

// chapter — section divider; also drives the chapter label in the top chrome
export const chapter = {
  defaults: { mode: 'full', pos: 'center', glass: false },
  build(box, b, ctx) {
    const S = ctx.S;
    // style "arc" (ref e): a big arc with a dot on it, a large italic number and a light label ("1  Find", "2  Formats")
    if (b.style === 'arc') {
      const Wz = ctx.zone.w, Hh = (b.height ?? 520) * S, R = Hh * 0.95, bulge = R - Math.sqrt(R * R - (Hh / 2) ** 2), x0 = 40 * S;
      box.style.height = `${Hh}px`;
      const svg = s('svg', { width: Wz, height: Hh, viewBox: `0 0 ${Wz} ${Hh}` }, box);
      svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible';
      const arc = s('path', { d: `M${x0} 0 A${R} ${R} 0 0 1 ${x0} ${Hh}`, pathLength: 1, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 5 * S, 'stroke-linecap': 'round' }, svg);
      const dx = x0 + bulge, dy = Hh / 2;
      const dot = s('circle', { cx: dx, cy: dy, r: 15 * S, fill: 'var(--ink)' }, svg);
      const num = div(box, { position: 'absolute', left: `${dx + 38 * S}px`, top: `${dy - 120 * S}px`, fontSize: `${(b.size ?? 230) * S}px`, fontWeight: '800', fontStyle: 'italic', lineHeight: 1, letterSpacing: '-0.05em',
        background: 'linear-gradient(180deg, var(--ink) 20%, color-mix(in srgb, var(--ink) 10%, transparent) 95%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', padding: `0 ${14 * S}px 0 0` }, String(b.num ?? ''));
      const lab = div(box, { position: 'absolute', left: `${dx + 38 * S + (String(b.num ?? '').length * 128 + 40) * S * ((b.size ?? 230) / 230)}px`, top: `${dy + 6 * S}px`, fontSize: `${(b.labelSize ?? 72) * S}px`, fontWeight: '800', color: 'color-mix(in srgb, var(--ink) 38%, transparent)', whiteSpace: 'nowrap' }, b.name ?? '');
      ctx.cue(ctx.t0, 'whoosh', { gain: 0.6 });
      return lt => {
        draw(arc, E.inOutCubic(prog(lt, ctx.t0, 0.9)));
        arc.setAttribute('opacity', (1 - E.inCubic(prog(lt, ctx.OUT, 0.4))).toFixed(2));
        dot.setAttribute('r', (15 * S * Math.max(0.01, E.outBack(prog(lt, ctx.t0 + 0.7, 0.4)))).toFixed(2));
        dot.setAttribute('opacity', (E.outCubic(prog(lt, ctx.t0 + 0.7, 0.2)) * (1 - E.inCubic(prog(lt, ctx.OUT, 0.4)))).toFixed(2));
        appear(num, lt, ctx.t0 + 0.8, ctx.OUT, { dx: -40, dy: 0 });
        appear(lab, lt, ctx.t0 + 1.0, ctx.OUT, { dx: -30, dy: 0 });
      };
    }
    const k = div(box, { marginBottom: `${16 * S}px` }, b.num ? `Bagian ${b.num}` : (b.kicker || ''), 'kicker');
    const hl = headline(box, b.name, { flow: true, size: (b.size ?? 100) * S, w: ctx.zone.w });
    const bar = div(box, { marginTop: `${34 * S}px`, height: `${8 * S}px`, width: `${220 * S}px`, borderRadius: '4px', background: 'linear-gradient(90deg,var(--accent),var(--accent2))', transformOrigin: '0 50%' });
    ctx.cue(ctx.t0, 'whoosh', { gain: 0.7 });
    return lt => {
      appear(k, lt, ctx.t0, ctx.OUT, { dy: 20 });
      hl.update(lt, ctx.t0 + 0.1, ctx.OUT);
      const bk = E.outExpo(prog(lt, ctx.t0 + 0.4, 0.9)) * (1 - E.inCubic(prog(lt, ctx.OUT, 0.4)));
      bar.style.transform = `scaleX(${bk.toFixed(4)})`;
    };
  },
};

// lowerthird — name + role tag above the caption line (always over footage, no zone)
export const lowerthird = {
  defaults: { mode: 'overlay', pos: 'lower', glass: false, free: true },
  build(root, b, ctx) {
    const S = ctx.S;
    const g = h('div', 'abs', root);
    place(g, ctx.m, ctx.captionsY - 190 * S);
    const bar = div(g, { position: 'absolute', left: '0', top: '0', width: `${10 * S}px`, height: `${118 * S}px`, borderRadius: '5px', background: 'var(--accent2)', transformOrigin: '50% 0' });
    const name = div(g, { marginLeft: `${30 * S}px`, fontSize: `${46 * S}px`, fontWeight: '800', whiteSpace: 'nowrap', textShadow: '0 3px 16px rgba(0,0,0,.6)' }, b.name);
    const role = div(g, { marginLeft: `${30 * S}px`, marginTop: `${10 * S}px`, display: 'inline-block', fontSize: `${26 * S}px`, fontWeight: '700', padding: `${6 * S}px ${14 * S}px`,
      borderRadius: `${8 * S}px`, background: 'var(--accent)', color: '#fff', whiteSpace: 'nowrap' }, b.role || '');
    if (!b.role) role.style.display = 'none';
    ctx.cue(ctx.t0, 'swoosh', { gain: 0.6 });
    return lt => {
      const k = E.outExpo(prog(lt, ctx.t0, 0.7)), x = E.inCubic(prog(lt, ctx.OUT, 0.45));
      bar.style.transform = `scaleY(${(k * (1 - x)).toFixed(4)})`;
      appear(name, lt, ctx.t0 + 0.12, ctx.OUT, { dx: -50, dy: 0 });
      appear(role, lt, ctx.t0 + 0.25, ctx.OUT, { dx: -50, dy: 0 });
    };
  },
};
