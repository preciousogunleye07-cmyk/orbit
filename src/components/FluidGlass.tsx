/* eslint-disable react/no-unknown-property */
import React, { useRef, useState, useEffect, memo, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import {
  useFBO,
  useGLTF,
  useScroll,
  Image,
  Scroll,
  Preload,
  ScrollControls,
  MeshTransmissionMaterial,
  Text
} from '@react-three/drei';
import { easing } from 'maath';

export interface NavItem {
  label: string;
  link: string;
}

export interface ModeProps {
  scale?: number;
  ior?: number;
  thickness?: number;
  anisotropy?: number;
  chromaticAberration?: number;
  transmission?: number;
  roughness?: number;
  color?: string;
  attenuationColor?: string;
  attenuationDistance?: number;
  [key: string]: any;
}

export interface FluidGlassProps {
  mode?: 'lens' | 'bar' | 'cube';
  lensProps?: ModeProps;
  barProps?: ModeProps & { navItems?: NavItem[] };
  cubeProps?: ModeProps;
}

export const FluidGlass: React.FC<FluidGlassProps> = ({
  mode = 'lens',
  lensProps = {},
  barProps = {},
  cubeProps = {}
}) => {
  const Wrapper = mode === 'bar' ? Bar : mode === 'cube' ? Cube : Lens;
  const rawOverrides = mode === 'bar' ? barProps : mode === 'cube' ? cubeProps : lensProps;

  const {
    navItems = [
      { label: 'Home', link: '#hero' },
      { label: 'Courses', link: '#courses' },
      { label: 'SIWES', link: '#siwes' },
      { label: 'Workspace', link: '#workspace' },
      { label: 'Quiz', link: '#quiz' }
    ],
    ...modeProps
  } = rawOverrides as any;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }}>
        <ScrollControls damping={0.2} pages={3} distance={0.4}>
          {mode === 'bar' && <NavItems items={navItems} />}
          <Wrapper modeProps={modeProps}>
            <Scroll>
              <Typography />
              <Images />
            </Scroll>
            <Scroll html />
            <Preload />
          </Wrapper>
        </ScrollControls>
      </Canvas>
    </div>
  );
};

interface ModeWrapperProps {
  children?: React.ReactNode;
  glb: string;
  geometryKey: string;
  lockToBottom?: boolean;
  followPointer?: boolean;
  modeProps?: ModeProps;
  fallbackType?: 'cylinder' | 'box';
  [key: string]: any;
}

const ModeWrapper = memo(function ModeWrapper({
  children,
  glb,
  geometryKey,
  lockToBottom = false,
  followPointer = true,
  modeProps = {},
  fallbackType = 'cylinder',
  ...props
}: ModeWrapperProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const buffer = useFBO();
  const { viewport: vp } = useThree();
  const [scene] = useState(() => new THREE.Scene());
  const geoWidthRef = useRef<number>(1);

  // Try loading GLTF, or use procedural fallback geometry if missing
  let loadedNodes: Record<string, any> | null = null;
  try {
    const gltf = useGLTF(glb);
    loadedNodes = gltf?.nodes || null;
  } catch (e) {
    // GLTF model not found or failed to load, fallback will be used
    loadedNodes = null;
  }

  const fallbackGeo = useMemo(() => {
    if (fallbackType === 'cylinder') {
      return new THREE.CylinderGeometry(1.5, 1.5, 0.4, 32);
    }
    return new THREE.BoxGeometry(3, 0.6, 0.4);
  }, [fallbackType]);

  const targetGeometry = useMemo(() => {
    if (loadedNodes && loadedNodes[geometryKey]?.geometry) {
      return loadedNodes[geometryKey].geometry;
    }
    return fallbackGeo;
  }, [loadedNodes, geometryKey, fallbackGeo]);

  useEffect(() => {
    if (targetGeometry) {
      targetGeometry.computeBoundingBox();
      if (targetGeometry.boundingBox) {
        geoWidthRef.current =
          targetGeometry.boundingBox.max.x - targetGeometry.boundingBox.min.x || 1;
      }
    }
  }, [targetGeometry]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const { gl, viewport, pointer, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    const destX = followPointer ? (pointer.x * v.width) / 2 : 0;
    const destY = lockToBottom
      ? -v.height / 2 + 0.2
      : followPointer
      ? (pointer.y * v.height) / 2
      : 0;
    easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);

    if (modeProps.scale == null) {
      const maxWorld = v.width * 0.9;
      const desired = maxWorld / geoWidthRef.current;
      ref.current.scale.setScalar(Math.min(0.15, desired));
    }

    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    // Background purple dark tint
    gl.setClearColor(0x100e17, 1);
  });

  const { scale, ior, thickness, anisotropy, chromaticAberration, ...extraMat } = modeProps;

  return (
    <>
      {createPortal(children, scene)}
      <mesh scale={[vp.width, vp.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} transparent />
      </mesh>
      <mesh
        ref={ref}
        scale={scale ?? 0.15}
        rotation-x={Math.PI / 2}
        geometry={targetGeometry}
        {...props}
      >
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={ior ?? 1.15}
          thickness={thickness ?? 5}
          anisotropy={anisotropy ?? 0.01}
          chromaticAberration={chromaticAberration ?? 0.1}
          {...(extraMat as any)}
        />
      </mesh>
    </>
  );
});

