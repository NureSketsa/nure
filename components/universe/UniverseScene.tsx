// FILE LOCATION: components/universe/UniverseScene.tsx

'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { getDailyTagline } from '@/lib/taglines'
import { useUniverseStore, PanelId } from '@/lib/universeStore'

export const PLANETS = [
    { id: 'habits' as PanelId, label: 'HABITS', angle: 0, radius: 230, color: '#f5c842' },
    { id: 'todos' as PanelId, label: 'TODOS', angle: 72, radius: 320, color: '#00d4aa' },
    { id: 'calendar' as PanelId, label: 'CALENDAR', angle: 144, radius: 265, color: '#7799ff' },
    { id: 'journal' as PanelId, label: 'JOURNAL', angle: 216, radius: 350, color: '#cc66ff' },
    { id: 'links' as PanelId, label: 'LINKS', angle: 288, radius: 295, color: '#4488ff' },
]

function buildCosmicObject(id: string): THREE.Group {
    const group = new THREE.Group()

    if (id === 'habits') {
        // Bright star with radiating spikes
        group.add(new THREE.Mesh(new THREE.SphereGeometry(22, 32, 32), new THREE.MeshBasicMaterial({ color: '#fff8d0' })))
        group.add(new THREE.Mesh(new THREE.SphereGeometry(30, 32, 32), new THREE.MeshBasicMaterial({ color: '#f5c842', transparent: true, opacity: 0.15, side: THREE.BackSide })))
        group.add(new THREE.Mesh(new THREE.SphereGeometry(42, 32, 32), new THREE.MeshBasicMaterial({ color: '#f5a623', transparent: true, opacity: 0.06, side: THREE.BackSide })))
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2
            const len = i % 2 === 0 ? 55 : 35
            const spike = new THREE.Mesh(new THREE.ConeGeometry(2, len, 6), new THREE.MeshBasicMaterial({ color: '#ffe066', transparent: true, opacity: 0.75 }))
            spike.position.set(Math.cos(a) * (22 + len / 2), Math.sin(a) * (22 + len / 2), 0)
            spike.rotation.z = a + Math.PI / 2
            group.add(spike)
        }

    } else if (id === 'todos') {
        // Saturn with rings
        group.add(new THREE.Mesh(new THREE.SphereGeometry(24, 32, 32), new THREE.MeshBasicMaterial({ color: '#00b894' })))
        const r1 = new THREE.Mesh(new THREE.RingGeometry(34, 54, 64), new THREE.MeshBasicMaterial({ color: '#00d4aa', side: THREE.DoubleSide, transparent: true, opacity: 0.65 }))
        r1.rotation.x = Math.PI * 0.35; group.add(r1)
        const r2 = new THREE.Mesh(new THREE.RingGeometry(56, 64, 64), new THREE.MeshBasicMaterial({ color: '#00ffc8', side: THREE.DoubleSide, transparent: true, opacity: 0.3 }))
        r2.rotation.x = Math.PI * 0.35; group.add(r2)

    } else if (id === 'calendar') {
        // Ringed ice planet — more dramatic than plain crescent
        // Main icy body
        group.add(new THREE.Mesh(new THREE.SphereGeometry(26, 32, 32), new THREE.MeshBasicMaterial({ color: '#ccd8ff' })))
        // Polar cap
        group.add(new THREE.Mesh(new THREE.SphereGeometry(26, 32, 32), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.3 })))
            // Latitude band rings around the sphere
            ;[18, 22, 25].forEach((lat, i) => {
                const band = new THREE.Mesh(
                    new THREE.TorusGeometry(lat, 1.5 - i * 0.3, 8, 64),
                    new THREE.MeshBasicMaterial({ color: '#7799ff', transparent: true, opacity: 0.4 - i * 0.1 })
                )
                band.rotation.x = Math.PI / 2
                group.add(band)
            })
        // Wide orbital ring
        const orbRing = new THREE.Mesh(new THREE.RingGeometry(36, 50, 64), new THREE.MeshBasicMaterial({ color: '#aabbff', side: THREE.DoubleSide, transparent: true, opacity: 0.35 }))
        orbRing.rotation.x = Math.PI * 0.2
        group.add(orbRing)
        // Glow
        group.add(new THREE.Mesh(new THREE.SphereGeometry(34, 32, 32), new THREE.MeshBasicMaterial({ color: '#7799ff', transparent: true, opacity: 0.07, side: THREE.BackSide })))

    } else if (id === 'journal') {
        // Dramatic gas giant — banded with multiple vivid rings
        // Core body with color
        group.add(new THREE.Mesh(new THREE.SphereGeometry(26, 32, 32), new THREE.MeshBasicMaterial({ color: '#6611aa' })))
            // Atmospheric bands (flat tori at different latitudes)
            ;[
                { r: 26, tube: 3, color: '#cc66ff', op: 0.6 },
                { r: 26, tube: 6, color: '#9933cc', op: 0.4 },
                { r: 26, tube: 10, color: '#7722aa', op: 0.3 },
            ].forEach(b => {
                const band = new THREE.Mesh(new THREE.TorusGeometry(b.r, b.tube, 4, 64), new THREE.MeshBasicMaterial({ color: b.color, transparent: true, opacity: b.op }))
                band.rotation.x = Math.PI / 2
                group.add(band)
            })
            // Multiple dramatic rings like Uranus
            ;[
                { inner: 36, outer: 44, color: '#cc66ff', op: 0.7, tilt: 0.1 },
                { inner: 46, outer: 52, color: '#9933cc', op: 0.5, tilt: 0.1 },
                { inner: 54, outer: 58, color: '#ff88ff', op: 0.35, tilt: 0.1 },
                { inner: 60, outer: 70, color: '#cc44ee', op: 0.2, tilt: 0.1 },
            ].forEach(r => {
                const ring = new THREE.Mesh(new THREE.RingGeometry(r.inner, r.outer, 64), new THREE.MeshBasicMaterial({ color: r.color, side: THREE.DoubleSide, transparent: true, opacity: r.op }))
                ring.rotation.x = Math.PI * r.tilt
                ring.rotation.z = Math.PI * 0.05
                group.add(ring)
            })
        // Outer glow
        group.add(new THREE.Mesh(new THREE.SphereGeometry(38, 32, 32), new THREE.MeshBasicMaterial({ color: '#cc66ff', transparent: true, opacity: 0.08, side: THREE.BackSide })))

    } else if (id === 'links') {
        // Star cluster
        group.add(new THREE.Mesh(new THREE.SphereGeometry(12, 32, 32), new THREE.MeshBasicMaterial({ color: '#88aaff' })))
        group.add(new THREE.Mesh(new THREE.SphereGeometry(18, 32, 32), new THREE.MeshBasicMaterial({ color: '#4488ff', transparent: true, opacity: 0.14, side: THREE.BackSide })))
            ;[{ r: 28, s: 5 }, { r: 28, s: 4 }, { r: 28, s: 3 }, { r: 42, s: 4 }, { r: 42, s: 3 }, { r: 42, s: 5 }, { r: 42, s: 3 }, { r: 56, s: 3 }, { r: 56, s: 4 }, { r: 56, s: 2 }].forEach((d, i) => {
                const ang = (i / 10) * Math.PI * 2
                const star = new THREE.Mesh(new THREE.SphereGeometry(d.s, 8, 8), new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? '#aaccff' : '#4488ff' }))
                star.position.set(Math.cos(ang) * d.r, Math.sin(ang) * d.r * 0.5, Math.sin(ang * 0.7) * 10)
                group.add(star)
            })
    }

    return group
}

