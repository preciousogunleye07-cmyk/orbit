/* eslint-disable react/no-unknown-property */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useTexture, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';
import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });

// 1x1 transparent pixel fallback
const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// UV rects for front and back faces
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 1.0 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 1.0 };

// Helper to draw the official Orbit logo on a 2D canvas context
function drawOrbitLogoOnCanvas(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number = 1, color: string = '#b583bf') {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';

  // Planet circle
  ctx.beginPath();
  ctx.arc(0, 0, 36, 0, Math.PI * 2);
  ctx.stroke();

  // Orbital ring
  ctx.beginPath();
  ctx.ellipse(0, 0, 65, 22, -Math.PI / 6, 0, Math.PI * 2);
  ctx.stroke();

  // .edu .space node
  ctx.fillStyle = '#141313';
  ctx.beginPath();
  ctx.arc(-26, -26, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.font = 'bold 7px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('.edu', -26, -28);
  ctx.fillText('.space', -26, -20);

  // oRbit text
  ctx.fillStyle = color;
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('oRbit', 0, 4);

  ctx.restore();
}

// Create a high-res default Orbit Space ID Card texture canvas
function createDefaultCardCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background gradient for whole atlas
  ctx.fillStyle = '#0f0a1c';
  ctx.fillRect(0, 0, 1024, 1024);

  // Divider line down center
  ctx.strokeStyle = '#332d47';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(512, 0);
  ctx.lineTo(512, 1024);
  ctx.stroke();

  // Draw FRONT (0..512, 0..1024)
  const drawCardFront = (x: number, y: number, w: number, h: number) => {
    ctx.save();
    ctx.translate(x, y);

    // Card background
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#1c1532');
    grad.addColorStop(0.5, '#130d24');
    grad.addColorStop(1, '#090514');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Purple accent glow top
    const glow = ctx.createRadialGradient(w / 2, 150, 20, w / 2, 150, 300);
    glow.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
    glow.addColorStop(1, 'rgba(168, 85, 247, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Border
    ctx.strokeStyle = '#3d325c';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, w - 12, h - 12);

    // Header logo area
    drawOrbitLogoOnCanvas(ctx, w / 2, 85, 1.1, '#c084fc');

    ctx.fillStyle = '#c4c7c8';
    ctx.font = '600 16px monospace';
    ctx.fillText('TECH ACADEMY • ILORIN', w / 2, 150);

    // Chip / Hologram box
    ctx.fillStyle = '#d97706';
    ctx.fillRect(60, 190, 80, 60);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 190, 80, 60);

    // Photo placeholder avatar
    ctx.fillStyle = '#261f3d';
    ctx.beginPath();
    ctx.arc(w / 2, 340, 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 6;
    ctx.stroke();

    // User icon inside photo
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(w / 2, 310, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w / 2, 400, 60, Math.PI, 0);
    ctx.fill();

    // Student Info
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('TECH INNOVATOR', w / 2, 480);

    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('ID: OS-2026-8842', w / 2, 520);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('● VERIFIED ACADEMY MEMBER', w / 2, 560);

    // Barcode at bottom
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(80, 640, w - 160, 80);
    ctx.fillStyle = '#000000';
    for (let i = 100; i < w - 100; i += 12) {
      const bw = (i % 5 === 0) ? 6 : 3;
      ctx.fillRect(i, 650, bw, 60);
    }

    ctx.restore();
  };

  // Draw BACK (512..1024, 0..1024)
  const drawCardBack = (x: number, y: number, w: number, h: number) => {
    ctx.save();
    ctx.translate(x, y);

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#130d24');
    grad.addColorStop(1, '#1c1532');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#3d325c';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, w - 12, h - 12);

    drawOrbitLogoOnCanvas(ctx, w / 2, 90, 1.0, '#c084fc');

    ctx.fillStyle = '#c4c7c8';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Fate Rd / Univ Way, Ilorin, Kwara', w / 2, 170);

    // Terms box
    ctx.fillStyle = '#1c182e';
    ctx.fillRect(40, 220, w - 80, 280);
    ctx.strokeStyle = '#332d47';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 220, w - 80, 280);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.fillText('This pass grants 24/7 access to', w / 2, 270);
    ctx.fillText('Orbit Space Tech Academy & Coworking.', w / 2, 300);
    ctx.fillText('Non-transferable. Property of Orbit Space.', w / 2, 330);
    ctx.fillText('If found, return to Ilorin Campus.', w / 2, 360);

    // QR Code Box placeholder
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(w / 2 - 70, 560, 140, 140);
    ctx.fillStyle = '#000000';
    ctx.fillRect(w / 2 - 50, 580, 40, 40);
    ctx.fillRect(w / 2 + 10, 580, 40, 40);
    ctx.fillRect(w / 2 - 50, 640, 40, 40);
    ctx.fillRect(w / 2 - 10, 610, 20, 20);

    ctx.restore();
  };

  drawCardFront(0, 0, 512, 1024);
  drawCardBack(512, 0, 512, 1024);

  return canvas;
}

