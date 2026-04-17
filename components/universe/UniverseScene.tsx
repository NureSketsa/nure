// FILE LOCATION: components/universe/UniverseScene.tsx

'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as THREE from 'three'
import { getDailyTagline } from '@/lib/taglines'

const PLANETS = [
    { id: 'habits', label: 'HABITS', prefix: 'Ha', planet: '⭐', suffix: 'its', angle: 0, radius: 220, color: '#f5a623', route: '/habits' },
    { id: 'todos', label: 'TODOS', prefix: 'To', planet: '🪐', suffix: 'ist', angle: 72, radius: 320, color: '#00d4aa', route: '/todos' },
    { id: 'calendar', label: 'CALENDAR', prefix: 'Ca', planet: '🌙', suffix: 'ndar', angle: 144, radius: 260, color: '#8888ff', route: '/calendar' },
    { id: 'journal', label: 'JOURNAL', prefix: 'Jo', planet: '🌫️', suffix: 'rnal', angle: 216, radius: 350, color: '#7b2d8b', route: '/journal' },
    { id: 'links', label: 'LINKS', prefix: 'Li', planet: '🔵', suffix: 'ks', angle: 288, radius: 290, color: '#4444ff', route: '/links' },
]

type ZoomState = 'idle' | 'zooming' | 'title' | 'fading'

