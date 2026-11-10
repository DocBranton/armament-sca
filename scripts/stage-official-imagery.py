#!/usr/bin/env python3
"""Stage official Air Force image candidates as CI artifacts, never auto-publish.
Requires: python3 + Pillow. Network access happens only within GitHub Actions.
"""
import json, re, sys, urllib.request, urllib.parse
from html import unescape
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'docs/official-image-sources.json').read_text())
output=ROOT/'artifacts'/'official-photo-candidates'
output.mkdir(parents=True,exist_ok=True)
log=[]
for item in manifest['sources']:
    name=item['output']; page=item['page']; url=item.get('source')
    report={'name':name,'page':page,'status':'pending'}
    try:
        if not url:
            req=urllib.request.Request(page,headers={'User-Agent':'Mozilla/5.0 (compatible; AirForceAssetAudit/1.0)'})
            with urllib.request.urlopen(req,timeout=25) as response:
                html=response.read(6_000_000).decode('utf-8','replace')
            # Photo pages link to media.defense.gov /Download. Match all attributes,
            # not just the first thumbnail (which may be too small).
            matches=re.findall(r'(?:https?:)?//media\.defense\.gov/[^\s"\'<>]+',unescape(html),re.I)
            candidates=[unescape(v).replace('&amp;','&') for v in matches if '/-1/-1/0/' in v]
            if not candidates:
                candidates=[unescape(v).replace('&amp;','&') for v in matches]
            if not candidates: raise ValueError('No official media.defense.gov download URL on source page')
            url=candidates[0]
            if url.startswith('//'): url='https:'+url
        host=urllib.parse.urlsplit(url).hostname or ''
        if host!='media.defense.gov': raise ValueError('Unexpected image host: '+host)
        req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
        with urllib.request.urlopen(req,timeout=35) as response:
            data=response.read(12_000_000)
        source=output/(name.replace('.webp','.source.jpg'))
        source.write_bytes(data)
        with Image.open(source) as im:
            im=ImageOps.exif_transpose(im).convert('RGB')
            im.thumbnail((2600,1600), Image.Resampling.LANCZOS)
            im.save(output/name,'WEBP',quality=86,method=6)
            report.update(status='staged',url=url,pixels=list(im.size),bytes=(output/name).stat().st_size)
    except Exception as ex:
        report.update(status='failed',reason=str(ex))
    log.append(report)
(output/'source-manifest.json').write_text(json.dumps(log,indent=2))
for row in log: print(row)
if not any(row['status']=='staged' for row in log):
    print('No candidate photo could be staged; no images have been committed.',file=sys.stderr)
    sys.exit(1)
