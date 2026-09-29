import { E, prog, lerp, pose, h, place } from '../engine.js';
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
