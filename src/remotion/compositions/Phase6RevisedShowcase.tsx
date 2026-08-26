'use client';

import React from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, spring, useCurrentFrame} from 'remotion';

// A self-contained editorial short. External images are intentionally used as full-bleed
// photographic material rather than as thumbnails or UI content.
const ASSET = {
  silicon: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1800&q=90',
  fab: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1800&q=90',
  earth: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1800&q=90',
  racks: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1800&q=90',
};

const C = {ink: '#090b10', ivory: '#f6f1e7', amber: '#ffc857', mint: '#64e2c5', rust: '#ef6544'};
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const progress = (frame: number, start: number, duration: number) => clamp((frame - start) / duration);
const fade = (frame: number, start: number, duration = 12) => interpolate(progress(frame, start, duration), [0, 1], [0, 1]);

const Grain: React.FC = () => <AbsoluteFill style={{
  opacity: 0.1,
  mixBlendMode: 'screen',
  pointerEvents: 'none',
  backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 180 180\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'.7\'/%3E%3C/svg%3E")',
}} />;

const Frame: React.FC<{children: React.ReactNode; warm?: boolean}> = ({children, warm = false}) => <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
  {children}
  <AbsoluteFill style={{background: warm ? 'linear-gradient(135deg, rgba(239,101,68,.16), transparent 42%, rgba(255,200,87,.09))' : 'linear-gradient(180deg, rgba(9,11,16,.18), rgba(9,11,16,.12) 50%, rgba(9,11,16,.78))'}} />
  <div style={{position: 'absolute', inset: 28, border: '1px solid rgba(246,241,231,.22)', pointerEvents: 'none'}} />
  <Grain />
</AbsoluteFill>;

const Eyebrow: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.amber}) => <div style={{
  fontFamily: 'monospace', fontSize: 18, fontWeight: 800, letterSpacing: 3.2, color, textTransform: 'uppercase', borderLeft: `5px solid ${color}`, paddingLeft: 13,
}}>{children}</div>;

const Headline: React.FC<{children: React.ReactNode; side?: 'left' | 'right'; top?: number}> = ({children, side = 'left', top = 120}) => <div style={{
  position: 'absolute', top, [side]: 64, width: 910, zIndex: 8, textAlign: side === 'right' ? 'right' : 'left', color: C.ivory,
  fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 82, letterSpacing: -4, lineHeight: .88, textTransform: 'uppercase', textShadow: '0 5px 22px #000',
}}>{children}</div>;

const SourceMark: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{position: 'absolute', bottom: 72, right: 64, color: C.mint, fontFamily: 'monospace', fontSize: 15, letterSpacing: 2.2, fontWeight: 800, zIndex: 9}}>{children}</div>;

/** VISUAL BEATS 0.0–0.8 black/silicon; 0.8–2.0 macro emerges; 2.0–3.2 camera dives;
 * 3.2–4.2 LIMIT takes over; 4.2–6.0 optical ring becomes the fab aperture. */
const SceneOne: React.FC = () => {
  const f = useCurrentFrame();
  const dive = interpolate(f, [0, 150], [1.34, .96]);
  const limit = spring({frame: f - 88, fps: 30, config: {damping: 16, stiffness: 95}});
  const aperture = interpolate(f, [125, 180], [.3, 1.65]);
  return <Frame>
    <Img src={ASSET.silicon} style={{width: '145%', height: '145%', objectFit: 'cover', transform: `translate(-20%, -17%) scale(${dive})`, filter: 'contrast(1.42) saturate(.48) brightness(.52)'}} />
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 48% 57%, transparent 0 20%, rgba(9,11,16,.12) 42%, rgba(9,11,16,.93) 100%)'}} />
    {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', width: 680 + i * 190, height: 680 + i * 190, borderRadius: '50%', border: `${i === 0 ? 12 : 2}px solid ${i === 0 ? C.amber : 'rgba(255,200,87,.34)'}`, left: 185 - i * 95, top: 575 - i * 95, transform: `scale(${aperture + i * .06})`, opacity: fade(f, 40 + i * 8) * (i === 0 ? .94 : .72)}} />)}
    <div style={{position: 'absolute', top: 126, left: 64, zIndex: 9}}><Eyebrow>01 / the physical limit</Eyebrow></div>
    <Headline top={174}>THE RACE<br />IS <span style={{color: C.amber}}>SILICON.</span></Headline>
    <div style={{position: 'absolute', left: 64, bottom: 185, width: 800, color: C.ivory, fontFamily: 'Georgia, serif', fontSize: 37, lineHeight: 1.14, opacity: fade(f, 65), transform: `translateY(${interpolate(f, [65, 92], [34, 0])}px)`}}>The AI boom is no longer limited by code. It is limited by matter.</div>
    <div style={{position: 'absolute', top: 630, left: 95, zIndex: 8, color: C.ivory, fontFamily: 'Arial Black, Arial', fontSize: 175, letterSpacing: -10, opacity: limit, transform: `scale(${interpolate(limit, [0, 1], [1.35, 1])})`}}>LIMIT</div>
    <SourceMark>CAMERA / INTO THE DIE</SourceMark>
  </Frame>;
};

