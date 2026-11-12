"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export function LiquidOrbScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / (container.clientHeight || 380), 0.1, 100);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight || 380);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(1.55, 5);
    const positionAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const basePositions = new Float32Array(positionAttr.array as Float32Array);

    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#0f172a"),
      emissive: new THREE.Color("#1d4ed8"),
      emissiveIntensity: 0.35,
      roughness: 0.12,
      metalness: 0.2,
      transmission: 0.6,
      thickness: 1.2,
    });
    const orb = new THREE.Mesh(geometry, material);
    scene.add(orb);

    const wireGeo = new THREE.IcosahedronGeometry(1.75, 2);
    const wireMat = new THREE.MeshBasicMaterial({ color: "#38bdf8", wireframe: true, transparent: true, opacity: 0.22 });
    const cage = new THREE.Mesh(wireGeo, wireMat);
    scene.add(cage);

    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(180 * 3);
    for (let i = 0; i < pPos.length; i++) pPos[i] = (Math.random() - 0.5) * 9;
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: "#a855f7", size: 0.035, transparent: true, opacity: 0.7 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    const l1 = new THREE.PointLight("#38bdf8", 18, 20); l1.position.set(3, 3, 4);
    const l2 = new THREE.PointLight("#a855f7", 18, 20); l2.position.set(-3, -2, 3);
    scene.add(l1, l2, new THREE.AmbientLight("#ffffff", 0.5));

    let mx = 0, my = 0;
    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 0.6;
      my = (e.clientY / window.innerHeight - 0.5) * 0.6;
    };
    const onResize = () => {
      if (!container) return;
      const h = container.clientHeight || 380;
      camera.aspect = container.clientWidth / h;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, h);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let fid = 0;
    const animate = () => {
      fid = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      for (let i = 0; i < positionAttr.count; i++) {
        const ix = i * 3;
        const bx = basePositions[ix], by = basePositions[ix + 1], bz = basePositions[ix + 2];
        const wave = 1 + 0.085 * Math.sin(bx * 2.2 + t * 1.4) * Math.cos(by * 2.2 + t * 1.2);
        positionAttr.setXYZ(i, bx * wave, by * wave, bz * wave);
      }
      positionAttr.needsUpdate = true;
      geometry.computeVertexNormals();
      orb.rotation.y += 0.004;
      orb.rotation.x += (my * 0.4 - orb.rotation.x) * 0.04;
      orb.rotation.z += (mx * 0.4 - orb.rotation.z) * 0.04;
      cage.rotation.y -= 0.0025;
      particles.rotation.y = t * 0.04;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(fid);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      geometry.dispose(); material.dispose(); wireGeo.dispose(); wireMat.dispose(); pGeo.dispose(); pMat.dispose(); renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full min-h-[340px]" />;
}
