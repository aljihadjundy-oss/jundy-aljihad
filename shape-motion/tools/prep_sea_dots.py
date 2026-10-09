"""Dot-matrix Southeast Asia map from geoBoundaries ADM0 (CC BY 4.0) → assets/sea_dots.json

  python3 tools/prep_sea_dots.py <dir with adm0_<ISO>.geojson files>
Equirectangular, lon 92–128, lat -11–21, one dot per `STEP` degrees inside any country polygon.
"""
import json, sys, os
from PIL import Image, ImageDraw
D = sys.argv[1]
LON0, LON1, LAT0, LAT1, STEP = 92.0, 128.0, 21.0, -11.0, 0.32
RES = 40  # raster px per degree
W, H = int((LON1 - LON0) * RES), int((LAT0 - LAT1) * RES)
img = Image.new('L', (W, H), 0)
dr = ImageDraw.Draw(img)
def px(p): return ((p[0] - LON0) * RES, (LAT0 - p[1]) * RES)
for iso in ['IDN', 'THA', 'MYS', 'SGP', 'VNM', 'PHL', 'KHM', 'LAO', 'MMR', 'BRN', 'TLS']:
    g = json.load(open(os.path.join(D, f'adm0_{iso}.geojson')))
    for f in g['features']:
        geom = f['geometry']
        polys = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
        for poly in polys:
            dr.polygon([px(p) for p in poly[0]], fill=255)
            for hole in poly[1:]:
                dr.polygon([px(p) for p in hole], fill=0)
pts = []
lon = LON0
row = 0
lat = LAT0
while lat > LAT1:
    lon = LON0 + (STEP / 2 if row % 2 else 0)  # staggered rows read as a dot-matrix
    while lon < LON1:
        x, y = px((lon, lat))
        if 0 <= x < W and 0 <= y < H and img.getpixel((int(x), int(y))) > 128:
            pts.append([round(lon, 3), round(lat, 3)])
        lon += STEP
    lat -= STEP * 0.866
    row += 1
json.dump({'bbox': [LON0, LON1, LAT0, LAT1], 'step': STEP, 'dots': pts}, open('assets/sea_dots.json', 'w'), separators=(',', ':'))
print(len(pts), 'dots')
