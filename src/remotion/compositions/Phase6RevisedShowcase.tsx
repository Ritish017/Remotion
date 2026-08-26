'use client';

import React from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

const ASSETS = {
  racks: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=90',
  silicon: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=90',
  fab: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=90',
  earth: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=90',
  engineer: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1300&q=90',
};

const C = {ink: '#090b10', paper: '#f5f0e7', amber: '#ffc857', rust: '#f05d3a', mint: '#5ce1c2', blue: '#78a7ff'};

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const enter = (frame: number, at: number, length = 18) => clamp((frame - at) / length);

const Grain: React.FC = () => (
  <AbsoluteFill style={{opacity: 0.11, mixBlendMode: 'screen', pointerEvents: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 180 180\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.75\'/%3E%3C/svg%3E")'}} />
);

const Label: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.amber}) => (
  <div style={{fontFamily: 'monospace', color, fontSize: 19, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', borderLeft: `5px solid ${color}`, paddingLeft: 14}}>{children}</div>
);

const SceneTitle: React.FC<{eyebrow: string; children: React.ReactNode; right?: boolean}> = ({eyebrow, children, right = false}) => (
  <div style={{position: 'absolute', top: 126, left: right ? undefined : 64, right: right ? 64 : undefined, width: 930, zIndex: 8, textAlign: right ? 'right' : 'left'}}>
    <Label>{eyebrow}</Label>
    <div style={{fontFamily: 'Arial Black, Arial, sans-serif', color: C.paper, fontSize: 72, letterSpacing: -3, lineHeight: 0.92, marginTop: 22, textTransform: 'uppercase', textShadow: '0 4px 20px #000'}}>{children}</div>
  </div>
);

const EditorialFrame: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
    {children}
    <div style={{position: 'absolute', inset: 28, border: '1px solid rgba(245,240,231,0.22)', pointerEvents: 'none'}} />
    <Grain />
  </AbsoluteFill>
);

const SceneOne: React.FC = () => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, 180], [0.72, 1.22]);
  const word = enter(f, 72, 20);
  return <EditorialFrame>
    <Img src={ASSETS.silicon} style={{width: '125%', height: '125%', objectFit: 'cover', transform: `translate(-12%, -5%) scale(${scale})`, filter: 'contrast(1.3) saturate(.62) brightness(.58)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(9,11,16,.35), rgba(9,11,16,.05) 36%, rgba(9,11,16,.86))'}} />
    <div style={{position: 'absolute', width: 1280, height: 1280, borderRadius: '50%', border: `18px solid ${C.amber}`, left: -90, top: 450, opacity: .9, transform: `rotate(${f * .6}deg) scale(${0.82 + f / 900})`, boxShadow: `0 0 70px ${C.amber}55, inset 0 0 80px ${C.amber}22`}} />
    <SceneTitle eyebrow="Investigation 01 / the physical limit">THE RACE<br />IS <span style={{color: C.amber}}>SILICON.</span></SceneTitle>
    <div style={{position: 'absolute', left: 64, bottom: 170, width: 820, color: C.paper, fontFamily: 'Georgia, serif', fontSize: 36, lineHeight: 1.18, opacity: interpolate(word, [0, 1], [0, 1]), transform: `translateY(${interpolate(word, [0, 1], [35, 0])}px)`}}>The AI boom is no longer limited by code. It is limited by matter.</div>
    <div style={{position: 'absolute', bottom: 86, left: 64, color: C.amber, fontFamily: 'monospace', fontWeight: 800, fontSize: 18, letterSpacing: 2}}>45 SECONDS / 7 PHYSICAL FRONTIERS</div>
  </EditorialFrame>;
};

