import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    useMap,
} from 'react-leaflet'
import { useState, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import 'leaflet.fullscreen/Control.FullScreen.css'
import 'leaflet.fullscreen'

interface MapcreateProps {
    onLocationSelect: (location: [number, number]) => void
}

// Extend the type definition for Map to include fullscreenControl
declare module 'leaflet' {
    interface Map {
        fullscreenControl?: Control.Fullscreen
    }
}

// Extend the type definition for L.control to include fullscreen
declare module 'leaflet' {
    namespace control {
        function fullscreen(options?: any): Control.Fullscreen
    }

    namespace Control {
        interface Fullscreen extends Control {
            options: any
        }
    }
}

const FullscreenControl = () => {
    const map = useMap()

    useEffect(() => {
        if (!map.fullscreenControl) {
            const fullscreenControl = L.control.fullscreen({
                position: 'topright',
                title: 'Pantalla completa',
                titleCancel: 'Salir de pantalla completa',
            })
            fullscreenControl.addTo(map)
            map.fullscreenControl = fullscreenControl
        }
    }, [map])

    return null
}

const Mapcreate: React.FC<MapcreateProps> = ({ onLocationSelect }) => {
    const [marker, setMarker] = useState<[number, number] | null>(null)

    const MapClickHandler = () => {
        useMapEvents({
            click(e: any) {
                const newLocation: [number, number] = [
                    e.latlng.lat,
                    e.latlng.lng,
                ]
                setMarker(newLocation)
                onLocationSelect(newLocation)
            },
        })
        return null
    }

    return (
        <div className="h-80">
            <MapContainer
                center={[10.4806, -66.9036]} // Coordenadas de Caracas, Venezuela
                zoom={13}
                scrollWheelZoom={false}
                style={{
                    height: '100%',
                    width: '100%',
                    backgroundColor: 'red',
                }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <FullscreenControl />
                <MapClickHandler />
                {marker && <Marker position={marker} />}
            </MapContainer>
        </div>
    )
}

export default Mapcreate