/** VISUAL BEATS 0.0–1 aperture opens; 1.0–2.3 cleanroom enters; 2.3–3.7 light sheets scan;
 * 3.7–5.0 3 NM locks onto the scan; 5.0–6.0 aperture burns into compute. */
const SceneTwo: React.FC = () => {
  const f = useCurrentFrame();
  const scan = interpolate(f, [25, 150], [-260, 1660]);
  const nm = spring({frame: f - 102, fps: 30, config: {damping: 14, stiffness: 90}});
  return <Frame warm>
    <Img src={ASSET.fab} style={{width: '136%', height: '112%', objectFit: 'cover', transform: `translate(-18%, -4%) scale(${interpolate(f, [0, 180], [1.17, 1.03])})`, filter: 'grayscale(.72) contrast(1.32) brightness(.69) sepia(.18)'}} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(9,11,16,.88), rgba(9,11,16,.18) 74%), linear-gradient(0deg, rgba(9,11,16,.82), transparent 42%)'}} />
    {[0, 1, 2, 3].map((i) => <div key={i} style={{position: 'absolute', left: -140, top: scan + i * 118, width: 1360, height: 3 + i, background: i % 2 ? C.amber : C.ivory, opacity: .84 - i * .14, transform: 'rotate(-17deg)', boxShadow: `0 0 30px ${C.amber}`}} />)}
    <div style={{position: 'absolute', top: 125, left: 64, zIndex: 9}}><Eyebrow>02 / extreme ultraviolet</Eyebrow></div>
    <Headline top={175}>THE FAB<br />BEHIND <span style={{color: C.amber}}>EVERYTHING.</span></Headline>
    <div style={{position: 'absolute', left: 62, bottom: 228, color: C.amber, fontFamily: 'Arial Black, Arial', fontSize: 255, lineHeight: .78, letterSpacing: -16, opacity: nm, transform: `translateX(${interpolate(nm, [0, 1], [-160, 0])}px)`}}>3<span style={{fontSize: 122, letterSpacing: -6}}>NM</span></div>
    <div style={{position: 'absolute', left: 67, bottom: 145, width: 780, color: C.ivory, fontFamily: 'Georgia, serif', fontSize: 34, lineHeight: 1.17, opacity: fade(f, 76)}}>A billion-dollar machine carves the future one atom-thin layer at a time.</div>
    <SourceMark>ALIGNMENT / LIGHT / YIELD</SourceMark>
  </Frame>;
};

/** VISUAL BEATS 0.0–1 dark die; 1.0–2.4 24 months appears; 2.4–4.2 capacity towers rise;
 * 4.2–5.8 400% becomes material; 5.8–7 optical columns pull into a globe. */
