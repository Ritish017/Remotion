'use client';

import React, { useRef, useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import type { BrandDNA } from '@/lib/video-spec/types';

export interface ThreeDSceneProps {
  sceneType?: 'semiconductor' | 'neural-network' | 'fusion-reactor' | 'robotics-arm' | 'general-tech';
  headline?: string;
  subhead?: string;
  brand?: BrandDNA;
  durationInFrames: number;
}

// ── 1. 3D Semiconductor Wafer / Microchip Mesh ──────────────────────────────────
const Semiconductor3D: React.FC<{ frame: number; fps: number; brand?: BrandDNA }> = ({
  frame,
  fps,
  brand,
}) => {
  const accentColor = brand?.colors.accent || '#ffd166';
  const mintColor = brand?.colors.secondary || '#00c9a7';

  const rotY = interpolate(frame, [0, 180], [0, Math.PI * 1.5], {
    extrapolateRight: 'clamp',
  });
  const rotX = interpolate(frame, [0, 180], [0.35, 0.55], {
    extrapolateRight: 'clamp',
  });

  const glowIntensity = interpolate(
    Math.sin(frame / 10),
    [-1, 1],
    [0.6, 1.4]
  );

  return (
    <group rotation={[rotX, rotY, 0]} position={[0, 0, 0]}>
      {/* Silicon Substrate Base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4.2, 0.25, 4.2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Die Heat Spreader Core */}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[2.8, 0.15, 2.8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.1} metalness={0.95} />
      </mesh>

      {/* Photonic / Transistor Core Glow Die */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[1.6, 0.1, 1.6]} />
        <meshBasicMaterial color={accentColor} />
      </mesh>

      {/* Optical Bus Interconnect Traces */}
      {[-1.8, -0.9, 0, 0.9, 1.8].map((offset, i) => (
        <mesh key={`trace-x-${i}`} position={[offset, 0.14, 0]}>
          <boxGeometry args={[0.08, 0.05, 3.8]} />
          <meshBasicMaterial color={mintColor} />
        </mesh>
      ))}
      {[-1.8, -0.9, 0, 0.9, 1.8].map((offset, i) => (
        <mesh key={`trace-z-${i}`} position={[0, 0.14, offset]}>
          <boxGeometry args={[3.8, 0.05, 0.08]} />
          <meshBasicMaterial color={mintColor} />
        </mesh>
      ))}

      {/* Ambient Micro-Contact Bumps */}
      {[-1.2, 1.2].map((x) =>
        [-1.2, 1.2].map((z) => (
          <mesh key={`bump-${x}-${z}`} position={[x, 0.22, z]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={1.0} roughness={0.1} />
          </mesh>
        ))
      )}
    </group>
  );
};

// ── 2. 3D Neural Synaptic Particle Graph ─────────────────────────────────────────
const NeuralGraph3D: React.FC<{ frame: number; brand?: BrandDNA }> = ({ frame, brand }) => {
  const accentColor = brand?.colors.accent || '#ffd166';
  const mintColor = brand?.colors.secondary || '#00c9a7';

  const rotY = frame * 0.012;
  const rotX = Math.sin(frame * 0.008) * 0.25;

  const nodePositions = useMemo(() => {
    const nodes: Array<[number, number, number]> = [];
    const count = 32;
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const radius = 2.4 + (i % 3) * 0.4;
      nodes.push([
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi),
      ]);
    }
    return nodes;
  }, []);

  return (
    <group rotation={[rotX, rotY, 0]}>
      {nodePositions.map((pos, idx) => {
        const isFired = (frame + idx * 7) % 30 < 10;
        return (
          <mesh key={`node-${idx}`} position={pos}>
            <sphereGeometry args={[isFired ? 0.16 : 0.09, 12, 12]} />
            <meshBasicMaterial color={isFired ? accentColor : mintColor} />
          </mesh>
        );
      })}
      {/* Central High-Density Reasoning Core */}
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[0.7, 2]} />
        <meshStandardMaterial
          color="#38bdf8"
          wireframe
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
};

