import { E, clamp, prog, lerp, el, mono, statement, s, isoProject, isoBox, isoFloor, fmtN, W, H } from '../lib.js';

// 06 — who is in the room: isometric B2B vs B2C columns + three headline figures (targets are labelled as targets).
export default {
  id: 'numbers', name: 'WHO YOU WILL MEET', dur: 9.0,
  build(root, ctx) {
    const N = ctx.content.numbers;
    const svg = s('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: 'layer' }, root);
    svg.style.overflow = 'visible';
    const U = 70, P = isoProject(480, 700, U);
    const floor = isoFloor(svg, P, { x0: -1, y0: -1, nx: 7, ny: 4, step: 1 });
    const bB = isoBox(svg, P, { x: 0.2, y: 0.2, w: 1.7, d: 1.7, top: '#bfe3f7', left: '#487898', right: '#284868' });
    const bC = isoBox(svg, P, { x: 3.0, y: 0.2, w: 1.7, d: 1.7, top: '#6FA6C8', left: '#386888', right: '#1d4466' });
    const hB = N.b2b * 2.2 / U, hC = N.b2c * 2.2 / U;

    const kick = mono(root, 'THE AUDIENCE', 116, 160, { size: 17, ls: 0.3 });
    const title = statement(root, [{ t: 'WHO YOU’LL ' }, { t: 'meet.', c: 'serif' }], 110, 196, { size: 84 });
    const labB = el(root, 'abs', { width: '300px' });
    const labC = el(root, 'abs', { width: '300px' });
    const mkLab = (host, big, cap) => {
      const a = el(host, 'abs hl', { left: 0, top: 0, fontSize: '84px', color: 'var(--white)' }, big);
      const b = mono(host, cap, 0, 92, { size: 15, ls: 0.14, color: 'var(--ice)', w: 300 });
      return { a, b };
    };
    const lb = mkLab(labB, '0%', 'B2B · PROFESSIONALS & DECISION-MAKERS');
    const lc = mkLab(labC, '0%', 'B2C · ACTIVE-LIFESTYLE CONSUMERS');

    const stats = [
      { big: N.impressions, num: 5, pre: '±', suf: 'M', cap: 'IMPRESSIONS', note: 'TARGET · ACROSS SOCIAL, INFLUENCERS & COMMUNITIES' },
      { big: N.media, num: 50, suf: '+', cap: 'MEDIA PARTNERS', note: 'NATIONAL & REGIONAL COVERAGE' },
      { big: `${N.female} / ${N.male}`, cap: 'FEMALE / MALE', note: `AGE ${N.age} · ACTIVE, HEALTH-CONSCIOUS` },
    ].map((st, i) => {
      const y = 285 + i * 215;
      const rule = el(root, 'abs', { left: '1000px', top: `${y - 14}px`, width: '800px', height: '1px', background: 'rgba(140,200,234,.35)', transformOrigin: '0 50%' });
      const big = el(root, 'abs hl', { left: '1000px', top: `${y}px`, fontSize: '128px', whiteSpace: 'nowrap', color: 'var(--white)' }, st.big);
      const cap = mono(root, st.cap, 1000, y + 140, { size: 18, ls: 0.28, color: 'var(--ice)' });
      const note = mono(root, st.note, 1000, y + 172, { size: 15, ls: 0.12, color: 'rgba(246,250,253,.7)' });
      return { ...st, rule, big, cap, note, y, ti: 2.6 + i * 1.5 };
    });
    const src = mono(root, 'SOURCE · SHAPE INDONESIA EXPO 2027 SPONSORSHIP PROPOSAL · IMPRESSIONS FIGURE IS A PROJECTION', 116, 990, { size: 11, ls: 0.16, color: 'rgba(140,200,234,.5)' });

    ctx.cue(0.3, 'whoosh', { gain: 0.5 });
    ctx.cue(1.0, 'rise'); ctx.cue(1.5, 'rise', { gain: 0.8 });
    ctx.cue(1.2, 'count', { dur: 1.4 });
    stats.forEach(st => { ctx.cue(st.ti, 'count', { dur: 1.2 }); ctx.cue(st.ti + 1.3, 'ping', { gain: 0.5 }); });

    return lt => {
      floor.set(E.outCubic(prog(lt, 0.2, 1.2)));
      const kB = E.outBack(prog(lt, 0.9, 1.2)), kC = E.outBack(prog(lt, 1.3, 1.2));
      bB.set(hB * kB); bC.set(hC * kC);
      const pb = bB.topCenter(), pc = bC.topCenter();
      labB.style.left = `${pb[0] - 150}px`; labB.style.top = `${pb[1] - 190}px`;
      labC.style.left = `${pc[0] + 95}px`; labC.style.top = `${pc[1] - 80}px`;
      lb.a.textContent = `${Math.round(lerp(0, N.b2b, E.outCubic(prog(lt, 1.2, 1.4))))}%`;
      lc.a.textContent = `${Math.round(lerp(0, N.b2c, E.outCubic(prog(lt, 1.6, 1.4))))}%`;
      const vis = (e, t, d = 20) => { const k = E.outExpo(prog(lt, t, 0.8)); e.style.opacity = k.toFixed(3); e.style.transform = `translate3d(0,${((1 - k) * d).toFixed(1)}px,0)`; };
      vis(kick, 0.3, 10); vis(title, 0.5, 36); vis(labB, 1.4, 14); vis(labC, 1.8, 14); vis(src, 3, 0);
      stats.forEach(st => {
        const k = E.outExpo(prog(lt, st.ti, 0.9));
        st.rule.style.transform = `scaleX(${k.toFixed(3)})`;
        vis(st.big, st.ti, 40); vis(st.cap, st.ti + 0.3, 14); vis(st.note, st.ti + 0.5, 10);
        if (st.num != null) st.big.textContent = `${st.pre ?? ''}${fmtN(Math.round(st.num * E.outCubic(prog(lt, st.ti, 1.2))))}${st.suf ?? ''}`;
      });
    };
  },
};