const SceneThree: React.FC = () => {
  const f = useCurrentFrame();
  const count = Math.round(interpolate(f, [85, 175], [0, 400], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const p = [0, 1, 2, 3, 4, 5, 6].map((i) => spring({frame: f - 46 - i * 11, fps: 30, config: {damping: 17, stiffness: 85}}));
  return <Frame>
    <Img src={ASSET.racks} style={{width: '150%', height: '115%', objectFit: 'cover', transform: `translate(-23%, -4%) scale(${interpolate(f, [0, 210], [1.22, 1.04])})`, filter: 'grayscale(1) contrast(1.55) brightness(.25)'}} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(9,11,16,.2), #090b10 76%)'}} />
    <div style={{position: 'absolute', top: 126, left: 64, zIndex: 9}}><Eyebrow color={C.mint}>03 / density, not decoration</Eyebrow></div>
    <Headline top={175}>TWENTY-FOUR<br /><span style={{color: C.mint}}>MONTHS.</span></Headline>
    <div style={{position: 'absolute', left: 62, top: 570, color: C.ivory, fontFamily: 'Arial Black, Arial', fontSize: 318, letterSpacing: -27, lineHeight: .75, zIndex: 8, opacity: fade(f, 55)}}>{count}<span style={{color: C.amber, fontSize: 166}}>%</span></div>
    <div style={{position: 'absolute', left: 67, top: 840, color: C.ivory, fontFamily: 'Arial Black, Arial', fontSize: 48, lineHeight: .98, zIndex: 8}}>MORE COMPUTE<br />PER MEGAWATT</div>
    <div style={{position: 'absolute', left: 62, right: 62, bottom: 155, height: 480, display: 'flex', gap: 17, alignItems: 'end', zIndex: 5}}>{p.map((v, i) => <div key={i} style={{flex: 1, height: `${interpolate(v, [0, 1], [6, 42 + (i % 3) * 25])}%`, background: i % 3 === 0 ? C.rust : i % 3 === 1 ? C.amber : C.mint, transform: `skewY(-10deg) translateY(${interpolate(v, [0, 1], [150, 0])}px)`, boxShadow: `0 -18px 48px ${i % 3 === 2 ? '#64e2c555' : '#ffc85744'}`}} />)}</div>
    <div style={{position: 'absolute', left: 64, bottom: 91, color: C.ivory, fontFamily: 'monospace', fontSize: 18, letterSpacing: 2}}>2024–2026 / PHYSICAL SCALING</div>
  </Frame>;
};

/** VISUAL BEATS 0.0–1.2 die columns stretch into orbit; 1.2–2.5 earth arrives; 2.5–4.0 corridors trace;
 * 4.0–5.6 nodes light in sequence; 5.6–7 camera dives through Taiwan node. */
const SceneFour: React.FC = () => {
  const f = useCurrentFrame();
  const dash = 2100 - f * 12;
  const node = (at: number) => fade(f, at, 12);
  return <Frame>
    <Img src={ASSET.earth} style={{width: '160%', height: '128%', objectFit: 'cover', transform: `translate(-29%, -11%) scale(${interpolate(f, [0, 210], [1.02, 1.28])})`, filter: 'contrast(1.45) saturate(.72) brightness(.57)'}} />
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 52% 50%, transparent 0 35%, rgba(9,11,16,.88) 89%)'}} />
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, zIndex: 5}}>
      <path d="M-20 1360 C250 940, 530 1040, 840 650" fill="none" stroke={C.amber} strokeWidth="12" strokeDasharray="35 19" strokeDashoffset={dash} />
      <path d="M110 1540 C430 1110, 710 1250, 1130 870" fill="none" stroke={C.mint} strokeWidth="9" strokeDasharray="17 23" strokeDashoffset={-dash} />
      {[[130, 1260, 28], [840, 650, 70], [245, 1480, 108], [970, 940, 142]].map(([x, y, at], i) => <g key={i} opacity={node(at)}><circle cx={x} cy={y} r={58 + Math.sin((f + i * 6) / 8) * 8} fill="none" stroke={i % 2 ? C.mint : C.amber} strokeWidth="3"/><circle cx={x} cy={y} r="14" fill={C.ivory}/></g>)}
    </svg>
    <div style={{position: 'absolute', top: 126, left: 64, zIndex: 8}}><Eyebrow>04 / a chain, not a country</Eyebrow></div>
    <Headline top={175}>THE CHIP<br />IS <span style={{color: C.amber}}>GLOBAL.</span></Headline>
    <div style={{position: 'absolute', left: 65, bottom: 158, width: 790, color: C.ivory, fontFamily: 'Georgia, serif', fontSize: 35, lineHeight: 1.16, zIndex: 8}}>A machine in Europe. A fab in Taiwan. Compute deployed across the world.</div>
    <SourceMark>OPTICAL CORRIDORS / LIVE</SourceMark>
  </Frame>;
};

