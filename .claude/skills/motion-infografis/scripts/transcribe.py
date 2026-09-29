#!/usr/bin/env python3
"""Word-level transcript for a footage project → transcript/words.json, segments.json, transcript.md

  python3 transcribe.py myproject --srt subs.srt      # from an existing SRT/VTT (CapCut, Descript, YouTube …)
  python3 transcribe.py myproject                     # auto: faster-whisper (or openai-whisper) on footage/audio.wav
  python3 transcribe.py myproject --model small --lang id

SRT/VTT timestamps are assumed to be relative to the *raw* video; the trim start from footage.json is subtracted
automatically (pass --clip-relative if the subtitle file was made from the trimmed clip).
With subtitles, word times inside a cue are estimated by spreading the cue over its words by length.
"""
import argparse, json, os, re, sys

ap = argparse.ArgumentParser()
ap.add_argument('project')
ap.add_argument('--srt', help='SRT or VTT file')
ap.add_argument('--clip-relative', action='store_true')
ap.add_argument('--model', default='small')
ap.add_argument('--lang', default=None, help='e.g. id, en (default: auto-detect)')
a = ap.parse_args()

fdir = os.path.join(a.project, 'footage')
meta = json.load(open(os.path.join(fdir, 'footage.json')))
out = os.path.join(a.project, 'transcript')
os.makedirs(out, exist_ok=True)


def ts(s):
    s = s.strip().replace(',', '.')
    parts = s.split(':')
    parts = [0.0] * (3 - len(parts)) + [float(x) for x in parts]
    return parts[0] * 3600 + parts[1] * 60 + parts[2]


def from_subs(path):
    text = open(path, encoding='utf-8-sig').read()
    blocks = re.split(r'\n\s*\n', text.replace('\r', ''))
    segs = []
    for b in blocks:
        m = re.search(r'([\d:.,]+)\s*-->\s*([\d:.,]+)', b)
        if not m:
            continue
        body = ' '.join(l.strip() for l in b.split('\n')[b.split('\n').index(next(l for l in b.split('\n') if '-->' in l)) + 1:] if l.strip())
        body = re.sub(r'<[^>]+>', '', body).strip()
        if body:
            segs.append({'s': ts(m.group(1)), 'e': ts(m.group(2)), 'text': body})
    off = 0 if a.clip_relative else meta.get('start', 0)
    words = []
    for sg in segs:
        sg['s'] -= off
        sg['e'] -= off
        toks = sg['text'].split()
        weights = [len(t) + 1 for t in toks]
        tot, acc = sum(weights), 0
        span = sg['e'] - sg['s']
        for t, wgt in zip(toks, weights):
            s = sg['s'] + span * acc / tot
            acc += wgt
            words.append({'w': t, 's': round(s, 3), 'e': round(sg['s'] + span * acc / tot, 3)})
    return segs, words


def from_whisper():
    wav = os.path.join(fdir, 'audio.wav')
    try:
        from faster_whisper import WhisperModel
        model = WhisperModel(a.model, device='auto', compute_type='int8')
        it, info = model.transcribe(wav, language=a.lang, word_timestamps=True, vad_filter=True)
        segs, words = [], []
        for sg in it:
            segs.append({'s': round(sg.start, 3), 'e': round(sg.end, 3), 'text': sg.text.strip()})
            words += [{'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3)} for w in (sg.words or []) if w.word.strip()]
        print(f'faster-whisper: language {info.language} ({info.language_probability:.2f})')
        return segs, words
    except ImportError:
        pass
    try:
        import whisper
        model = whisper.load_model(a.model)
        r = model.transcribe(wav, language=a.lang, word_timestamps=True)
        segs = [{'s': round(s['start'], 3), 'e': round(s['end'], 3), 'text': s['text'].strip()} for s in r['segments']]
        words = [{'w': w['word'].strip(), 's': round(w['start'], 3), 'e': round(w['end'], 3)} for s in r['segments'] for w in s.get('words', []) if w['word'].strip()]
        return segs, words
    except ImportError:
        sys.exit('No transcription engine. Give an SRT/VTT with --srt, or: pip install faster-whisper')


segs, words = from_subs(a.srt) if a.srt else from_whisper()
segs = [s for s in segs if s['e'] > 0 and s['s'] < meta['duration']]
words = [w for w in words if w['e'] > 0 and w['s'] < meta['duration']]
json.dump(words, open(os.path.join(out, 'words.json'), 'w'), ensure_ascii=False)
json.dump(segs, open(os.path.join(out, 'segments.json'), 'w'), ensure_ascii=False, indent=1)
fmt = lambda t: f'{int(t // 60)}:{t % 60:05.2f}'
with open(os.path.join(out, 'transcript.md'), 'w') as f:
    f.write('# Transcript (clip time)\n\n')
    for s in segs:
        f.write(f"- [{fmt(max(0, s['s']))} – {fmt(s['e'])}] {s['text']}\n")
print(f'{len(segs)} segments, {len(words)} words → {out}/transcript.md')
