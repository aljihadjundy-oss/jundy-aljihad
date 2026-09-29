"""Build src/geo.json (SVG paths) from geoBoundaries IDN ADM1/ADM2 (CC BY 4.0).

Usage: python3 tools/prep_geo.py <ADM1.geojson> <ADM2.geojson>
Source: https://www.geoboundaries.org (wmgeolab/geoBoundaries, gbOpen IDN, simplified)
"""
import json, math, sys, os

ADM1, ADM2 = sys.argv[1], sys.argv[2]
SUMATRA = ['Aceh', 'North Sumatra', 'West Sumatra', 'Riau', 'Jambi', 'South Sumatra',
           'Bengkulu', 'Lampung', 'Bangka-Belitung Islands', 'Riau Islands']
FOCUS = {'Aceh': 'Aceh', 'North Sumatra': 'Sumatra Utara', 'West Sumatra': 'Sumatra Barat'}
LON0, LAT0, SCALE = 94.8, 6.2, 100.0  # 100 units per degree

def proj(p):
    return ((p[0] - LON0) * SCALE, (LAT0 - p[1]) * SCALE)

def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    n = math.hypot(dx, dy) or 1e-9
    dmax, idx = 0, 0
    for i in range(1, len(pts) - 1):
        d = abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / n
        if d > dmax:
            dmax, idx = d, i
    if dmax > eps:
        return rdp(pts[:idx + 1], eps)[:-1] + rdp(pts[idx:], eps)
    return [pts[0], pts[-1]]

def area(r):
    return abs(sum(r[i][0] * r[i - 1][1] - r[i - 1][0] * r[i][1] for i in range(len(r)))) / 2

def to_path(geom, eps, min_area):
    polys = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
    out = []
    for poly in polys:
        ring = [proj(p) for p in poly[0]]
        if area(ring) < min_area:
            continue
        # closed ring: split at the point farthest from the start so RDP has a real chord
        far = max(range(len(ring)), key=lambda i: math.hypot(ring[i][0] - ring[0][0], ring[i][1] - ring[0][1]))
        ring = rdp(ring[:far + 1], eps)[:-1] + rdp(ring[far:], eps)
        if len(ring) < 4:
            continue
        out.append('M' + 'L'.join(f'{x:.1f},{y:.1f}' for x, y in ring[:-1]) + 'Z')
    return ''.join(out)

def centroid(path_geom):
    polys = path_geom['coordinates'] if path_geom['type'] == 'MultiPolygon' else [path_geom['coordinates']]
    ring = max((p[0] for p in polys), key=lambda r: area([proj(q) for q in r]))
    pts = [proj(q) for q in ring]
    return [round(sum(p[0] for p in pts) / len(pts), 1), round(sum(p[1] for p in pts) / len(pts), 1)]

a1 = json.load(open(ADM1))
a2 = json.load(open(ADM2))
provinces = []
for f in a1['features']:
    name = f['properties']['shapeName']
    if name in SUMATRA:
        provinces.append({'name': FOCUS.get(name, name), 'focus': name in FOCUS,
                          'd': to_path(f['geometry'], 0.9, 4.0), 'c': centroid(f['geometry'])})
agam = next(f for f in a2['features'] if f['properties']['shapeName'] == 'Agam')
out = {'source': 'geoBoundaries (gbOpen IDN ADM1/ADM2, CC BY 4.0)', 'unitsPerDegree': SCALE,
       'provinces': provinces,
       'agam': {'name': 'Kabupaten Agam', 'd': to_path(agam['geometry'], 0.12, 0.05), 'c': centroid(agam['geometry'])}}
dst = os.path.join(os.path.dirname(__file__), '..', 'src', 'geo.json')
json.dump(out, open(dst, 'w'), separators=(',', ':'))
print('wrote', dst, os.path.getsize(dst), 'bytes;', len(provinces), 'provinces; agam centroid', out['agam']['c'])
