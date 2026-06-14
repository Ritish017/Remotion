import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@supabase/supabase-js'

const s3 = new S3Client({ region: 'us-east-1' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const S3_BUCKET = process.env.S3_VIDEO_BUCKET || 'catalyst-videos-759433041913'

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await context.params

  const { data } = await supabase
    .from('live_event_states')
    .select('event_data')
    .eq('event_key', `video_job:${jobId}`)
    .single()

  const job = data?.event_data as any

  let segmentUrls: Array<{ url: string; textOverlay: any; durationSeconds: number } | null>

  if (job?.segments?.length) {
    // Tracked job — use stored invocationArns
    // Nova Reel writes to: videos/{jobId}/segment_{i}/{invocationId}/output.mp4
    segmentUrls = await Promise.all(
      job.segments.map(async (seg: any, i: number) => {
        try {
          const invocationId = seg.invocationArn?.split('/').pop() || ''
          const key = `videos/${jobId}/segment_${i}/${invocationId}/output.mp4`
          const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }), { expiresIn: 3600 })
          return { url, textOverlay: seg.textOverlay, durationSeconds: seg.durationSeconds }
        } catch {
          return null
        }
      })
    )
  } else {
    // Untracked job — scan S3 to find all segments
    const listRes = await s3.send(new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: `videos/${jobId}/`,
    }))
    const mp4s = (listRes.Contents || [])
      .filter(o => o.Key?.endsWith('/output.mp4'))
      .sort((a, b) => (a.Key! < b.Key! ? -1 : 1))

    segmentUrls = await Promise.all(
      mp4s.map(async (obj) => {
        try {
          const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: S3_BUCKET, Key: obj.Key! }), { expiresIn: 3600 })
          return { url, textOverlay: { type: 'generic' as const }, durationSeconds: 6 }
        } catch {
          return null
        }
      })
    )
  }

  const validSegments = segmentUrls.filter(Boolean) as Array<{
    url: string
    textOverlay: any
    durationSeconds: number
  }>

  const segmentsJson = JSON.stringify(validSegments)

  const overlayColorMap: Record<string, string> = {
    hook: '#818cf8',      // indigo — opens strong
    problem: '#fb923c',   // amber-orange — tension, not aggressive red
    solution: '#34d399',  // emerald — clarity and success
    cta: '#f472b6',       // pink — memorable finish
    generic: '#94a3b8',   // slate — neutral
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Catalyst Video Preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a0f; color: #fff; font-family: 'Inter', system-ui, sans-serif; height: 100vh; overflow: hidden; }

  #container { position: relative; width: 100%; height: 100vh; }
  #video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.55; transition: opacity 0.6s ease; }

  /* Multi-layer vignette: subtle not crushing */
  #vignette {
    position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 120% 100% at 50% 100%, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 40%, transparent 70%),
      radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,0,0,0.4) 0%, transparent 60%),
      linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 30%, transparent 55%, rgba(0,0,0,0.6) 100%);
  }

  /* Content area sits above vignette */
  #content {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    justify-content: flex-end;
    padding: 0 36px 36px;
  }

  /* Top bar */
  #top-bar {
    position: absolute; top: 0; left: 0; right: 0;
    padding: 20px 28px 0;
    display: flex; align-items: center; justify-content: space-between;
  }

  #brand {
    display: flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
    color: rgba(255,255,255,0.45);
  }
  #brand-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--accent, #818cf8);
    box-shadow: 0 0 8px var(--accent, #818cf8);
  }

  #segment-dots {
    display: flex; gap: 5px; align-items: center;
  }
  .dot {
    width: 24px; height: 3px; border-radius: 2px;
    background: rgba(255,255,255,0.2);
    transition: all 0.4s ease;
  }
  .dot.active { background: var(--accent, #818cf8); width: 36px; box-shadow: 0 0 6px var(--accent, #818cf8); }

  /* Segment type label */
  #type-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px; border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(0,0,0,0.35);
    backdrop-filter: blur(8px);
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--accent, #818cf8);
    margin-bottom: 14px;
    width: fit-content;
  }
  #type-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent, #818cf8); }

  /* Main headline */
  #title {
    font-size: clamp(22px, 4.5vw, 36px);
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.025em;
    color: #ffffff;
    margin-bottom: 14px;
    text-shadow: 0 2px 20px rgba(0,0,0,0.6);
    max-width: 85%;
    opacity: 0; transform: translateY(12px);
    transition: opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s;
  }
  #title.visible { opacity: 1; transform: translateY(0); }

  /* Bullet points */
  #bullets {
    list-style: none;
    margin-bottom: 16px;
    display: flex; flex-direction: column; gap: 6px;
  }
  .bullet-item {
    display: flex; align-items: flex-start; gap: 10px;
    font-size: 14px; font-weight: 500; line-height: 1.5;
    color: rgba(255,255,255,0.82);
    opacity: 0; transform: translateX(-8px);
    transition: opacity 0.4s ease, transform 0.4s ease;
  }
  .bullet-item.visible { opacity: 1; transform: translateX(0); }
  .bullet-icon {
    width: 20px; height: 20px; border-radius: 5px; flex-shrink: 0;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; margin-top: 2px;
    color: var(--accent, #818cf8);
  }

  /* Code snippet */
  .code-block {
    background: rgba(0,0,0,0.55);
    border: 1px solid rgba(255,255,255,0.1);
    border-left: 3px solid var(--accent, #818cf8);
    border-radius: 8px;
    padding: 10px 14px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px; line-height: 1.6;
    color: rgba(255,255,255,0.75);
    margin-bottom: 14px;
    backdrop-filter: blur(4px);
    opacity: 0; transform: translateY(8px);
    transition: opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s;
  }
  .code-block.visible { opacity: 1; transform: translateY(0); }
  .code-keyword { color: #c084fc; }
  .code-string { color: #86efac; }
  .code-func { color: #67e8f9; }

  /* Stat callout */
  #stat-block {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 20px;
    opacity: 0; transform: translateY(8px);
    transition: opacity 0.5s ease 0.25s, transform 0.5s ease 0.25s;
  }
  #stat-block.visible { opacity: 1; transform: translateY(0); }
  #stat-bar { width: 3px; height: 36px; border-radius: 2px; background: var(--accent, #818cf8); flex-shrink: 0; }
  #stat {
    font-size: 13px; font-weight: 500;
    color: rgba(255,255,255,0.7); line-height: 1.4;
  }

  /* Progress bar */
  #progress-bar {
    position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
    background: rgba(255,255,255,0.08);
  }
  #progress-fill { height: 100%; width: 0%; background: var(--accent, #818cf8); transition: width 0.1s linear; }

  /* Segment transition fade */
  #content-inner { transition: opacity 0.35s ease; }
  #content-inner.fading { opacity: 0; }
</style>
</head>
<body>
<div id="container">
  <video id="video" muted autoplay playsinline></video>
  <div id="vignette"></div>

  <div id="top-bar">
    <div id="brand">
      <div id="brand-dot"></div>
      CATALYST
    </div>
    <div id="segment-dots"></div>
  </div>

  <div id="content">
    <div id="content-inner">
      <div id="type-badge"><div id="type-dot"></div><span id="type-label"></span></div>
      <div id="title"></div>
      <ul id="bullets"></ul>
      <div id="code-area"></div>
      <div id="stat-block"><div id="stat-bar"></div><div id="stat"></div></div>
    </div>
  </div>

  <div id="progress-bar"><div id="progress-fill"></div></div>
</div>

<script>
  const segments = ${segmentsJson};
  const colorMap = ${JSON.stringify(overlayColorMap)};
  const codeSnippets = {
    hook: null,
    problem: null,
    solution: \`<span class="code-keyword">from</span> langgraph.graph <span class="code-keyword">import</span> <span class="code-func">StateGraph</span>\\n<span class="code-keyword">from</span> typing <span class="code-keyword">import</span> TypedDict\\n\\ngraph = <span class="code-func">StateGraph</span>(AgentState)\`,
    cta: null,
  };

  const typeLabels = { hook: '01 · Hook', problem: '02 · The Problem', solution: '03 · Solution', cta: '04 · Next Steps', generic: '· Clip' };

  let current = 0;
  let progressInterval = null;

  const video = document.getElementById('video');
  const titleEl = document.getElementById('title');
  const bulletsEl = document.getElementById('bullets');
  const statEl = document.getElementById('stat');
  const statBlock = document.getElementById('stat-block');
  const typeLabelEl = document.getElementById('type-label');
  const progressFill = document.getElementById('progress-fill');
  const dotsContainer = document.getElementById('segment-dots');
  const contentInner = document.getElementById('content-inner');
  const codeArea = document.getElementById('code-area');
  const root = document.documentElement;

  segments.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.id = 'dot-' + i;
    dotsContainer.appendChild(dot);
  });

  function setAccent(color) {
    document.getElementById('brand-dot').style.background = color;
    document.getElementById('brand-dot').style.boxShadow = '0 0 8px ' + color;
    document.getElementById('type-dot').style.background = color;
    document.getElementById('type-label').style.color = color;
    document.getElementById('stat-bar').style.background = color;
    progressFill.style.background = color;
    document.querySelector('.dot.active') && (document.querySelector('.dot.active').style.background = color);
  }

  function animateIn() {
    titleEl.classList.add('visible');
    const items = bulletsEl.querySelectorAll('.bullet-item');
    items.forEach((item, i) => {
      setTimeout(() => item.classList.add('visible'), 120 + i * 100);
    });
    const codeBlock = codeArea.querySelector('.code-block');
    if (codeBlock) setTimeout(() => codeBlock.classList.add('visible'), 200);
    if (statEl.textContent) setTimeout(() => statBlock.classList.add('visible'), 300);
  }

  function clearAnimations() {
    titleEl.classList.remove('visible');
    bulletsEl.querySelectorAll('.bullet-item').forEach(el => el.classList.remove('visible'));
    const codeBlock = codeArea.querySelector('.code-block');
    if (codeBlock) codeBlock.classList.remove('visible');
    statBlock.classList.remove('visible');
  }

  function updateOverlay(seg) {
    const overlay = seg.textOverlay;
    const color = colorMap[overlay.type] || '#a78bfa';

    setAccent(color);
    typeLabelEl.textContent = typeLabels[overlay.type] || '· Clip';
    titleEl.textContent = overlay.title || '';

    bulletsEl.innerHTML = '';
    if (overlay.bullets?.length) {
      overlay.bullets.forEach((b, i) => {
        const li = document.createElement('li');
        li.className = 'bullet-item';
        li.innerHTML = '<div class="bullet-icon">' + (i + 1) + '</div><span>' + b + '</span>';
        bulletsEl.appendChild(li);
      });
    }

    codeArea.innerHTML = '';
    const snippet = codeSnippets[overlay.type];
    if (snippet) {
      const pre = document.createElement('pre');
      pre.className = 'code-block';
      pre.innerHTML = snippet;
      codeArea.appendChild(pre);
    }

    statEl.textContent = overlay.stat || '';
    statBlock.style.display = overlay.stat ? 'flex' : 'none';
  }

  function playSegment(index) {
    if (index >= segments.length) index = 0;
    current = index;

    // Fade out
    contentInner.classList.add('fading');
    clearAnimations();

    setTimeout(() => {
      document.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === index);
      });

      const seg = segments[index];
      updateOverlay(seg);
      video.src = seg.url;
      video.load();
      video.play().catch(() => {});

      // Fade in
      contentInner.classList.remove('fading');
      setTimeout(animateIn, 80);

      // Progress bar
      clearInterval(progressInterval);
      progressFill.style.width = '0%';
      let elapsed = 0;
      const totalMs = (seg.durationSeconds || 6) * 1000;
      progressInterval = setInterval(() => {
        elapsed += 100;
        progressFill.style.width = Math.min((elapsed / totalMs) * 100, 100) + '%';
      }, 100);

      video.onended = () => playSegment(index + 1);
    }, 320);
  }

  if (segments.length > 0) {
    updateOverlay(segments[0]);
    video.src = segments[0].url;
    video.load();
    video.play().catch(() => {});
    setTimeout(animateIn, 200);

    clearInterval(progressInterval);
    progressFill.style.width = '0%';
    let elapsed = 0;
    const totalMs = (segments[0].durationSeconds || 6) * 1000;
    progressInterval = setInterval(() => {
      elapsed += 100;
      progressFill.style.width = Math.min((elapsed / totalMs) * 100, 100) + '%';
    }, 100);
    video.onended = () => playSegment(1);
  } else {
    titleEl.textContent = 'Video generating...';
    titleEl.classList.add('visible');
  }
</script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