/** VISUAL BEATS 0.0–1 giant die rises from globe node; 1.0–2.4 traces activate; 2.4–3.8 layers separate;
 * 3.8–5.5 3 NM locks to the die; 5.5–8 camera enters the transistor city. */
const SceneFive: React.FC = () => {
  const f = useCurrentFrame();
  const rotation = interpolate(f, [0, 240], [-8, 5]);
  const lines = Array.from({length: 17});
  return <Frame>
    <AbsoluteFill style={{background: 'radial-gradient(circle at 52% 56%, #263441 0%, #10141c 45%, #090b10 78%)'}} />
    <div style={{position: 'absolute', width: 1290, height: 1120, left: -108, top: 525, transform: `perspective(1300px) rotateX(57deg) rotateZ(${rotation}deg) scale(${interpolate(f, [0, 240], [.82, 1.16])})`, transformOrigin: '50% 50%', background: 'linear-gradient(135deg, #1b3540, #071015 49%, #29353e)', border: `12px solid ${C.amber}`, boxShadow: `0 45px 100px #000, inset 0 0 110px #64e2c544`}}>
      {lines.map((_, i) => <div key={i} style={{position: 'absolute', left: 52 + i * 72, top: 60 + (i % 3) * 32, height: 960 - (i % 4) * 150, width: i % 2 ? 26 : 14, background: i % 3 === 0 ? C.mint : C.amber, opacity: .45 + .32 * fade(f, 35 + i * 5), boxShadow: `0 0 30px ${i % 3 === 0 ? C.mint : C.amber}`}} />)}
      {Array.from({length: 11}).map((_, i) => <div key={`h${i}`} style={{position: 'absolute', top: 100 + i * 85, left: 0, width: '100%', height: 2, background: 'rgba(246,241,231,.25)'}} />)}
    </div>
    <div style={{position: 'absolute', top: 126, left: 64, zIndex: 9}}><Eyebrow>05 / architecture</Eyebrow></div>
    <Headline top={175}>NOT A CHIP.<br /><span style={{color: C.amber}}>A CITY</span> OF LOGIC.</Headline>
    <div style={{position: 'absolute', left: 64, bottom: 145, zIndex: 9, color: C.ivory, fontFamily: 'Arial Black, Arial', fontSize: 145, letterSpacing: -8, lineHeight: .85}}>3<span style={{fontSize: 76, color: C.mint}}>NM</span><div style={{fontSize: 19, letterSpacing: 4, color: C.mint, marginTop: 22}}>TRANSISTOR TERRITORY</div></div>
  </Frame>;
};

/** VISUAL BEATS 0.0–1 die aperture reveals cleanroom; 1.0–2.4 technician enters at full scale; 2.4–3.8
 * scan line finds a defect; 3.8–5.2 precision text replaces it; 5.2–7 the scanner resolves into 100×. */