// ── 3. 3D Toroidal Fusion Reactor Plasma Mesh ────────────────────────────────────
const FusionReactor3D: React.FC<{ frame: number; brand?: BrandDNA }> = ({ frame, brand }) => {
  const accent = brand?.colors.primary || '#f0522a';
  const glow = brand?.colors.accent || '#ffd166';

  const rotY = frame * 0.02;
  const rotX = 0.65;

  return (
    <group rotation={[rotX, rotY, 0]}>
      {/* Outer Toroidal Magnetic Coil Shell */}
      <mesh>
        <torusGeometry args={[2.5, 0.7, 24, 60]} />
        <meshStandardMaterial
          color="#1e293b"
          wireframe
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Swirling High-Energy Core Plasma Ring */}
      <mesh rotation={[0, frame * 0.05, 0]}>
        <torusGeometry args={[2.5, 0.25, 16, 48]} />
        <meshBasicMaterial color={accent} />
      </mesh>

      {/* Inner Torus Laser Confinement Ring */}
      <mesh rotation={[frame * 0.04, 0, frame * 0.04]}>
        <torusGeometry args={[1.5, 0.08, 12, 36]} />
        <meshBasicMaterial color={glow} />
      </mesh>
    </group>
  );
};

// ── Main Three.js Scene Director Component ────────────────────────────────────────
export const ThreeDScene: React.FC<ThreeDSceneProps> = ({
  sceneType = 'semiconductor',
  headline,
  subhead,
  brand,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const cameraFov = 50;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#07090e]">
      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 pointer-events-none">
        <ThreeCanvas
          width={width}
          height={height}
          camera={{
            fov: cameraFov,
            position: [0, 0, 6.5],
            near: 0.1,
            far: 1000,
          }}
        >
          {/* Lighting Rig */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={1.5} color="#ffffff" />
          <pointLight position={[-4, -4, 2]} intensity={2.0} color={brand?.colors.secondary || '#00c9a7'} />
          <pointLight position={[4, 4, 3]} intensity={2.5} color={brand?.colors.accent || '#ffd166'} />

          {/* Model Dispatcher */}
          {sceneType === 'semiconductor' && <Semiconductor3D frame={frame} fps={fps} brand={brand} />}
          {sceneType === 'neural-network' && <NeuralGraph3D frame={frame} brand={brand} />}
          {sceneType === 'fusion-reactor' && <FusionReactor3D frame={frame} brand={brand} />}
          {sceneType === 'robotics-arm' && <Semiconductor3D frame={frame} fps={fps} brand={brand} />}
          {sceneType === 'general-tech' && <NeuralGraph3D frame={frame} brand={brand} />}
        </ThreeCanvas>
      </div>

      {/* Typography Overlay Header */}
      {headline && (
        <div className="absolute top-16 left-12 right-12 z-20 flex flex-col pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded font-mono text-[13px] tracking-widest text-slate-300 w-fit mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            3D SPATIAL TELEMETRY // MODEL ACTIVE
          </div>
          <h2
            className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight drop-shadow-2xl"
            style={{ fontFamily: brand?.typography.fontFamilyHeading || 'Inter, sans-serif' }}
          >
            {headline}
          </h2>
          {subhead && (
            <p className="mt-2 text-slate-300 font-mono text-base tracking-wide max-w-xl">
              {subhead}
            </p>
          )}
        </div>
      )}

      {/* Viewport Tech Coordinate Watermarks */}
      <div className="absolute bottom-12 left-12 right-12 z-20 flex justify-between items-end pointer-events-none font-mono text-xs text-slate-400">
        <div>
          <div>FOV: {cameraFov}° // AXIS: [XYZ_ROT]</div>
          <div className="text-slate-400 mt-1">SIM_FRAME: {frame} / {durationInFrames}</div>
        </div>
        <div className="text-right">
          <div className="text-emerald-400 font-bold">WEBGL_ACTIVE</div>
          <div className="text-slate-400">RENDER_LATENCY: 0.2ms</div>
        </div>
      </div>
    </div>
  );
};
