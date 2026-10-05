#!/usr/bin/env python3
"""Buat kerangka design-plan.md dari deck.json (copy dari slide + catatan visual/elemen/motion/aset).

Pakai:  python3 deck_to_plan.py deck.json design-plan.md "Gaya/Funnel/CTA/Posting (satu baris)"
"""
import json, sys
from pathlib import Path

deck = json.loads(Path(sys.argv[1]).read_text())
head = sys.argv[3] if len(sys.argv) > 3 else ""
m = deck.get("meta", {})
out = [f"# {m.get('title', 'Carousel')}", head, ""]


def copy_of(s):
    parts = []
    for k in ("kicker", "label", "title", "sub", "body", "query", "cat", "name", "role", "quote", "date", "number", "handle", "caption", "foot"):
        v = s.get(k)
        if isinstance(v, str) and v:
            parts.append(v.replace("\n", " ").replace("{{", "").replace("}}", "").replace("[[", "").replace("]]", ""))
    for k in ("items",):
        for it in s.get(k, []) if isinstance(s.get(k), list) else []:
            parts.append((it if isinstance(it, str) else it.get("label", "")))
    for side in ("left", "right"):
        d = s.get(side)
        if isinstance(d, dict):
            parts.append(" / ".join(str(d.get(x, "")) for x in ("label", "title", "body") if d.get(x)))
    return " · ".join(p for p in parts if p)


assets = []
for i, s in enumerate(deck["slides"], 1):
    n = s.get("notes") or {}
    out += [f"## Slide {i} (pola: {s['pattern']})",
            f"- **Copy:** {copy_of(s)}",
            f"- **Visual:** {n.get('visual', '-')}",
            f"- **Elemen:** {n.get('element', '-')}",
            f"- **Motion:** {n.get('motion', '-')}",
            f"- **Aset:** {n.get('asset', '-')}", ""]
    if n.get("asset") and n["asset"].strip() not in ("-", "Tidak ada"):
        assets.append(f"| {i} | {n['asset']} |")
out += ["## Aset & pertanyaan terbuka", "| Slide | Aset |", "|---|---|"] + (assets or ["| - | Tidak ada aset tambahan |"])
Path(sys.argv[2]).write_text("\n".join(out) + "\n")
print("ok", sys.argv[2])