// Create default strap texture
function createDefaultLanyardCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, '#630fd4');
  grad.addColorStop(0.5, '#a855f7');
  grad.addColorStop(1, '#630fd4');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 64);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★ ORBIT SPACE • TECH ACADEMY ILORIN ★', 256, 32);

  return canvas;
}

export interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: 'cover' | 'contain';
  lanyardImage?: string | null;
  lanyardWidth?: number;
}

export function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            isMobile={isMobile}
            frontImage={frontImage}
            backImage={backImage}
            imageFit={imageFit}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: 'cover' | 'contain';
  lanyardImage?: string | null;
  lanyardWidth?: number;
}

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1
}: BandProps) {
  const band = useRef<any>(null);
  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);
  const card = useRef<any>(null);

  const vec = useMemo(() => new THREE.Vector3(), []);
  const ang = useMemo(() => new THREE.Vector3(), []);
  const rot = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);

  const segmentProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4
  };

  // Generate procedural default card & strap textures
  const defaultCardTex = useMemo(() => {
    const canvas = createDefaultCardCanvas();
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return tex;
  }, []);

  const defaultStrapTex = useMemo(() => {
    const canvas = createDefaultLanyardCanvas();
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  }, []);

  const frontTex = useTexture(frontImage || BLANK_PIXEL);
  const backTex = useTexture(backImage || BLANK_PIXEL);
  const customLanyardTex = useTexture(lanyardImage || BLANK_PIXEL);

  // Composite texture if front/back images are supplied
  const cardMap = useMemo(() => {
    if (!frontImage && !backImage) return defaultCardTex;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return defaultCardTex;

    ctx.drawImage(defaultCardTex.image, 0, 0, 1024, 1024);

    const drawFitted = (img: HTMLImageElement, rect: typeof FRONT_UV_RECT) => {
      const rx = rect.x * 1024;
      const ry = rect.y * 1024;
      const rw = rect.w * 1024;
      const rh = rect.h * 1024;
      const pick = imageFit === 'contain' ? Math.min : Math.max;
      const scale = pick(rw / img.width, rh / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = rx + (rw - dw) / 2;
      const dy = ry + (rh - dh) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    };

    if (frontImage && frontTex.image) drawFitted(frontTex.image as any, FRONT_UV_RECT);
    if (backImage && backTex.image) drawFitted(backTex.image as any, BACK_UV_RECT);

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [frontImage, backImage, imageFit, frontTex, backTex, defaultCardTex]);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3()
      ])
  );
  const [dragged, drag] = useState<THREE.Vector3 | false>(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.5, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => {
        document.body.style.cursor = 'auto';
      };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref: any) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z
      });
    }
    if (fixed.current) {
      [j1, j2].forEach((ref: any) => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(ref.current.translation()))
        );
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      if (band.current?.geometry) {
        band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      }
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';

  const activeStrapTex = lanyardImage ? customLanyardTex : defaultStrapTex;
  activeStrapTex.wrapS = THREE.RepeatWrapping;
  activeStrapTex.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 5.0, 0]}>
        <RigidBody ref={fixed} {...(segmentProps as any)} type="fixed" />
        <RigidBody position={[0, -0.6, 0]} ref={j1} {...(segmentProps as any)}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0, -1.2, 0]} ref={j2} {...(segmentProps as any)}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0, -1.8, 0]} ref={j3} {...(segmentProps as any)}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[0, -2.4, 0]}
          ref={card}
          {...(segmentProps as any)}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: any) => {
              e.target.releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={(e: any) => {
              e.target.setPointerCapture(e.pointerId);
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}
          >
            {/* ID Pass Card Box */}
            <mesh>
              <boxGeometry args={[0.7, 1.0, 0.02]} />
              <meshPhysicalMaterial
                map={cardMap}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.8}
                metalness={0.2}
              />
            </mesh>

            {/* Metallic top clip & ring */}
            <mesh position={[0, 0.52, 0]}>
              <boxGeometry args={[0.2, 0.08, 0.04]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.58, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.06, 0.015, 12, 24]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
            </mesh>
          </group>
        </RigidBody>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={activeStrapTex}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}

export default Lanyard;
