import { useEffect, useRef } from 'react'

// Dynamically load Three.js from CDN and render a 3D hero scene
export default function ThreeHero({ style }) {
  const mountRef = useRef(null)
  const cleanupRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current) return

    let THREE, renderer, scene, camera, animId

    const init = (T) => {
      THREE = T
      const el = mountRef.current
      const W = el.clientWidth, H = el.clientHeight

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(W, H)
      renderer.setClearColor(0x000000, 0)
      el.appendChild(renderer.domElement)

      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200)
      camera.position.set(0, 0, 22)

      /* ── Ambient + directional light ── */
      scene.add(new THREE.AmbientLight(0xc8e840, 0.35))
      const sun = new THREE.DirectionalLight(0xe8f8a0, 1.2)
      sun.position.set(8, 12, 10)
      scene.add(sun)
      const rim = new THREE.DirectionalLight(0x203020, 0.7)
      rim.position.set(-10, -6, -8)
      scene.add(rim)

      /* ── Central floating sphere (earth/planet) ── */
      const earthGeo = new THREE.SphereGeometry(4.5, 64, 64)
      const earthMat = new THREE.MeshStandardMaterial({
        color: 0x1a2e0e,
        roughness: 0.75,
        metalness: 0.08,
        wireframe: false,
      })
      const earth = new THREE.Mesh(earthGeo, earthMat)
      scene.add(earth)

      /* ── Wireframe overlay ── */
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x4caf64,
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      })
      const wire = new THREE.Mesh(new THREE.SphereGeometry(4.52, 24, 24), wireMat)
      scene.add(wire)

      /* ── Ring ── */
      const ringGeo = new THREE.TorusGeometry(6.2, 0.08, 8, 120)
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xc8e840, transparent: true, opacity: 0.45 })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = Math.PI * 0.42
      scene.add(ring)

      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(7.8, 0.04, 8, 120),
        new THREE.MeshBasicMaterial({ color: 0xa0ba30, transparent: true, opacity: 0.2 })
      )
      ring2.rotation.x = Math.PI * 0.35
      ring2.rotation.y = 0.6
      scene.add(ring2)

      /* ── Orbiting produce nodes ── */
      const nodeData = [
        { emoji: null, color: 0xc8e840, size: 0.55, r: 7.2, speed: 0.38, phase: 0,    tilt: 0.42 },
        { emoji: null, color: 0xe8a020, size: 0.45, r: 8.6, speed: 0.26, phase: 1.8,  tilt: 0.55 },
        { emoji: null, color: 0x4caf64, size: 0.6,  r: 6.5, speed: 0.48, phase: 3.4,  tilt: 0.3  },
        { emoji: null, color: 0xd04030, size: 0.38, r: 9.1, speed: 0.21, phase: 5.0,  tilt: 0.65 },
        { emoji: null, color: 0xc8e840, size: 0.5,  r: 7.8, speed: 0.34, phase: 2.2,  tilt: 0.48 },
        { emoji: null, color: 0xa0d878, size: 0.42, r: 8.0, speed: 0.44, phase: 4.1,  tilt: 0.38 },
        { emoji: null, color: 0xe8a020, size: 0.58, r: 6.8, speed: 0.29, phase: 0.8,  tilt: 0.6  },
        { emoji: null, color: 0xf0e060, size: 0.4,  r: 9.5, speed: 0.18, phase: 3.0,  tilt: 0.72 },
      ]

      const nodes = nodeData.map(d => {
        const geo = new THREE.SphereGeometry(d.size, 20, 20)
        const mat = new THREE.MeshStandardMaterial({
          color: d.color, roughness: 0.5, metalness: 0.15,
          emissive: d.color, emissiveIntensity: 0.15,
        })
        const mesh = new THREE.Mesh(geo, mat)
        scene.add(mesh)
        return { mesh, ...d, angle: d.phase }
      })

      /* ── Particle field ── */
      const pCount = 420
      const pPositions = new Float32Array(pCount * 3)
      for (let i = 0; i < pCount; i++) {
        const r = 10 + Math.random() * 22
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        pPositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
        pPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
        pPositions[i * 3 + 2] = r * Math.cos(phi)
      }
      const pGeo = new THREE.BufferGeometry()
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3))
      const pMat = new THREE.PointsMaterial({ color: 0xc8e840, size: 0.06, transparent: true, opacity: 0.5 })
      const particles = new THREE.Points(pGeo, pMat)
      scene.add(particles)

      /* ── Mouse parallax ── */
      let mx = 0, my = 0
      const onMouse = e => {
        mx = (e.clientX / window.innerWidth  - 0.5) * 2
        my = (e.clientY / window.innerHeight - 0.5) * 2
      }
      window.addEventListener('mousemove', onMouse)

      /* ── Resize ── */
      const onResize = () => {
        if (!mountRef.current) return
        const W2 = mountRef.current.clientWidth, H2 = mountRef.current.clientHeight
        renderer.setSize(W2, H2)
        camera.aspect = W2 / H2
        camera.updateProjectionMatrix()
      }
      window.addEventListener('resize', onResize)

      /* ── Animation ── */
      let t = 0
      const animate = () => {
        animId = requestAnimationFrame(animate)
        t += 0.008

        // Earth slow spin
        earth.rotation.y = t * 0.15
        wire.rotation.y = t * 0.18

        // Ring wobble
        ring.rotation.z = Math.sin(t * 0.4) * 0.04
        ring2.rotation.z = Math.sin(t * 0.3 + 1) * 0.04

        // Orbit nodes
        nodes.forEach(n => {
          n.angle += n.speed * 0.012
          const x = Math.cos(n.angle) * n.r
          const z = Math.sin(n.angle) * n.r
          const y = Math.sin(n.angle * 0.5 + n.phase) * n.r * Math.tan(n.tilt) * 0.3
          n.mesh.position.set(x, y, z)
          n.mesh.rotation.y += 0.02
          n.mesh.scale.setScalar(1 + Math.sin(t * 1.5 + n.phase) * 0.06)
        })

        // Particles slow drift
        particles.rotation.y = t * 0.018
        particles.rotation.x = t * 0.009

        // Camera parallax
        camera.position.x += (mx * 1.8 - camera.position.x) * 0.03
        camera.position.y += (-my * 1.2 - camera.position.y) * 0.03
        camera.lookAt(0, 0, 0)

        renderer.render(scene, camera)
      }
      animate()

      cleanupRef.current = () => {
        cancelAnimationFrame(animId)
        window.removeEventListener('mousemove', onMouse)
        window.removeEventListener('resize', onResize)
        renderer.dispose()
        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
      }
    }

    // Load Three.js from CDN
    if (window.THREE) {
      init(window.THREE)
    } else {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
      script.onload = () => init(window.THREE)
      document.head.appendChild(script)
    }

    return () => cleanupRef.current?.()
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none',
        ...style,
      }}
    />
  )
}
