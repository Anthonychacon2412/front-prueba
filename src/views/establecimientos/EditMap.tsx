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

interface EditMapProps {
    initialLocation: [number, number]
    onLocationSelect: (location: [number, number]) => void
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

const EditMap: React.FC<EditMapProps> = ({
    initialLocation,
    onLocationSelect,
}) => {
    const [marker, setMarker] = useState<[number, number] | null>(
        initialLocation,
    )

    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
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
        <div style={{ height: '100vh', width: '100%' }}>
            <MapContainer
                center={initialLocation}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '50%', width: '100%' }}
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

export default EditMap