function Lens({ modeProps, ...p }: { modeProps?: ModeProps; [key: string]: any }) {
  return (
    <ModeWrapper
      glb="/assets/3d/lens.glb"
      geometryKey="Cylinder"
      fallbackType="cylinder"
      followPointer
      modeProps={modeProps}
      {...p}
    />
  );
}

function Cube({ modeProps, ...p }: { modeProps?: ModeProps; [key: string]: any }) {
  return (
    <ModeWrapper
      glb="/assets/3d/cube.glb"
      geometryKey="Cube"
      fallbackType="box"
      followPointer
      modeProps={modeProps}
      {...p}
    />
  );
}

function Bar({ modeProps = {}, ...p }: { modeProps?: ModeProps; [key: string]: any }) {
  const defaultMat = {
    transmission: 1,
    roughness: 0,
    thickness: 10,
    ior: 1.15,
    color: '#ffffff',
    attenuationColor: '#ffffff',
    attenuationDistance: 0.25
  };

  return (
    <ModeWrapper
      glb="/assets/3d/bar.glb"
      geometryKey="Cube"
      fallbackType="box"
      lockToBottom
      followPointer={false}
      modeProps={{ ...defaultMat, ...modeProps }}
      {...p}
    />
  );
}

function NavItems({ items }: { items: NavItem[] }) {
  const group = useRef<THREE.Group>(null!);
  const { viewport, camera } = useThree();

  const DEVICE = {
    mobile: { max: 639, spacing: 0.2, fontSize: 0.035 },
    tablet: { max: 1023, spacing: 0.24, fontSize: 0.035 },
    desktop: { max: Infinity, spacing: 0.3, fontSize: 0.035 }
  };
  const getDevice = () => {
    const w = window.innerWidth;
    return w <= DEVICE.mobile.max ? 'mobile' : w <= DEVICE.tablet.max ? 'tablet' : 'desktop';
  };

  const [device, setDevice] = useState(getDevice());

  useEffect(() => {
    const onResize = () => setDevice(getDevice());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { spacing, fontSize } = DEVICE[device as keyof typeof DEVICE];

  useFrame(() => {
    if (!group.current) return;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);
    group.current.position.set(0, -v.height / 2 + 0.2, 15.1);

    group.current.children.forEach((child, i) => {
      child.position.x = (i - (items.length - 1) / 2) * spacing;
    });
  });

  const handleNavigate = (link: string) => {
    if (!link) return;
    if (link.startsWith('#')) {
      const el = document.querySelector(link);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = link;
    }
  };

  return (
    <group ref={group} renderOrder={10}>
      {items.map(({ label, link }) => (
        <Text
          key={label}
          fontSize={fontSize}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0}
          outlineBlur="20%"
          outlineColor="#000"
          outlineOpacity={0.5}
          renderOrder={10}
          onClick={e => {
            e.stopPropagation();
            handleNavigate(link);
          }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          {label}
        </Text>
      ))}
    </group>
  );
}

function Images() {
  const group = useRef<THREE.Group>(null!);
  const data = useScroll();
  const { height } = useThree(s => s.viewport);

  useFrame(() => {
    if (!group.current || !group.current.children || group.current.children.length < 5) return;
    try {
      (group.current.children[0] as any).material.zoom = 1 + data.range(0, 1 / 3) / 3;
      (group.current.children[1] as any).material.zoom = 1 + data.range(0, 1 / 3) / 3;
      (group.current.children[2] as any).material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
      (group.current.children[3] as any).material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
      (group.current.children[4] as any).material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
    } catch (e) {
      // ignore material zoom frame updates if unmounted
    }
  });

  return (
    <group ref={group}>
      <Image position={[-2, 0, 0]} scale={[3, height / 1.1]} url="https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80" />
      <Image position={[2, 0, 3]} scale={[3, 3]} url="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80" />
      <Image position={[-2.05, -height, 6]} scale={[1, 3]} url="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80" />
      <Image position={[-0.6, -height, 9]} scale={[1, 2]} url="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80" />
      <Image position={[0.75, -height, 10.5]} scale={[1.5, 1.5]} url="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80" />
    </group>
  );
}

function Typography() {
  const DEVICE = {
    mobile: { fontSize: 0.2 },
    tablet: { fontSize: 0.4 },
    desktop: { fontSize: 0.6 }
  };
  const getDevice = () => {
    const w = window.innerWidth;
    return w <= 639 ? 'mobile' : w <= 1023 ? 'tablet' : 'desktop';
  };

  const [device, setDevice] = useState(getDevice());

  useEffect(() => {
    const onResize = () => setDevice(getDevice());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { fontSize } = DEVICE[device as keyof typeof DEVICE];

  return (
    <Text
      position={[0, 0, 12]}
      fontSize={fontSize}
      letterSpacing={-0.05}
      outlineWidth={0}
      outlineBlur="20%"
      outlineColor="#000"
      outlineOpacity={0.5}
      color="white"
      anchorX="center"
      anchorY="middle"
    >
      Orbit Space Tech
    </Text>
  );
}

export default FluidGlass;
