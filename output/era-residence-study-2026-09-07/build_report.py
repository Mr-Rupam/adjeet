from pathlib import Path
import hashlib
import html
import json
import os
import re
import shutil
from markdown_it import MarkdownIt
from PIL import Image

ROOT = Path(__file__).resolve().parent
SITE = ROOT.parent.parent / 'adjeet-site'
ASSETS = ROOT / 'assets'
ASSETS.mkdir(exist_ok=True)

asset_map = {
    'adjeet-original.png': SITE / 'public/brand/adjeet-original.png',
    'workshop-day.webp': SITE / 'public/hero/workshop/day.webp',
    'project-acp.png': SITE / 'public/Ambuja_cement_ACP-LED.png',
    'project-acc.png': SITE / 'public/Acc.png',
    'process.webp': SITE / 'public/images/home/idea-to-installation.webp',
    'HindSiliguri-Regular.ttf': SITE / 'app/fonts/HindSiliguri-Regular.ttf',
    'BarlowCondensed-Medium.ttf': SITE / 'app/fonts/BarlowCondensed-Medium.ttf',
}
for name, src in asset_map.items():
    shutil.copy2(src, ASSETS / name)

sources = [
    ('home.html', 'https://www.era-residence.com/'),
    ('site.css', 'https://cdn.prod.website-files.com/6a068da7ad91b057365bf967/css/era-residence.webflow.shared.c9555a234.min.css'),
    ('slater.js', 'https://assets.slater.app/slater/20164.js?v=1.0'),
    ('main.js', 'https://assets.slater.app/slater/20164/60900.js?v=567206'),
]
temp = Path(os.environ['TEMP']) / 'era-residence-design-2026-09-07'
manifest = {'inspected': '2026-09-07', 'completed': '2026-09-08', 'sources': [], 'screenshots': []}
for name, url in sources:
    data = (temp / name).read_bytes()
    manifest['sources'].append({'url': url, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
for path in sorted((ROOT / 'screenshots').glob('*.png')):
    with Image.open(path) as im:
        manifest['screenshots'].append({'file': 'screenshots/' + path.name, 'size': list(im.size), 'format': im.format, 'bytes': path.stat().st_size})
(ROOT / 'source-manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')

captions = {
    '01': ('The opening composition', 'Tall serif structure, a script gesture and one uninterrupted scene.'),
    '02': ('A consistent camera', 'The day/night control changes light while preserving the architecture.'),
    '03': ('The scene takes over', 'As the heading leaves, more of the environment becomes visible.'),
    '04': ('Scroll as camera movement', 'The hero moves and enlarges before the next chapter arrives.'),
    '05': ('A recurring architectural shape', 'An arched section boundary turns the transition into part of the identity.'),
    '06': ('Scenery becomes a page layer', 'The building silhouette sits against the powder-blue chapter.'),
    '07': ('A transitional frame', 'Foreground flowers bridge an image scene and a quieter reading surface.'),
    '08': ('Horizontal storytelling', 'Separate compositions move through one wide track on desktop.'),
    '09': ('An editorial rhythm', 'A narrow photograph, small copy and a circular action balance large type.'),
    '10': ('A useful illustration', 'A route graphic connects the story to location; clouds soften the boundary.'),
    '11': ('Photography and information', 'The residence type, portrait image and facts form one composition.'),
    '12': ('A spatial menu', 'Amenity choices sit inside the environment they describe.'),
    '13': ('Alternating density', 'A close detail is balanced by generous quiet space.'),
    '14': ('A window made with masks', 'Split image openings expand as the architecture section approaches.'),
    '15': ('The full architectural view', 'A restrained text block lets a large photograph establish the mood.'),
    '16': ('The closing scene begins', 'The final image repeats the invitation after the proof and details.'),
    '17': ('The footer emerges', 'The image becomes inset while the closing information appears.'),
    '18': ('Enquiry within the system', 'The same type, rules and palette carry into the form overlay.'),
    '19': ('A phone composition', 'The hero is reframed and navigation simplified; desktop day/night controls are hidden.'),
    '20': ('A full-screen mobile menu', 'The type pairing carries the identity without another visual system.'),
    '21': ('A phone-specific map view', 'A wide visual becomes draggable; the longer horizontal story is stacked.'),
    '22': ('The product index', 'A large heading leads to useful filters and real product cards.'),
    '23': ('The detail-page pattern', 'The floor plan dominates; facts and enquiry sit together beside it.'),
}

def figure(path):
    key = path.name.split('-')[1]
    title, desc = captions[key]
    cls = 'phone' if key in ('19', '20', '21') else ''
    return f'<figure class="evidence {cls}"><a href="screenshots/{path.name}" target="_blank" rel="noopener"><img src="screenshots/{path.name}" loading="lazy" alt="{html.escape(title)}: ERA Residence screenshot"></a><figcaption><strong>{key}. {title}</strong><p>{desc}</p></figcaption></figure>'

all_paths = sorted((ROOT / 'screenshots').glob('*.png'))
highlights = {'01', '05', '08', '11', '14', '18'}
gallery = ''.join(figure(p) for p in all_paths if p.name.split('-')[1] in highlights)
extra = ''.join(figure(p) for p in all_paths if p.name.split('-')[1] not in highlights)

scenes = [
    {'title': 'The workshop', 'job': 'Recognition + a clear action', 'image': 'workshop-day.webp', 'imageLabel': 'Existing real-workshop hero frame', 'headline': 'Made to / be seen.', 'layout': 'Real workshop, intact original logo, existing global theme control, visible WhatsApp action.', 'motion': 'Line reveal; restrained desktop exit movement. The supplied film plays only after a theme change.', 'mobile': 'Static crop and brief entrance. Keep the theme control and enquiry visible.', 'dependency': 'Licensed Cesura and Pristina; verified crops across both films and posters.'},
    {'title': 'Selected work', 'job': 'Proof before more explanation', 'image': 'project-acp.png', 'imageLabel': 'Existing Ambuja ACP/LED project asset', 'headline': 'Real work, early.', 'layout': 'One lead installation, then two supporting projects with readable captions and unequal image sizes.', 'motion': 'A simple sign-face mask opens into the lead image over at most 0.6 viewport of scroll.', 'mobile': 'Full images in a vertical sequence. Preserve the actual lettering in each crop.', 'dependency': 'Use the existing Ambuja, SRMB and ACC source records; no invented outcomes.'},
    {'title': 'Service choices', 'job': 'Find the right kind of work', 'image': None, 'imageLabel': 'Proposed service structure', 'headline': 'Storefront. Campaign. Space.', 'layout': 'Three generous ruled rows. Each has a plain-language description and a clear link.', 'motion': 'Short desktop preview crossfade where relevant imagery exists; focus and click work equally.', 'mobile': 'Descriptions remain visible. Each row is an ordinary, easy-to-tap link.', 'dependency': 'Use existing line illustrations where a relevant project photo is missing.'},
    {'title': 'The process', 'job': 'Make starting a project easier', 'image': 'process.webp', 'imageLabel': 'Existing workshop illustration, not completed-project evidence', 'headline': 'From idea to installation.', 'layout': 'A strong image beside the existing three steps: space, details, make/install.', 'motion': 'Optional desktop sticky media changes with the steps; text stays in normal document flow.', 'mobile': 'Image and steps stack. All instructions are understandable without motion.', 'dependency': 'Use the labelled illustration initially; real fabrication and installation photos improve the final story.'},
    {'title': 'Regional coverage', 'job': 'Establish relevance', 'image': 'project-acc.png', 'imageLabel': 'Existing ACC project asset', 'headline': 'Work in the world.', 'layout': 'One contextual installation photograph and the verified named coverage list.', 'motion': 'A brief decorative route/rule reveal; no invented geographical claims.', 'mobile': 'Readable place names and a direct location/enquiry link.', 'dependency': 'Coverage stays sourced from lib/coverage.ts.'},
    {'title': 'The enquiry', 'job': 'Turn interest into a brief', 'image': None, 'imageLabel': 'Proposed closing composition', 'headline': 'What are we putting your name on?', 'layout': 'Cyan panel, one clear prompt, yellow WhatsApp action and project-brief alternative.', 'motion': 'One headline entrance with quiet button feedback.', 'mobile': 'Direct action with generous touch targets. Keep the existing enquiry dock rules.', 'dependency': 'Reuse the current WhatsApp destination, form route and analytics.'},
]

md = MarkdownIt('commonmark', {'html': False}).enable('table')
raw = (ROOT / 'ERA-TO-AD-JEET.md').read_text(encoding='utf-8')
parts = re.split(r'^## ', raw, flags=re.M)
full = []
for i, part in enumerate(parts[1:], 1):
    title, body = part.split('\n', 1)
    rendered = md.render(body)
    rendered = re.sub(r'<a href="(C:[^"]+)">([^<]+)</a>', lambda m: f'<code title="{m.group(1)}">{m.group(2)}</code>', rendered)
    full.append(f'<details id="spec-{i}" class="spec"><summary>{html.escape(title)}</summary><div class="spec-body">{rendered}</div></details>')

page = '''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ERA Residence → AD JEET | Design study and plan</title>
<style>
@font-face{font-family:Hind;src:url('assets/HindSiliguri-Regular.ttf')}@font-face{font-family:Barlow;src:url('assets/BarlowCondensed-Medium.ttf')}
:root{--paper:#f2f1e9;--ink:#12333b;--muted:#496269;--line:#c9d7d4;--cyan:#109fcc;--yellow:#f1f36d;--night:#0a222a}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:18px/1.55 Hind,Arial,sans-serif}a{color:inherit;text-underline-offset:4px}a:focus-visible,button:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid #08779a;outline-offset:5px}img{max-width:100%;display:block}button,select{font:inherit}button,select,summary{cursor:pointer}button{min-height:44px}header{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:22px 5vw;border-bottom:1px solid var(--line)}header img{width:178px;height:auto}header span{font-size:13px;text-align:right;letter-spacing:.05em;text-transform:uppercase}.wrap{width:min(1220px,90vw);margin:auto}.intro{padding:65px 0 48px;display:grid;grid-template-columns:1.5fr 1fr;gap:50px;align-items:end}.eyebrow{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#08779a;margin:0 0 12px}h1,h2,h3{font-family:Barlow,Georgia,serif;font-weight:500;line-height:1.05;margin:0}h1{font-size:clamp(58px,7vw,104px);letter-spacing:-.018em;max-width:12ch}h2{font-size:clamp(38px,4.5vw,60px)}h3{font-size:34px}.intro p{margin:0}.intro .lede{font-size:22px;line-height:1.45}.intro .small{font-size:14px;color:var(--muted);margin-top:18px}.nav{position:sticky;top:0;z-index:10;background:var(--paper);border-block:1px solid var(--line);display:flex;gap:25px;flex-wrap:wrap;padding:15px 0}.nav a{font-size:15px;text-decoration:none}.nav a:hover{text-decoration:underline}.section{padding:64px 0;scroll-margin-top:76px}.section-head{display:flex;align-items:end;justify-content:space-between;gap:30px;margin-bottom:30px}.section-head p{max-width:45ch;color:var(--muted);margin:0}.principles{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin:30px 0 0;padding:0;list-style:none}.principles li{border-top:1px solid var(--ink);padding-top:18px}.principles p{color:var(--muted);font-size:17px;margin:12px 0}.num{font-size:12px;color:#08779a;display:block;margin-bottom:10px}.gallery{display:grid;grid-template-columns:1fr 1fr;gap:28px}.evidence{margin:0}.evidence>a{display:block;background:#e1e4de;overflow:hidden}.evidence img{width:100%;aspect-ratio:1.98;object-fit:cover}.evidence figcaption{padding:14px 0 4px}.evidence strong{font-size:18px}.evidence p{font-size:16px;line-height:1.45;color:var(--muted);margin:4px 0 0}.evidence.phone>a{background:#dfe8e4}.evidence.phone img{object-fit:contain;height:450px;aspect-ratio:auto}.more{margin-top:28px;border-block:1px solid var(--line);padding:18px 0}.more summary{min-height:44px;padding:8px 0}.more .gallery{margin-top:24px}.font-table{margin:30px 0;border-block:1px solid var(--line)}.font-row{display:grid;grid-template-columns:1fr 1.6fr 1.6fr;gap:20px;border-bottom:1px solid var(--line);padding:14px 0;align-items:center}.font-row:last-child{border:0}.font-row span:first-child{color:var(--muted);font-size:15px}.palette{display:flex;gap:8px;flex-wrap:wrap;margin:24px 0}.swatch{flex:1;min-width:110px;padding:32px 12px 12px;font-size:14px;border:1px solid #12333b20}.note{font-size:15px;color:var(--muted);max-width:85ch}.story{background:var(--night);color:var(--paper);padding:56px 5vw;margin-inline:-5vw}.story .eyebrow{color:var(--yellow)}.story .section-head p{color:#bdd1ce}.story-controls{display:flex;gap:15px;align-items:center;flex-wrap:wrap;margin:26px 0}.story-controls label{font-size:15px}.story-controls select{background:var(--paper);color:var(--ink);border:0;padding:10px 18px;min-height:48px;min-width:240px}.storyboard{display:grid;grid-template-columns:1.1fr 1fr;gap:40px;align-items:start}.story-media{position:relative;background:#11343d;min-height:340px;display:grid;place-items:center}.story-media img{width:100%;aspect-ratio:4/3;object-fit:contain}.story-art{padding:36px;background:var(--cyan);color:var(--night);width:100%;min-height:340px;display:flex;flex-direction:column;justify-content:center}.story-art h3{font-size:56px;max-width:16ch}.story-art .dummy-cta{display:inline-block;width:fit-content;background:var(--yellow);padding:12px 20px;font-size:16px;margin-top:30px}.story-caption{font-size:13px;color:#bdd1ce;margin:9px 0 0}.story-copy h3{font-size:46px}.story-copy p{font-size:17px;color:#bdd1ce;margin:10px 0}.story-copy .job{color:var(--yellow);font-size:14px;margin-top:0}.story-copy dl{margin:22px 0 0}.story-copy dt{font-size:13px;color:var(--yellow);text-transform:uppercase;letter-spacing:.08em;border-top:1px solid #bdd1ce35;padding-top:14px;margin-top:14px}.story-copy dd{margin:6px 0;color:#bdd1ce;font-size:17px}.plan-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:18px}.plan-step{border-top:3px solid var(--cyan);padding-top:16px}.plan-step strong{font-size:20px;display:block}.plan-step p{font-size:16px;color:var(--muted)}.decision{border-left:4px solid var(--cyan);padding:20px 28px;margin:35px 0 0;background:#e5eeea}.decision p{margin:0;max-width:85ch}.spec{border-top:1px solid var(--line)}.spec summary{font-family:Barlow,Arial,sans-serif;font-size:29px;padding:19px 0;line-height:1.2}.spec-body{padding:0 0 28px}.spec-body p{max-width:90ch}.spec-body h3{margin:36px 0 18px;font-size:31px}.spec-body table{font-size:16px;width:100%;border-collapse:collapse;display:block;overflow-x:auto;margin:24px 0}.spec-body th,.spec-body td{padding:13px 16px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line);min-width:120px}.spec-body th{background:#e4e9e3;font-weight:600}.spec-body td{line-height:1.45}.spec-body code{font-size:.85em;background:#e4e9e3;padding:1px 4px;overflow-wrap:anywhere}.spec-body a{overflow-wrap:anywhere}.spec-body li{margin:8px 0}.spec-body ul,.spec-body ol{padding-left:24px}.toolbar{display:flex;gap:12px;flex-wrap:wrap;margin:20px 0}.toolbar button,.download{display:inline-flex;align-items:center;background:transparent;border:1px solid var(--ink);padding:8px 18px;color:var(--ink);font-size:15px;text-decoration:none;min-height:44px}footer{padding:32px 5vw;border-top:1px solid var(--line);font-size:14px;color:var(--muted);display:flex;justify-content:space-between;gap:20px}footer p{margin:0}.smallprint{font-size:13px;color:var(--muted)}
@media(max-width:800px){body{font-size:17px}.intro{grid-template-columns:1fr;gap:26px;padding:40px 0}.intro .lede{font-size:20px}.section-head{display:block}.section-head p{margin-top:18px}.principles{grid-template-columns:1fr}.gallery{grid-template-columns:1fr}.storyboard{grid-template-columns:1fr;gap:24px}.plan-grid{grid-template-columns:1fr}.plan-step{display:grid;grid-template-columns:120px 1fr;gap:15px}.plan-step p{margin:0}.font-row{grid-template-columns:.65fr 1fr 1fr;gap:10px;font-size:15px}.story-media{min-height:240px}.section{padding:44px 0}.nav{gap:10px 20px}.story-art h3{font-size:42px}footer{display:block}footer p{margin-bottom:10px}header img{width:145px}header span{font-size:11px}.evidence.phone img{height:520px}}
.story.section{padding:48px clamp(20px,4vw,50px);margin-inline:0}.storyboard>*{min-width:0}.story-controls select{max-width:100%;min-width:0}.spec-body{min-width:0}.spec-body table{max-width:100%}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;animation:none!important;transition:none!important}}
@media print{.nav,.toolbar,.story-controls{display:none}.wrap{width:100%}.section{padding:25px 0}.spec-body{display:block!important}details>summary{list-style:none}details:not([open])>.spec-body{display:block!important}.story{margin:0}.evidence{break-inside:avoid}.gallery{grid-template-columns:1fr 1fr}.intro{padding-top:20px}h1{font-size:60px}header,footer{padding-inline:0}a{text-decoration:none}}
</style></head><body>
<header><img src="assets/adjeet-original.png" alt="Original AD-JEET logo"><span>Design study / proposed plan<br>07–08 September 2026</span></header>
<main class="wrap">
<div class="intro"><div><p class="eyebrow">A reference, fully unpacked</p><h1>ERA Residence<br>→ AD JEET</h1></div><div><p class="lede">A distinctive website comes from typography, imagery and motion working together. Here is how we bring that craft to the workshop.</p><p class="small">23 screenshots · exact font identification · motion breakdown · six-scene storyboard · implementation plan</p></div></div>
<nav class="nav" aria-label="Report sections"><a href="#findings">The findings</a><a href="#evidence">Visual evidence</a><a href="#typography">Typography</a><a href="#storyboard">AD JEET storyboard</a><a href="#build">Build order</a><a href="#specification">Full specification</a></nav>
<section id="findings" class="section"><div class="section-head"><h2>What creates the effect</h2><p>The strongest transfer is a coherent visual story grounded in the business and its real assets.</p></div>
<ol class="principles"><li><span class="num">01 / CHARACTER</span><h3>Type creates the identity.</h3><p>A monumental narrow serif, an expressive script and a quiet information face have distinct jobs.</p></li><li><span class="num">02 / COMPOSITION</span><h3>Assets create the world.</h3><p>Large scenes, close details and foreground layers are composed together before animation is added.</p></li><li><span class="num">03 / CHOREOGRAPHY</span><h3>Motion gives it order.</h3><p>Different text and image roles get different reveals. A few transitions connect entire sections.</p></li></ol>
<div class="decision"><p><strong>For AD JEET:</strong> refine typography, show genuine work early, add masked reveals and one short hero-to-project transition. Preserve the original logo, real workshop films and direct enquiry path.</p></div></section>
<section id="evidence" class="section"><div class="section-head"><h2>Evidence from ERA</h2><p>Desktop and phone captures from the live inspection. Some frames show transitions in progress. Click an image for the original.</p></div><div class="gallery">__GALLERY__</div><details class="more"><summary>Open the other 17 screenshots, including mobile and detail pages</summary><div class="gallery">__EXTRA__</div></details></section>
<section id="typography" class="section"><div class="section-head"><h2>The exact font roles</h2><p>Verified through computed styles and loaded fonts. The report itself uses the project's existing bundled fallback fonts.</p></div><div class="font-table"><div class="font-row"><span>Role</span><strong>ERA, verified</strong><strong>AD JEET, requested</strong></div><div class="font-row"><span>Display</span><strong>Ambroise Francois Std</strong><strong>Cesura</strong></div><div class="font-row"><span>Accent</span><strong>Sloop Script Three</strong><strong>Pristina</strong></div><div class="font-row"><span>Body + UI</span><strong>Maison Neue Extended</strong><strong>Hind Siliguri</strong></div></div><p class="note">Cesura is currently a font-stack request with a Barlow Condensed fallback. Pristina depends on a local font installation. The intended licensed webfonts are needed before final headline wrapping and animation masks can be approved.</p><div class="palette"><div class="swatch" style="background:#f2f1e9">Chalk<br>#F2F1E9</div><div class="swatch" style="background:#12333b;color:#f2f1e9">Ink<br>#12333B</div><div class="swatch" style="background:#109fcc;color:#08262d">Cyan<br>#109FCC</div><div class="swatch" style="background:#f1f36d;color:#08262d">Yellow<br>#F1F36D</div><div class="swatch" style="background:#0a222a;color:#f2f1e9">Petrol<br>#0A222A</div></div><p class="smallprint">AD JEET's existing light-theme palette. Keep the current semantic dark-theme variants.</p></section>
<section id="storyboard" class="section story"><div class="section-head"><div><p class="eyebrow">The proposed journey</p><h2>Six scenes. Six clear jobs.</h2></div><p>A planning storyboard using existing assets. It describes composition and behavior; it is not a finished homepage mockup.</p></div><div class="story-controls"><label for="scene">Explore a scene</label><select id="scene">__OPTIONS__</select><span id="scene-count">01 / 06</span></div><div class="storyboard"><div><div id="scene-media" class="story-media"></div><p id="scene-caption" class="story-caption"></p></div><div class="story-copy" aria-live="polite"><p id="scene-job" class="job"></p><h3 id="scene-headline"></h3><p id="scene-layout"></p><dl><dt>Motion</dt><dd id="scene-motion"></dd><dt>On a phone</dt><dd id="scene-mobile"></dd><dt>Dependency</dt><dd id="scene-dependency"></dd></dl></div></div><p class="story-caption" style="margin-top:30px">In reduced-motion mode: final content, no scroll travel, no film playback. The real site's global theme control alone continues to own day/night.</p></section>
<section id="build" class="section"><div class="section-head"><h2>How we build it</h2><p>Use the existing Next.js and GSAP setup. Make one complete, reviewable sample before extending the system.</p></div><div class="plan-grid"><div class="plan-step"><strong>01<br>Inputs</strong><p>Font files, image roles, mobile crops and motion tokens.</p></div><div class="plan-step"><strong>02<br>First sample</strong><p>Hero → selected project, normal and reduced motion, phone and desktop.</p></div><div class="plan-step"><strong>03<br>Homepage</strong><p>Services, process, coverage and the closing enquiry.</p></div><div class="plan-step"><strong>04<br>Whole site</strong><p>Portfolio, service pages, About, Contact and local pages.</p></div><div class="plan-step"><strong>05<br>Verification</strong><p>Theme handoff, focus, crops, performance and enquiry regressions.</p></div></div><div class="decision"><p><strong>Start with the hero and one real project.</strong> The current media is sufficient for that sample. More genuine fabrication and installation photography will improve the full experience. Full-site planning allowance: 8–12 working days with assets ready; first sample: 1–2 days.</p></div></section>
<section id="specification" class="section"><div class="section-head"><h2>The full teardown and plan</h2><p>Measured ERA behavior, AD JEET recommendations, file-level changes, asset brief and acceptance criteria.</p></div><div class="toolbar"><button id="expand" type="button">Expand all sections</button><button id="collapse" type="button">Collapse all sections</button><a class="download" href="ERA-TO-AD-JEET.md" download>Download Markdown</a></div>__SPEC__</section>
</main><footer><p>Inspected 7 Sep · completed 8 Sep 2026. Proposed plan; application code unchanged.</p><p><a href="source-manifest.json">Evidence manifest</a> · <a href="https://www.era-residence.com/" target="_blank" rel="noopener">ERA Residence</a></p></footer>
<script>
const scenes=__SCENES__;
const field=(id,text)=>document.getElementById(id).textContent=text;
function renderScene(index){const s=scenes[index];field('scene-count',String(index+1).padStart(2,'0')+' / 06');field('scene-job',s.job);field('scene-headline',s.headline);field('scene-layout',s.layout);field('scene-motion',s.motion);field('scene-mobile',s.mobile);field('scene-dependency',s.dependency);field('scene-caption',s.imageLabel);const media=document.getElementById('scene-media');media.replaceChildren();if(s.image){const im=document.createElement('img');im.src='assets/'+s.image;im.alt=s.imageLabel;media.appendChild(im)}else{const box=document.createElement('div');box.className='story-art';const h=document.createElement('h3');h.textContent=s.headline;box.appendChild(h);const label=document.createElement('span');label.className='dummy-cta';label.textContent=index===5?'WhatsApp your project':'Storefront / Campaign / Space';box.appendChild(label);media.appendChild(box)}}
document.getElementById('scene').addEventListener('change',e=>renderScene(Number(e.target.value)));renderScene(0);
document.getElementById('expand').addEventListener('click',()=>document.querySelectorAll('details.spec').forEach(e=>e.open=true));document.getElementById('collapse').addEventListener('click',()=>document.querySelectorAll('details.spec').forEach(e=>e.open=false));window.addEventListener('beforeprint',()=>document.querySelectorAll('details').forEach(e=>e.open=true));
</script></body></html>'''

page = (page.replace('__GALLERY__', gallery).replace('__EXTRA__', extra)
        .replace('__OPTIONS__', ''.join(f'<option value="{i}">{i+1:02d}. {html.escape(s["title"])}</option>' for i, s in enumerate(scenes)))
        .replace('__SPEC__', ''.join(full)).replace('__SCENES__', json.dumps(scenes).replace('</', '<\\/')))
(ROOT / 'index.html').write_text(page, encoding='utf-8')
(ROOT / 'storyboard.json').write_text(json.dumps(scenes, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'html_bytes': len(page.encode()), 'markdown_words': len(raw.split()), 'screenshots': len(all_paths), 'spec_sections': len(full), 'assets': len(asset_map)}, indent=2))
