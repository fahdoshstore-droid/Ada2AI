/**
 * Google Maps Component
 * TODO: Add real Google Maps API key
 */
import React from 'react'

interface MapProps {
  lat?: number
  lng?: number
  zoom?: number
  markers?: Array<{ lat: number; lng: number; title: string }>
}

const GoogleMapsPlaceholder: React.FC<MapProps> = ({ 
  lat = 24.7136, 
  lng = 46.6753,
  zoom = 10,
  markers = [] 
}) => {
  // Placeholder until Google Maps API is configured
  return (
    <div 
      style={{
        width: '100%',
        height: '400px',
        backgroundColor: '#1a1a2e',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        border: '2px dashed #00DCC8'
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
      <h3 style={{ margin: '0 0 8px 0', color: '#00DCC8' }}>Google Maps</h3>
      <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
        Add VITE_GOOGLE_MAPS_KEY to enable
      </p>
      <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '12px' }}>
        Location: {lat}, {lng} | Zoom: {zoom}
      </p>
    </div>
  )
}

export default GoogleMapsPlaceholder
