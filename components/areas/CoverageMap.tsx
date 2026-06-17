'use client'

import React, { useEffect, useRef } from 'react'
import { useTheme } from '../theme/ThemeProvider'

export interface MapNode {
  id: string
  name: string
  lat: number
  lng: number
  zone: 'FREE_CALL_OUT' | 'STANDARD_999' | 'LONDON_FLEX'
  postcodes: string[]
}

interface CoverageMapProps {
  boroughs: MapNode[]
  highlightedNodeId: string | null
  selectedZone: 'ALL' | 'FREE_CALL_OUT' | 'STANDARD_999' | 'LONDON_FLEX'
  onNodeClick: (node: MapNode) => void
}

export default function CoverageMap({ boroughs, highlightedNodeId, selectedZone, onNodeClick }: CoverageMapProps) {
  const { theme } = useTheme()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const tileLayerRef = useRef<any>(null)
  const markersRef = useRef<{ [id: string]: any }>({})
  const circlesRef = useRef<any[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Prevent double initialization check
    if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
      return
    }

    // Append Leaflet CSS dynamically
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    let mapInstance: any = null

    // Import leaflet dynamically
    import('leaflet').then((L) => {
      if (!mapContainerRef.current) return
      if ((mapContainerRef.current as any)._leaflet_id) return // double check

      // Initialize map
      mapInstance = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([51.56, -0.15], 10) // Centered on Greater London/Barnet area
      
      mapRef.current = mapInstance

      // Add Zoom Control at bottom-left
      L.control.zoom({ position: 'bottomleft' }).addTo(mapInstance)

      // Add CartoDB tiles based on initial theme
      const tileUrl = theme === 'light'
        ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 20
      }).addTo(mapInstance)
      tileLayerRef.current = tileLayer

      // 1. Draw Free Call-Out Zone Circle (Zone 4) - Cyan (#00D2FF)
      const freeCircle = L.circle([51.64, -0.21], {
        color: '#00D2FF',
        fillColor: '#00D2FF',
        fillOpacity: 0.12,
        radius: 7680, // Core area centered around Barnet/Potters Bar/Borehamwood (-20% decrease)
        weight: 2,
        dashArray: '1, 1'
      }).addTo(mapInstance)
      circlesRef.current.push(freeCircle)

      // 2. Draw Standard £15.00 Call-out Circle (Zone 3) - Purple (#A855F7)
      const standard999Circle = L.circle([51.64, -0.21], {
        color: '#A855F7',
        fillColor: '#A855F7',
        fillOpacity: 0.08,
        radius: 12800, // covers Watford, Enfield, Harrow, Wembley, Camden, Islington (-20% decrease)
        weight: 1.5,
        dashArray: '4, 4'
      }).addTo(mapInstance)
      circlesRef.current.push(standard999Circle)

      // 3. Draw London Flexible Circle (Zone 2) - Orange (#F59E0B)
      const londonFlexCircle = L.circle([51.505, -0.12], {
        color: '#F59E0B',
        fillColor: '#F59E0B',
        fillOpacity: 0.04,
        radius: 25000,
        weight: 1,
        dashArray: '6, 6'
      }).addTo(mapInstance)
      circlesRef.current.push(londonFlexCircle)

      // Add markers
      boroughs.forEach((node) => {
        let color = '#F59E0B'
        if (node.zone === 'FREE_CALL_OUT') color = '#00D2FF'
        else if (node.zone === 'STANDARD_999') color = '#A855F7'
        
        // Define Custom DivIcon representing a glowing neon dot
        const iconHtml = `
          <div class="glow-marker-wrapper" id="marker-wrapper-${node.id}">
            <div class="glow-marker-ring" style="border-color: ${color}"></div>
            <div class="glow-marker-dot" style="background-color: ${color}; box-shadow: 0 0 8px ${color}"></div>
          </div>
        `

        const customIcon = L.divIcon({
          className: 'leaflet-custom-marker',
          html: iconHtml,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })

        const marker = L.marker([node.lat, node.lng], { icon: customIcon })
          .addTo(mapInstance)
          .on('click', () => {
            onNodeClick(node)
            mapInstance.setView([node.lat, node.lng], 12, { animate: true })
            
            // Open simple glassmorphic style popup
            marker.bindPopup(`
              <div class="map-popup-card">
                <h4>${node.name}</h4>
                <p class="zone-badge ${node.zone.toLowerCase().replace(/_/g, '-')}">
                  ${node.zone === 'FREE_CALL_OUT' ? 'Free Call-out Hub' : node.zone === 'STANDARD_999' ? '£15.00 Call-out' : 'Negotiable Zone'}
                </p>
                <p class="postcode-list">Postcodes: ${node.postcodes.join(', ')}</p>
              </div>
            `, {
              className: 'glass-leaflet-popup',
              closeButton: false,
              offset: [0, -10]
            }).openPopup()
          })

        markersRef.current[node.id] = marker
      })
    })

    return () => {
      if (mapInstance) {
        mapInstance.remove()
      }
    }
  }, [boroughs, onNodeClick])

  // Dynamically update tile layer when theme changes
  useEffect(() => {
    if (!mapRef.current) return

    import('leaflet').then((L) => {
      if (!mapRef.current) return
      
      if (tileLayerRef.current) {
        tileLayerRef.current.remove()
      }

      const tileUrl = theme === 'light'
        ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

      const newTileLayer = L.tileLayer(tileUrl, {
        maxZoom: 20
      }).addTo(mapRef.current)

      tileLayerRef.current = newTileLayer
    })
  }, [theme])

  // Sync selection/highlight changes
  useEffect(() => {
    if (!mapRef.current) return

    const map = mapRef.current
    
    // Zoom and open popup for highlighted node
    if (highlightedNodeId && markersRef.current[highlightedNodeId]) {
      const marker = markersRef.current[highlightedNodeId]
      const node = boroughs.find(n => n.id === highlightedNodeId)
      
      if (node) {
        map.setView([node.lat, node.lng], 12, { animate: true })
        
        import('leaflet').then((L) => {
          marker.bindPopup(`
            <div class="map-popup-card">
              <h4>${node.name}</h4>
              <p class="zone-badge ${node.zone.toLowerCase().replace(/_/g, '-')}">
                ${node.zone === 'FREE_CALL_OUT' ? 'Free Call-out Hub' : node.zone === 'STANDARD_999' ? '£15.00 Call-out' : 'Negotiable Zone'}
              </p>
              <p class="postcode-list">Postcodes: ${node.postcodes.join(', ')}</p>
            </div>
          `, {
            className: 'glass-leaflet-popup',
            closeButton: false,
            offset: [0, -10]
          }).openPopup()
        })
      }
    } else {
      map.closePopup()
      // Center back to London view
      if (!highlightedNodeId) {
        map.setView([51.56, -0.15], 10, { animate: true })
      }
    }
  }, [highlightedNodeId, boroughs])

  // Sync zone filters: dim/brighten markers based on selected zone
  useEffect(() => {
    boroughs.forEach((node) => {
      const markerEl = document.getElementById(`marker-wrapper-${node.id}`)
      if (markerEl) {
        const isMatch = selectedZone === 'ALL' || selectedZone === node.zone
        markerEl.style.opacity = isMatch ? '1' : '0.15'
        markerEl.style.transition = 'opacity 0.3s ease-in-out'
      }
    })
  }, [selectedZone, boroughs])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px' }}>
      {/* Styles injection for Leaflet map elements */}
      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-container {
          background: var(--bg-color) !important;
          font-family: var(--font-syne), sans-serif;
        }
        
        /* Glowing Interactive Marker */
        .glow-marker-wrapper {
          position: relative;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .glow-marker-ring {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 1.5px solid;
          border-radius: 50%;
          animation: markerPulse 2.2s infinite ease-in-out;
          pointer-events: none;
        }
        
        .glow-marker-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 1.5px solid #ffffff;
          pointer-events: auto;
          transition: transform 0.2s ease;
        }
        
        .glow-marker-wrapper:hover .glow-marker-dot {
          transform: scale(1.35);
        }
        
        @keyframes markerPulse {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        
        /* Glassmorphic Popup Styles */
        .glass-leaflet-popup .leaflet-popup-content-wrapper {
          background: var(--surface) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid var(--border) !important;
          border-radius: 12px !important;
          color: var(--text-primary) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
          padding: 0.25rem !important;
        }
        
        .glass-leaflet-popup .leaflet-popup-tip {
          background: var(--surface) !important;
          border: 1px solid var(--border) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
        }
        
        .map-popup-card {
          padding: 0.25rem 0.5rem;
          min-width: 160px;
        }
        
        .map-popup-card h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.4rem 0;
          font-family: var(--font-syne), sans-serif;
        }
        
        .zone-badge {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          margin-bottom: 0.4rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: var(--font-jetbrains), monospace;
        }
        
        .zone-badge.free-call-out {
          background: rgba(0, 210, 255, 0.12);
          color: #00D2FF;
          border: 1px solid rgba(0, 210, 255, 0.25);
        }
        
        .zone-badge.standard-999 {
          background: rgba(168, 85, 247, 0.12);
          color: #A855F7;
          border: 1px solid rgba(168, 85, 247, 0.25);
        }
 
        .zone-badge.london-flex {
          background: rgba(245, 158, 11, 0.12);
          color: #F59E0B;
          border: 1px solid rgba(245, 158, 11, 0.25);
        }
        
        .postcode-list {
          font-size: 0.72rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.3;
        }
        
        /* Map Controls Override */
        .leaflet-bar {
          border: 1px solid var(--border) !important;
          border-radius: 8px !important;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15) !important;
        }
        
        .leaflet-bar a {
          background-color: var(--surface) !important;
          color: var(--text-primary) !important;
          border-bottom: 1px solid var(--border) !important;
          transition: background-color 0.2s;
        }
        
        .leaflet-bar a:hover {
          background-color: rgba(0, 210, 255, 0.15) !important;
          color: #00D2FF !important;
        }
      ` }} />
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '400px', borderRadius: '20px' }} />
    </div>
  )
}