export default function UniverseScene() {
    const mountRef = useRef<HTMLDivElement>(null)
    const hoveredRef = useRef<string | null>(null)
    const { activePanel, setActivePanel, setIsZooming } = useUniverseStore()

    // ALL three.js state lives in refs — never reset on re-render
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
    const isZoomingRef = useRef(false)
    const activePanelRef = useRef<PanelId>(null)
    // Store exactly where we zoomed to, so zoom-out starts from there
    const zoomedPosRef = useRef<THREE.Vector3 | null>(null)
    const zoomedTargetRef = useRef<THREE.Vector3 | null>(null)
    // Home position after idle drift
    const homePosRef = useRef(new THREE.Vector3(0, 0, 600))

    // Sync ref with store
    useEffect(() => {
        const prev = activePanelRef.current
        activePanelRef.current = activePanel

        // Panel closed → zoom out from exactly where we are
        if (prev !== null && activePanel === null && cameraRef.current && !isZoomingRef.current) {
            doZoomOut()
        }
    }, [activePanel])

    function doZoomOut() {
        const camera = cameraRef.current
        if (!camera) return
        isZoomingRef.current = true
        setIsZooming(true)

        const startPos = camera.position.clone()
        const startLookAt = zoomedTargetRef.current?.clone() ?? new THREE.Vector3(0, 0, 0)
        const endPos = homePosRef.current.clone()
        const startTime = performance.now()
        const duration = 1300

        const loop = () => {
            const t = Math.min((performance.now() - startTime) / duration, 1)
            const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
            camera.position.lerpVectors(startPos, endPos, ease)
            // Smoothly pan look-at back to origin
            const currentLookAt = startLookAt.clone().lerp(new THREE.Vector3(0, 0, 0), ease)
            camera.lookAt(currentLookAt)
            if (t < 1) {
                requestAnimationFrame(loop)
            } else {
                camera.lookAt(0, 0, 0)
                isZoomingRef.current = false
                setIsZooming(false)
                zoomedPosRef.current = null
                zoomedTargetRef.current = null
            }
        }
        requestAnimationFrame(loop)
    }

    useEffect(() => {
        if (!mountRef.current) return
        const mount = mountRef.current
        const w = window.innerWidth
        const h = window.innerHeight

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 2000)
        camera.position.set(0, 0, 600)
        cameraRef.current = camera

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(w, h)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setClearColor(0x05050f, 1)
        mount.appendChild(renderer.domElement)

        // Stars
        const sp = new Float32Array(3000 * 3)
        for (let i = 0; i < sp.length; i++) sp[i] = (Math.random() - 0.5) * 3000
        const starGeo = new THREE.BufferGeometry()
        starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3))
        const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1, transparent: true, opacity: 0.6 }))
        scene.add(stars)

        // Black hole
        const bhGroup = new THREE.Group()
        scene.add(bhGroup)
        bhGroup.add(new THREE.Mesh(new THREE.CircleGeometry(48, 64), new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide })))
            ;[{ i: 50, o: 72, c: 0xf5a623, op: 0.85 }, { i: 74, o: 90, c: 0xff8800, op: 0.65 }, { i: 92, o: 104, c: 0xffaa33, op: 0.45 }, { i: 106, o: 114, c: 0xcc5500, op: 0.28 }].forEach(r => {
                const ring = new THREE.Mesh(new THREE.RingGeometry(r.i, r.o, 64), new THREE.MeshBasicMaterial({ color: r.c, side: THREE.DoubleSide, transparent: true, opacity: r.op }))
                ring.rotation.x = Math.PI * 0.15
                bhGroup.add(ring)
            })

        // Planets
        const hitSpheres: THREE.Mesh[] = []
        const planetData = PLANETS.map(p => {
            const group = buildCosmicObject(p.id as string)
            const rad = (p.angle * Math.PI) / 180
            group.position.set(Math.cos(rad) * p.radius, Math.sin(rad) * p.radius * 0.4, Math.sin(rad) * p.radius * 0.1)
            scene.add(group)

            const hit = new THREE.Mesh(new THREE.SphereGeometry(70, 8, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }))
            hit.position.copy(group.position)
            hit.userData = { id: p.id }
            scene.add(hit)
            hitSpheres.push(hit)

            return { group, hit, ...p }
        })

        // DOM labels
        const labelContainer = document.createElement('div')
        labelContainer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;'
        mount.appendChild(labelContainer)
        const labelEls = planetData.map(p => {
            const el = document.createElement('div')
            el.style.cssText = `position:absolute;transform:translate(-50%,-50%);font-family:var(--font-display);font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:${p.color};opacity:0.7;pointer-events:none;white-space:nowrap;text-shadow:0 0 12px ${p.color};transition:opacity 0.3s;`
            el.textContent = p.label
            labelContainer.appendChild(el)
            return el
        })

        // Raycaster
        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2()

        const onMouseMove = (e: MouseEvent) => {
            if (isZoomingRef.current || activePanelRef.current) return
            mouse.x = (e.clientX / w) * 2 - 1
            mouse.y = -(e.clientY / h) * 2 + 1
            raycaster.setFromCamera(mouse, camera)
            const hits = raycaster.intersectObjects(hitSpheres)
            hoveredRef.current = hits.length > 0 ? hits[0].object.userData.id : null
            mount.style.cursor = hits.length > 0 ? 'pointer' : 'default'
        }

        const onClick = (e: MouseEvent) => {
            if (isZoomingRef.current || activePanelRef.current) return
            mouse.x = (e.clientX / w) * 2 - 1
            mouse.y = -(e.clientY / h) * 2 + 1
            raycaster.setFromCamera(mouse, camera)
            const hits = raycaster.intersectObjects(hitSpheres)
            if (!hits.length) return

            const clickedId = hits[0].object.userData.id
            const planet = PLANETS.find(p => p.id === clickedId)!
            const targetGroup = planetData.find(p => p.id === clickedId)!.group
            const tp = targetGroup.position.clone()

            isZoomingRef.current = true
            setIsZooming(true)

            // Save home pos at moment of click (includes idle drift)
            homePosRef.current = camera.position.clone()

            const startPos = camera.position.clone()
            const targetPos = new THREE.Vector3(tp.x * 0.8, tp.y * 0.8, tp.z + 60)
            const startTime = performance.now()
            const duration = 1300

            const zoomLoop = () => {
                const t = Math.min((performance.now() - startTime) / duration, 1)
                const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
                camera.position.lerpVectors(startPos, targetPos, ease)
                camera.lookAt(tp)
                if (t < 1) {
                    requestAnimationFrame(zoomLoop)
                } else {
                    // Save exact zoom position for zoom-out
                    zoomedPosRef.current = targetPos.clone()
                    zoomedTargetRef.current = tp.clone()
                    isZoomingRef.current = false
                    setIsZooming(false)
                    setActivePanel(planet.id)
                }
            }
            requestAnimationFrame(zoomLoop)
        }

        mount.addEventListener('mousemove', onMouseMove)
        mount.addEventListener('click', onClick)

        // Main loop
        let frame = 0
        let time = 0
        const tempV = new THREE.Vector3()

        const animate = () => {
            frame = requestAnimationFrame(animate)
            time += 0.005

            stars.rotation.y = time * 0.015
            bhGroup.rotation.z = time * 0.28

            // Idle drift only when no panel open and not zooming
            if (!isZoomingRef.current && !activePanelRef.current) {
                camera.position.x += (Math.sin(time * 0.1) * 18 - camera.position.x) * 0.015
                camera.position.y += (Math.cos(time * 0.08) * 9 - camera.position.y) * 0.015
                camera.lookAt(0, 0, 0)
                // Keep home ref updated during idle so zoom-out returns here
                homePosRef.current.copy(camera.position)
            }

            planetData.forEach((p, i) => {
                const hovered = hoveredRef.current === p.id
                p.group.scale.setScalar(hovered ? 1.2 + Math.sin(time * 4) * 0.04 : 1 + Math.sin(time * 1.2 + i * 0.8) * 0.04)
                if (p.id === 'habits') p.group.rotation.z = time * 0.15
                else if (p.id === 'todos') p.group.rotation.y = time * 0.4
                else if (p.id === 'calendar') { p.group.rotation.y = time * 0.25; p.group.rotation.x = time * 0.05 }
                else if (p.id === 'journal') { p.group.rotation.y = time * 0.18; p.group.rotation.z = time * 0.06 }
                else if (p.id === 'links') { p.group.rotation.y = time * 0.5; p.group.rotation.z = time * 0.15 }

                if (activePanelRef.current) {
                    labelEls[i].style.opacity = '0'
                } else {
                    tempV.copy(p.group.position).project(camera)
                    labelEls[i].style.left = ((tempV.x * 0.5 + 0.5) * w) + 'px'
                    labelEls[i].style.top = ((-tempV.y * 0.5 + 0.5) * h + 65) + 'px'
                    labelEls[i].style.opacity = hovered ? '1' : '0.6'
                }
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

    const isIdle = !activePanel

    return (
        <div style={{ position: 'fixed', inset: 0, background: '#05050f' }}>
            <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />

            {isIdle && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '48px', pointerEvents: 'none', zIndex: 10 }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 900, letterSpacing: '0.4em', color: '#f5a623', margin: 0, textShadow: '0 0 40px rgba(245,166,35,0.5)' }}>NURE</h1>
                    <p style={{ marginTop: '12px', fontSize: '11px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#8888aa', fontFamily: 'var(--font-body)' }}>{getDailyTagline()}</p>
                </div>
            )}
            {isIdle && (
                <div style={{ position: 'absolute', bottom: '32px', left: '32px', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8888aa', fontFamily: 'var(--font-display)', opacity: 0.5, pointerEvents: 'none', zIndex: 10 }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
            )}
            {isIdle && (
                <div style={{ position: 'absolute', bottom: '32px', right: '32px', fontSize: '11px', letterSpacing: '0.2em', color: '#8888aa', fontFamily: 'var(--font-body)', opacity: 0.4, pointerEvents: 'none', zIndex: 10 }}>
                    click a planet to enter
                </div>
            )}
        </div>
    )
}