const SceneTwo: React.FC = () => {
  const f = useCurrentFrame();
  const p = spring({frame: f - 18, fps: 30, config: {damping: 18, stiffness: 75}});
  return <EditorialFrame>
    <Img src={ASSETS.fab} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.08 + f / 1800})`, filter: 'grayscale(.62) contrast(1.35) brightness(.66) sepia(.18)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(9,11,16,.92), rgba(9,11,16,.22) 74%, rgba(9,11,16,.5))'}} />
    {[0, 1, 2, 3].map((i) => <div key={i} style={{position: 'absolute', height: 5, width: 1200, background: C.amber, top: 790 + i * 105, left: interpolate(p, [0, 1], [-1200, -120]) + i * 65, opacity: .85 - i * .15, transform: `rotate(-18deg)`, boxShadow: `0 0 30px ${C.amber}`}} />)}
    <SceneTitle eyebrow="Investigation 02 / extreme ultraviolet">THE FAB<br />BEHIND <span style={{color: C.amber}}>EVERYTHING.</span></SceneTitle>
    <div style={{position: 'absolute', left: 64, bottom: 148, width: 820, color: C.paper, fontFamily: 'Arial, sans-serif', fontSize: 34, fontWeight: 700, lineHeight: 1.15}}>At three nanometres, a billion-dollar machine is carving the future one atom-thin layer at a time.</div>
    <div style={{position: 'absolute', right: 62, bottom: 92, color: C.paper, fontFamily: 'monospace', fontSize: 18, letterSpacing: 2}}>EUV / ALIGNMENT / YIELD</div>
  </EditorialFrame>;
};

const SceneThree: React.FC = () => {
  const f = useCurrentFrame();
  const bars = [0.26, 0.52, 0.93];
  return <EditorialFrame>
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 60%, #263443 0%, #090b10 63%)'}} />
    <SceneTitle eyebrow="Investigation 03 / energy becomes compute">MORE.<br /><span style={{color: C.mint}}>PER WATT.</span></SceneTitle>
    <div style={{position: 'absolute', left: 65, right: 65, bottom: 165, height: 900, display: 'flex', alignItems: 'end', gap: 34, borderBottom: `6px solid ${C.paper}`}}>
      {bars.map((height, i) => { const q = clamp((f - 22 - i * 20) / 48); return <div key={i} style={{height: `${height * 100 * q}%`, flex: 1, background: i === 2 ? C.mint : i === 1 ? C.amber : C.rust, position: 'relative', boxShadow: `16px -16px 0 ${i === 2 ? '#2ea78d' : i === 1 ? '#ba8a35' : '#a43f29'}, 0 0 42px ${i === 2 ? C.mint : C.amber}88`}}>
        <div style={{position: 'absolute', bottom: '100%', left: 0, color: C.paper, fontFamily: 'Arial Black, Arial', fontSize: 58, whiteSpace: 'nowrap', transform: 'translateY(-22px)'}}>{[12, 68, 290][i]}</div>
        <div style={{position: 'absolute', top: '100%', left: 0, color: C.paper, fontFamily: 'monospace', fontSize: 20, marginTop: 22}}>{['2020', '2023', '2026'][i]}</div>
      </div>; })}
    </div>
    <div style={{position: 'absolute', right: 67, bottom: 91, color: C.mint, fontFamily: 'Arial Black, Arial', fontSize: 36}}>24× DENSITY</div>
  </EditorialFrame>;
};

const SceneFour: React.FC = () => {
  const f = useCurrentFrame();
  const dash = 2200 - f * 7;
  return <EditorialFrame>
    <Img src={ASSETS.earth} style={{width: '145%', height: '145%', objectFit: 'cover', transform: `translate(-22%, -9%) scale(${1 + f / 1400})`, filter: 'contrast(1.4) saturate(.75) brightness(.56)'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 10%, rgba(9,11,16,.86) 76%)'}} />
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <path d="M130 1170 C340 850, 585 970, 810 760" fill="none" stroke={C.amber} strokeWidth="11" strokeDasharray="28 20" strokeDashoffset={dash} opacity=".92" />
      <path d="M250 1420 C570 1170, 735 1230, 965 950" fill="none" stroke={C.mint} strokeWidth="9" strokeDasharray="18 24" strokeDashoffset={-dash} opacity=".86" />
      {[['130','1170'], ['810','760'], ['250','1420'], ['965','950']].map(([cx,cy],i) => <g key={i}><circle cx={cx} cy={cy} r={30 + Math.sin((f + i*12)/8)*8} fill="none" stroke={C.paper} strokeWidth="3" opacity=".8"/><circle cx={cx} cy={cy} r="12" fill={i%2?C.mint:C.amber}/></g>)}
    </svg>
    <SceneTitle eyebrow="Investigation 04 / a chain, not a country">THE <span style={{color: C.amber}}>CHIP</span><br />IS GLOBAL.</SceneTitle>
    <div style={{position: 'absolute', left: 65, bottom: 150, color: C.paper, fontFamily: 'Georgia, serif', fontSize: 34, width: 740, lineHeight: 1.2}}>A machine in Europe. A fab in Taiwan. Compute deployed across the world.</div>
    <div style={{position: 'absolute', right: 66, bottom: 90, color: C.mint, fontFamily: 'monospace', fontWeight: 800, letterSpacing: 2, fontSize: 18}}>OPTICAL SUPPLY CHAIN / LIVE</div>
  </EditorialFrame>;
};

const SceneFive: React.FC = () => {
  const f = useCurrentFrame();
  const spin = 4 + f / 20;
  return <EditorialFrame>
    <AbsoluteFill style={{background: '#10111a'}} />
    <div style={{position: 'absolute', left: -90, top: 425, width: 1260, height: 1050, background: 'linear-gradient(135deg, #202c3a, #10111a 50%, #273f42)', border: `12px solid ${C.amber}`, transform: `rotate(-${spin}deg)`, boxShadow: `0 0 100px ${C.amber}55`}}>
      {Array.from({length: 13}).map((_,i) => <div key={i} style={{position: 'absolute', left: 65 + i*84, top: 80 + (i%3)*150, width: 48, height: 740 - (i%4)*65, background: i%2 ? C.mint : C.amber, opacity: .65, boxShadow: `0 0 25px ${i%2 ? C.mint : C.amber}`}} />)}
      {Array.from({length: 10}).map((_,i) => <div key={`h${i}`} style={{position: 'absolute', top: 90 + i*92, left: 40, width: 1160, height: 9, background: '#d9f6e9', opacity: .2}} />)}
    </div>
    <SceneTitle eyebrow="Investigation 05 / architecture">NOT A CHIP.<br /><span style={{color: C.amber}}>A CITY</span> OF LOGIC.</SceneTitle>
    <div style={{position: 'absolute', bottom: 128, left: 66, color: C.paper, fontFamily: 'Arial Black, Arial', fontSize: 50, lineHeight: 1}}>3nm<br /><span style={{fontSize: 22, letterSpacing: 4, color: C.mint}}>TRANSISTOR TERRITORY</span></div>
  </EditorialFrame>;
};

const SceneSix: React.FC = () => {
  const f = useCurrentFrame();
  return <EditorialFrame>
    <Img src={ASSETS.engineer} style={{width: '118%', height: '118%', objectFit: 'cover', objectPosition: '51% 38%', transform: `translate(-9%, -3%) scale(${1 + f / 1100})`, filter: 'grayscale(.4) contrast(1.25) brightness(.65)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(9,11,16,.98), rgba(9,11,16,.04) 70%), linear-gradient(90deg, rgba(240,93,58,.45), transparent 55%)'}} />
    <div style={{position: 'absolute', width: 1650, height: 1650, borderRadius: '50%', border: `3px solid ${C.mint}`, left: -310, top: 450, opacity: .6, transform: `scale(${.75 + f/700})`}} />
    <SceneTitle eyebrow="Investigation 06 / human precision" right>THE <span style={{color: C.mint}}>FAB</span><br />HAS A FACE.</SceneTitle>
    <div style={{position: 'absolute', right: 64, bottom: 145, width: 765, textAlign: 'right', color: C.paper, fontFamily: 'Georgia, serif', fontSize: 34, lineHeight: 1.2}}>The final performance gain is earned inside a factory where every imperfection is fatal.</div>
  </EditorialFrame>;
};

const SceneSeven: React.FC = () => {
  const f = useCurrentFrame();
  const p = spring({frame: f - 18, fps: 30, config: {damping: 12, stiffness: 80}});
  return <EditorialFrame>
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #36423c 0%, #111117 40%, #090b10 75%)'}} />
    {Array.from({length: 24}).map((_,i) => <div key={i} style={{position: 'absolute', width: 4, height: 1800, left: 35 + i*48, top: 60, background: i%3===0?C.mint:C.amber, opacity: .18, transform: `rotate(${(i-12)*3}deg)`, transformOrigin: 'bottom'}} />)}
    <div style={{position: 'absolute', top: 360, width: '100%', textAlign: 'center', color: C.paper, fontFamily: 'Arial Black, Arial', fontSize: 360, letterSpacing: -28, lineHeight: .8, transform: `scale(${interpolate(p,[0,1],[.5,1])})`, textShadow: `0 0 70px ${C.amber}77`}}>100<span style={{fontSize: 220, color: C.amber}}>×</span></div>
    <div style={{position: 'absolute', top: 750, width: '100%', textAlign: 'center', color: C.paper, fontFamily: 'Arial Black, Arial', fontSize: 58, letterSpacing: -2, textTransform: 'uppercase'}}>More throughput<br />changes the frontier.</div>
    <div style={{position: 'absolute', bottom: 138, width: '100%', textAlign: 'center', color: C.mint, fontFamily: 'monospace', fontWeight: 800, fontSize: 20, letterSpacing: 3}}>THE PHYSICAL FOUNDATION OF THE NEXT ERA</div>
  </EditorialFrame>;
};

export const Phase6RevisedShowcase: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={180}><SceneOne /></Sequence>
    <Sequence from={180} durationInFrames={180}><SceneTwo /></Sequence>
    <Sequence from={360} durationInFrames={210}><SceneThree /></Sequence>
    <Sequence from={570} durationInFrames={210}><SceneFour /></Sequence>
    <Sequence from={780} durationInFrames={240}><SceneFive /></Sequence>
    <Sequence from={1020} durationInFrames={180}><SceneSix /></Sequence>
    <Sequence from={1200} durationInFrames={150}><SceneSeven /></Sequence>
  </AbsoluteFill>
);