const SceneSix: React.FC = () => {
  const f = useCurrentFrame();
  const scanX = interpolate(f, [45, 180], [-80, 1160]);
  const precision = spring({frame: f - 98, fps: 30, config: {damping: 15, stiffness: 86}});
  return <Frame warm>
    <Img src={ASSET.fab} style={{width: '148%', height: '118%', objectFit: 'cover', transform: `translate(-17%, -6%) scale(${interpolate(f, [0, 180], [1.26, 1.05])})`, filter: 'grayscale(.55) contrast(1.38) brightness(.58)'}} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(9,11,16,.12), rgba(9,11,16,.72) 82%), linear-gradient(0deg, rgba(9,11,16,.95), transparent 55%)'}} />
    <div style={{position: 'absolute', left: scanX, top: 250, width: 8, height: 1280, background: C.mint, boxShadow: `0 0 46px ${C.mint}, 0 0 180px ${C.mint}`, opacity: .9}} />
    {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', width: 720 + i * 190, height: 720 + i * 190, left: 155 - i * 95, top: 560 - i * 95, border: `2px solid ${i === 0 ? C.mint : 'rgba(100,226,197,.35)'}`, borderRadius: '50%', transform: `scale(${.65 + f / 420 + i * .06})`, opacity: .62 - i * .14}} />)}
    <div style={{position: 'absolute', top: 126, right: 64, zIndex: 9}}><Eyebrow color={C.mint}>06 / human precision</Eyebrow></div>
    <Headline side="right" top={175}>THE LAST<br /><span style={{color: C.mint}}>MICRON.</span></Headline>
    <div style={{position: 'absolute', right: 64, bottom: 220, width: 780, color: C.ivory, fontFamily: 'Arial Black, Arial', fontSize: 67, letterSpacing: -3, lineHeight: .9, textAlign: 'right', opacity: precision, transform: `translateX(${interpolate(precision, [0, 1], [140, 0])}px)`}}>EVERY DEFECT<br />STOPS THE LINE.</div>
    <div style={{position: 'absolute', right: 64, bottom: 140, width: 710, color: C.ivory, fontFamily: 'Georgia, serif', fontSize: 32, lineHeight: 1.16, textAlign: 'right', opacity: fade(f, 120)}}>The final performance gain is earned where every imperfection is fatal.</div>
    <SourceMark>INSPECTION / NANOMETRE SCALE</SourceMark>
  </Frame>;
};

/** VISUAL BEATS 0.0–1 scanner becomes light rays; 1.0–2.5 100× lands; 2.5–3.8 final claim tightens;
 * 3.8–5 line energy collapses to a quiet end frame. */
const SceneSeven: React.FC = () => {
  const f = useCurrentFrame();
  const p = spring({frame: f - 18, fps: 30, config: {damping: 13, stiffness: 82}});
  return <Frame>
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 43%, #39473f 0%, #161a1b 38%, #090b10 78%)'}} />
    {Array.from({length: 29}).map((_, i) => <div key={i} style={{position: 'absolute', width: i % 4 === 0 ? 5 : 2, height: 2050, left: 18 + i * 38, top: -105, background: i % 3 ? C.amber : C.mint, opacity: .2, transform: `rotate(${(i - 14) * 3.2}deg)`, transformOrigin: 'bottom'}} />)}
    <div style={{position: 'absolute', top: 315, width: '100%', textAlign: 'center', color: C.ivory, fontFamily: 'Arial Black, Arial', fontSize: 365, letterSpacing: -31, lineHeight: .76, transform: `scale(${interpolate(p, [0, 1], [.45, 1])})`, textShadow: `0 0 64px ${C.amber}66`}}>100<span style={{fontSize: 205, color: C.amber}}>×</span></div>
    <div style={{position: 'absolute', top: 725, width: '100%', textAlign: 'center', color: C.ivory, fontFamily: 'Arial Black, Arial', fontSize: 64, letterSpacing: -3, lineHeight: .92, textTransform: 'uppercase', opacity: fade(f, 58)}}>MORE THROUGHPUT<br />CHANGES THE FRONTIER.</div>
    <div style={{position: 'absolute', bottom: 145, left: 100, right: 100, color: C.mint, fontFamily: 'monospace', fontSize: 18, letterSpacing: 3, fontWeight: 800, textAlign: 'center', opacity: fade(f, 100)}}>THE PHYSICAL FOUNDATION OF THE NEXT ERA</div>
  </Frame>;
};

export const Phase6RevisedShowcase: React.FC = () => <AbsoluteFill>
  <Sequence from={0} durationInFrames={180}><SceneOne /></Sequence>
  <Sequence from={180} durationInFrames={180}><SceneTwo /></Sequence>
  <Sequence from={360} durationInFrames={210}><SceneThree /></Sequence>
  <Sequence from={570} durationInFrames={210}><SceneFour /></Sequence>
  <Sequence from={780} durationInFrames={240}><SceneFive /></Sequence>
  <Sequence from={1020} durationInFrames={180}><SceneSix /></Sequence>
  <Sequence from={1200} durationInFrames={150}><SceneSeven /></Sequence>
</AbsoluteFill>;
