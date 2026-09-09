from pathlib import Path
import json,math
geo=json.loads(Path('design/coverage-geography.json').read_text())
def xy(lon,lat): return (100+(lon-87.0)*220,60+(27.8-lat)*250)
def path(coords):
 return ' '.join(('M' if i==0 else 'L')+f'{xy(*p[:2])[0]:.1f},{xy(*p[:2])[1]:.1f}' for i,p in enumerate(coords))+'Z'
base=[]
for f in geo['features']:
 polygons=f['geometry']['coordinates'] if f['geometry']['type']=='MultiPolygon' else [f['geometry']['coordinates']]
 d=' '.join(path(ring) for poly in polygons for ring in poly)
 base.append(f'<path d="{d}" fill="{"#dce3d9" if f["properties"]["name"]=="West Bengal" else "#e8ebe3"}" stroke="#c8d3cc" stroke-width="1.2"/>')
# City centres; district labels use Raiganj and Balurghat as reference points.
points=[('Darjeeling',88.2627,27.036, -18,-22,'end'),('Kalimpong',88.474,27.067,30,-42,'start'),('Siliguri',88.3953,26.7271,-22,32,'end'),('Jalpaiguri',88.7205,26.5435,-18,39,'end'),('Alipurduar',89.5271,26.4919,27,-22,'start'),('Cooch Behar',89.4491,26.3452,30,35,'start'),('North Dinajpur',88.1246,25.6185,-22,-12,'end'),('South Dinajpur',88.7794,25.2200,25,5,'start'),('Malda',88.1433,25.0108,-22,32,'end')]
svg=['<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1000" viewBox="0 0 900 1000"><title>AD JEET coverage across North Bengal</title><desc>Geographically positioned places with soft approximate coverage shading. Siliguri is the base. District reference points represent Raiganj and Balurghat.</desc><defs><radialGradient id="reach"><stop stop-color="#109fcc" stop-opacity=".38"/><stop offset=".55" stop-color="#109fcc" stop-opacity=".19"/><stop offset="1" stop-color="#109fcc" stop-opacity="0"/></radialGradient><clipPath id="frame"><rect width="900" height="1000" rx="0"/></clipPath></defs><g clip-path="url(#frame)"><rect width="900" height="1000" fill="#f2f1e9"/>']
svg+=base
for lon,lat,rx,ry in [(88.5,26.75,200,165),(89.15,26.55,230,125),(88.25,25.8,125,200),(88.5,25.2,155,140)]:
 x,y=xy(lon,lat);svg.append(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="url(#reach)"/>')
svg.append('<g font-family="Arial,sans-serif" fill="#84958b" font-size="18" letter-spacing="3"><text x="145" y="190">NEPAL</text><text x="650" y="180">BHUTAN</text><text x="630" y="650">BANGLADESH</text><text x="80" y="600">BIHAR</text><text x="395" y="90">SIKKIM</text></g>')
x,y=xy(89.0,26.85);svg.append(f'<text x="{x}" y="{y}" font-family="Arial,sans-serif" font-style="italic" fill="#3b7079" font-size="22">The Dooars</text>')
for label,lon,lat,dx,dy,anchor in points:
 x,y=xy(lon,lat);hq=label=='Siliguri';tx=x+dx;ty=y+dy
 if hq: svg.append(f'<circle cx="{x}" cy="{y}" r="19" fill="#f1f36d" stroke="#12333b" stroke-width="1"/>')
 svg.append(f'<path d="M{x},{y} L{tx},{ty-7}" fill="none" stroke="#698b8c" stroke-width="1"/><circle cx="{x}" cy="{y}" r="{6 if hq else 4}" fill="#12333b"/>')
 svg.append(f'<text x="{tx}" y="{ty}" text-anchor="{anchor}" font-family="Arial,sans-serif" font-size="{34 if hq else 29}" font-weight="{700 if hq else 500}" fill="#12333b" stroke="#f2f1e9" stroke-width="5" paint-order="stroke">{label}</text>')
 if hq: svg.append(f'<text x="{tx}" y="{ty+21}" text-anchor="end" font-family="Arial,sans-serif" font-size="13" letter-spacing="2" fill="#496269">OUR BASE</text>')
svg.append('<g fill="#496269" font-family="Arial,sans-serif"><path d="M835 70V115 M828 81L835 69L842 81" fill="none" stroke="#496269" stroke-width="2"/><text x="835" y="57" text-anchor="middle" font-size="15">N</text><path d="M65 945H177 M65 939V951 M177 939V951" stroke="#496269" stroke-width="2"/><text x="65" y="928" font-size="15">~50 km</text><text x="835" y="964" text-anchor="end" font-size="12">Geography: Natural Earth · Approximate coverage</text></g></g></svg>')
Path('public/images/north-bengal-coverage.svg').write_text(''.join(svg),encoding='utf-8')
print('Map generated',Path('public/images/north-bengal-coverage.svg').stat().st_size)