export default function UniverseScene() {
    const mountRef = useRef<HTMLDivElement>(null)
    const hoveredRef = useRef<string | null>(null)
    const router = useRouter()
    const routerRef = useRef(router)

    const [zoomState, setZoomState] = useState<ZoomState>('idle')
    const [targetPlanet, setTargetPlanet] = useState<typeof PLANETS[0] | null>(null)
    const [titleOpacity, setTitleOpacity] = useState(0)

    useEffect(() => { routerRef.current = router }, [router])

    // After zoom completes → show title for 5s → navigate
    useEffect(() => {
        if (zoomState !== 'title' || !targetPlanet) return
        const fadeIn = setTimeout(() => setTitleOpacity(1), 50)
        const navigate = setTimeout(() => {
            setZoomState('fading')
            setTitleOpacity(0)
            setTimeout(() => routerRef.current.push(targetPlanet.route), 800)
        }, 5000)
        return () => { clearTimeout(fadeIn); clearTimeout(navigate) }
    }, [zoomState, targetPlanet])

    useEffect(() => {
        if (!mountRef.current) return
        const mount = mountRef.current
        const w = window.innerWidth
        const h = window.innerHeight

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
        const pos = new Float32Array(starCount * 3)
        for (let i = 0; i < starCount * 3; i++) pos[i] = (Math.random() - 0.5) * 3000
        starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
        const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1, transparent: true, opacity: 0.7 }))
        scene.add(stars)

        // Black hole
        const bhGroup = new THREE.Group()
        scene.add(bhGroup)
        bhGroup.add(new THREE.Mesh(new THREE.CircleGeometry(48, 64), new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide })))
            ;[
                { inner: 50, outer: 70, color: 0xf5a623, op: 0.8 },
                { inner: 72, outer: 88, color: 0xff8800, op: 0.65 },
                { inner: 90, outer: 100, color: 0xffaa33, op: 0.5 },
                { inner: 102, outer: 108, color: 0xcc5500, op: 0.35 },
            ].forEach(r => {
                const ring = new THREE.Mesh(new THREE.RingGeometry(r.inner, r.outer, 64), new THREE.MeshBasicMaterial({ color: r.color, side: THREE.DoubleSide, transparent: true, opacity: r.op }))
                ring.rotation.x = Math.PI * 0.15
                bhGroup.add(ring)
            })

        // Planets
        const planetMeshes: THREE.Mesh[] = []
        const planetData = PLANETS.map((p) => {
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(18, 32, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(p.color) }))
            mesh.userData = { id: p.id }
            const rad = (p.angle * Math.PI) / 180
            mesh.position.set(Math.cos(rad) * p.radius, Math.sin(rad) * p.radius * 0.4, Math.sin(rad) * p.radius * 0.1)
            scene.add(mesh)
            planetMeshes.push(mesh)
            return { mesh, ...p }
        })

        // DOM labels
        const labelContainer = document.createElement('div')
        labelContainer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;'
        mount.appendChild(labelContainer)
        const labelEls = planetData.map((p) => {
            const el = document.createElement('div')
            el.style.cssText = `position:absolute;transform:translate(-50%,-50%);font-family:var(--font-display);font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:${p.color};opacity:0.7;pointer-events:none;white-space:nowrap;text-shadow:0 0 10px ${p.color};`
            el.textContent = p.label
            labelContainer.appendChild(el)
            return el
        })

        // Raycaster
        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2()
        let isZooming = false

        const onMouseMove = (e: MouseEvent) => {
            if (isZooming) return
            mouse.x = (e.clientX / w) * 2 - 1
            mouse.y = -(e.clientY / h) * 2 + 1
            raycaster.setFromCamera(mouse, camera)
            const hits = raycaster.intersectObjects(planetMeshes)
            hoveredRef.current = hits.length > 0 ? hits[0].object.userData.id : null
            mount.style.cursor = hits.length > 0 ? 'pointer' : 'default'
        }

        const onClick = (e: MouseEvent) => {
            if (isZooming) return
            mouse.x = (e.clientX / w) * 2 - 1
            mouse.y = -(e.clientY / h) * 2 + 1
            raycaster.setFromCamera(mouse, camera)
            const hits = raycaster.intersectObjects(planetMeshes)
            if (!hits.length) return

            const clickedId = hits[0].object.userData.id
            const planet = PLANETS.find(p => p.id === clickedId)!
            const targetMesh = planetData.find(p => p.id === clickedId)!.mesh

            isZooming = true
            setTargetPlanet(planet)
            setZoomState('zooming')

            const startPos = camera.position.clone()
            const targetPos = new THREE.Vector3(targetMesh.position.x * 0.85, targetMesh.position.y * 0.85, targetMesh.position.z + 40)
            const startTime = performance.now()
            const duration = 1400

            const zoomLoop = () => {
                const t = Math.min((performance.now() - startTime) / duration, 1)
                const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
                camera.position.lerpVectors(startPos, targetPos, ease)
                camera.lookAt(targetMesh.position)
                if (t < 1) requestAnimationFrame(zoomLoop)
                else setZoomState('title')
            }
            requestAnimationFrame(zoomLoop)
        }

        mount.addEventListener('mousemove', onMouseMove)
        mount.addEventListener('click', onClick)

        // Animation loop
        let frame = 0
        let time = 0
        const tempV = new THREE.Vector3()

        const animate = () => {
            frame = requestAnimationFrame(animate)
            time += 0.005
            stars.rotation.y = time * 0.02
            stars.rotation.x = time * 0.005
            bhGroup.rotation.z = time * 0.3

            if (!isZooming) {
                camera.position.x += (Math.sin(time * 0.1) * 20 - camera.position.x) * 0.02
                camera.position.y += (Math.cos(time * 0.08) * 10 - camera.position.y) * 0.02
                camera.lookAt(0, 0, 0)
            }

            planetMeshes.forEach((mesh, i) => {
                const hovered = hoveredRef.current === mesh.userData.id
                mesh.scale.setScalar(hovered ? 1.3 + Math.sin(time * 4) * 0.05 : 1 + Math.sin(time * 1.5 + i) * 0.05)
                mesh.rotation.y = time * (0.5 + i * 0.1)
            })

            planetData.forEach((p, i) => {
                tempV.copy(p.mesh.position).project(camera)
                labelEls[i].style.left = ((tempV.x * 0.5 + 0.5) * w) + 'px'
                labelEls[i].style.top = ((-tempV.y * 0.5 + 0.5) * h + 30) + 'px'
                labelEls[i].style.opacity = hoveredRef.current === p.id ? '1' : '0.6'
            })

            renderer.render(scene, camera)
        }
        animate()

        const onResize = () => {
            const nw = window.innerWidth, nh = window.innerHeight
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

    const isIdle = zoomState === 'idle'

    return (
        <div style={{ position: 'fixed', inset: 0, background: '#05050f' }}>
            {/* Three.js canvas */}
            <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />

            {/* NURE title — top center */}
            {isIdle && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    paddingTop: '48px', pointerEvents: 'none', zIndex: 10,
                }}>
                    <h1 style={{
                        fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 900,
                        letterSpacing: '0.4em', color: '#f5a623', margin: 0,
                        textShadow: '0 0 40px rgba(245,166,35,0.5), 0 0 100px rgba(245,166,35,0.2)',
                    }}>
                        NURE
                    </h1>
                    <p style={{
                        marginTop: '12px', fontSize: '11px', letterSpacing: '0.5em',
                        textTransform: 'uppercase', color: '#8888aa', fontFamily: 'var(--font-body)',
                    }}>
                        {getDailyTagline()}
                    </p>
                </div>
            )}

            {/* Date — bottom left */}
            {isIdle && (
                <div style={{
                    position: 'absolute', bottom: '32px', left: '32px',
                    fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase',
                    color: '#8888aa', fontFamily: 'var(--font-display)', opacity: 0.5,
                    pointerEvents: 'none', zIndex: 10,
                }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
            )}

            {/* Hint — bottom right */}
            {isIdle && (
                <div style={{
                    position: 'absolute', bottom: '32px', right: '32px',
                    fontSize: '11px', letterSpacing: '0.2em',
                    color: '#8888aa', fontFamily: 'var(--font-body)', opacity: 0.4,
                    pointerEvents: 'none', zIndex: 10,
                }}>
                    click a planet to enter
                </div>
            )}

            {/* Planet title screen — To🪐ist style */}
            {(zoomState === 'title' || zoomState === 'fading') && targetPlanet && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(5,5,15,0.8)',
                    opacity: titleOpacity,
                    transition: 'opacity 0.8s ease',
                    pointerEvents: 'none',
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center',
                        fontFamily: 'var(--font-display)', fontWeight: 900,
                        fontSize: 'clamp(60px, 10vw, 110px)',
                        color: targetPlanet.color,
                        textShadow: `0 0 60px ${targetPlanet.color}88`,
                        lineHeight: 1,
                        userSelect: 'none',
                    }}>
                        <span>{targetPlanet.prefix}</span>
                        <span style={{
                            fontSize: 'clamp(72px, 12vw, 130px)',
                            lineHeight: 0.85,
                            margin: '0 2px',
                            filter: `drop-shadow(0 0 30px ${targetPlanet.color})`,
                            position: 'relative',
                            zIndex: 2,
                        }}>
                            {targetPlanet.planet}
                        </span>
                        <span>{targetPlanet.suffix}</span>
                    </div>
                </div>
            )}
        </div>
    )
}