// FILE LOCATION: components/universe/UniverseScene.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import * as THREE from 'three'
import { getDailyTagline } from '@/lib/taglines'

const PLANETS = [
    { id: 'habits', label: 'HABITS', icon: '⭐', angle: 0, radius: 220, color: '#f5a623', route: '/habits' },
    { id: 'todos', label: 'TODOS', icon: '🪐', angle: 72, radius: 320, color: '#00d4aa', route: '/todos' },
    { id: 'calendar', label: 'CALENDAR', icon: '🌙', angle: 144, radius: 260, color: '#8888ff', route: '/calendar' },
    { id: 'journal', label: 'JOURNAL', icon: '🌫️', angle: 216, radius: 350, color: '#7b2d8b', route: '/journal' },
    { id: 'links', label: 'LINKS', icon: '🔵', angle: 288, radius: 290, color: '#4444ff', route: '/links' },
]

export default function UniverseScene() {
    const mountRef = useRef<HTMLDivElement>(null)
    const hoveredRef = useRef<string | null>(null)
    const routerRef = useRef<ReturnType<typeof useRouter>>(null)
    const router = useRouter()

    useEffect(() => {
        routerRef.current = router
    }, [router])

    useEffect(() => {
        if (!mountRef.current) return
        const mount = mountRef.current
        const w = window.innerWidth
        const h = window.innerHeight

        // Scene setup
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 2000)
        camera.position.set(0, 0, 600)

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(w, h)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setClearColor(0x05050f, 1)
        mount.appendChild(renderer.domElement)

        // Stars
        const starGeo = new THREE.BufferGeometry()
        const starCount = 3000
        const positions = new Float32Array(starCount * 3)
        for (let i = 0; i < starCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 3000
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1, transparent: true, opacity: 0.7 })
        const stars = new THREE.Points(starGeo, starMat)
        scene.add(stars)

        // Black hole — layered rings
        const blackHoleGroup = new THREE.Group()
        scene.add(blackHoleGroup)

        // Core dark disk
        const coreGeo = new THREE.CircleGeometry(48, 64)
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide })
        const core = new THREE.Mesh(coreGeo, coreMat)
        blackHoleGroup.add(core)

        // Accretion disk rings
        const ringColors = [0xf5a623, 0xff8800, 0xffaa33, 0xcc5500]
        const ringData = [
            { inner: 50, outer: 70 },
            { inner: 72, outer: 88 },
            { inner: 90, outer: 100 },
            { inner: 102, outer: 108 },
        ]
        ringData.forEach((r, i) => {
            const geo = new THREE.RingGeometry(r.inner, r.outer, 64)
            const mat = new THREE.MeshBasicMaterial({
                color: ringColors[i],
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8 - i * 0.15,
            })
            const ring = new THREE.Mesh(geo, mat)
            ring.rotation.x = Math.PI * 0.15
            blackHoleGroup.add(ring)
        })

        // Planets
        const planetMeshes: THREE.Mesh[] = []
        const planetData = PLANETS.map((p) => {
            const geo = new THREE.SphereGeometry(18, 32, 32)
            const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(p.color) })
            const mesh = new THREE.Mesh(geo, mat)
            mesh.userData = { id: p.id, route: p.route, label: p.label }

            const rad = (p.angle * Math.PI) / 180
            mesh.position.x = Math.cos(rad) * p.radius
            mesh.position.y = Math.sin(rad) * p.radius * 0.4
            mesh.position.z = Math.sin(rad) * p.radius * 0.1

            scene.add(mesh)
            planetMeshes.push(mesh)
            return { mesh, ...p }
        })

        // Raycaster for click/hover
        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2()

        const onMouseMove = (e: MouseEvent) => {
            mouse.x = (e.clientX / w) * 2 - 1
            mouse.y = -(e.clientY / h) * 2 + 1
            raycaster.setFromCamera(mouse, camera)
            const intersects = raycaster.intersectObjects(planetMeshes)
            if (intersects.length > 0) {
                hoveredRef.current = intersects[0].object.userData.id
                mount.style.cursor = 'pointer'
            } else {
                hoveredRef.current = null
                mount.style.cursor = 'default'
            }
        }

        const onClick = (e: MouseEvent) => {
            mouse.x = (e.clientX / w) * 2 - 1
            mouse.y = -(e.clientY / h) * 2 + 1
            raycaster.setFromCamera(mouse, camera)
            const intersects = raycaster.intersectObjects(planetMeshes)
            if (intersects.length > 0) {
                const route = intersects[0].object.userData.route
                routerRef.current?.push(route)
            }
        }

        mount.addEventListener('mousemove', onMouseMove)
        mount.addEventListener('click', onClick)

        // HTML labels overlay — we'll do these as DOM elements
        // positioned using Three.js project
        const labelContainer = document.createElement('div')
        labelContainer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;'
        mount.appendChild(labelContainer)

        const labelEls = planetData.map((p) => {
            const el = document.createElement('div')
            el.style.cssText = `
        position:absolute;
        transform:translate(-50%,-50%);
        font-family:var(--font-display);
        font-size:9px;
        letter-spacing:0.3em;
        text-transform:uppercase;
        color:${p.color};
        opacity:0.7;
        pointer-events:none;
        white-space:nowrap;
        text-shadow:0 0 10px ${p.color};
      `
            el.textContent = p.label
            labelContainer.appendChild(el)
            return el
        })

        // Animation
        let frame = 0
        let time = 0

        const animate = () => {
            frame = requestAnimationFrame(animate)
            time += 0.005

            // Rotate star field slowly
            stars.rotation.y = time * 0.02
            stars.rotation.x = time * 0.005

            // Rotate black hole rings
            blackHoleGroup.rotation.z = time * 0.3

            // Slow camera drift
            camera.position.x = Math.sin(time * 0.1) * 20
            camera.position.y = Math.cos(time * 0.08) * 10
            camera.lookAt(0, 0, 0)

            // Pulse planets
            planetMeshes.forEach((mesh, i) => {
                const isHovered = hoveredRef.current === mesh.userData.id
                const scale = isHovered
                    ? 1.3 + Math.sin(time * 4) * 0.05
                    : 1 + Math.sin(time * 1.5 + i) * 0.05
                mesh.scale.setScalar(scale)
                mesh.rotation.y = time * (0.5 + i * 0.1)
            })

            // Update label positions
            const tempV = new THREE.Vector3()
            planetData.forEach((p, i) => {
                tempV.copy(p.mesh.position)
                tempV.project(camera)
                const x = (tempV.x * 0.5 + 0.5) * w
                const y = (-tempV.y * 0.5 + 0.5) * h
                labelEls[i].style.left = x + 'px'
                labelEls[i].style.top = (y + 30) + 'px'
                labelEls[i].style.opacity = hoveredRef.current === p.id ? '1' : '0.6'
            })

            renderer.render(scene, camera)
        }
        animate()

        // Resize
        const onResize = () => {
            const nw = window.innerWidth
            const nh = window.innerHeight
            camera.aspect = nw / nh
            camera.updateProjectionMatrix()
            renderer.setSize(nw, nh)
        }
        window.addEventListener('resize', onResize)

        return () => {
            cancelAnimationFrame(frame)
            mount.removeEventListener('mousemove', onMouseMove)
            mount.removeEventListener('click', onClick)
            window.removeEventListener('resize', onResize)
            renderer.dispose()
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
            if (mount.contains(labelContainer)) mount.removeChild(labelContainer)
        }
    }, [])

    return (
        <div className="relative w-full h-screen overflow-hidden" style={{ background: '#05050f' }}>
            <div ref={mountRef} className="absolute inset-0" />

            {/* NURE Title */}
            <div className="absolute top-0 left-0 right-0 flex flex-col items-center pt-12 pointer-events-none z-10">
                <h1
                    className="text-5xl font-black tracking-[0.4em]"
                    style={{
                        fontFamily: 'var(--font-display)',
                        color: '#f5a623',
                        textShadow: '0 0 40px rgba(245,166,35,0.5), 0 0 100px rgba(245,166,35,0.2)',
                    }}
                >
                    NURE
                </h1>
                <p
                    className="mt-3 text-xs tracking-[0.5em] uppercase"
                    style={{ color: '#8888aa', fontFamily: 'var(--font-body)' }}
                >
                    {getDailyTagline()}
                </p>
            </div>

            {/* Date */}
            <div
                className="absolute bottom-8 left-8 text-xs tracking-widest uppercase pointer-events-none"
                style={{ color: '#8888aa', fontFamily: 'var(--font-display)', opacity: 0.5 }}
            >
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>

            {/* Hint */}
            <div
                className="absolute bottom-8 right-8 text-xs tracking-widest pointer-events-none"
                style={{ color: '#8888aa', fontFamily: 'var(--font-body)', opacity: 0.4 }}
            >
                click a planet to enter
            </div>
        </div>
    )
}