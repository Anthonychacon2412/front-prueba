import React from 'react'
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

interface Establecimiento {
    id: string
    nombre: string
    ubicacion: {
        _lat: number
        _long: number
    }
}

interface MapComponentProps {
    establecimientos: Establecimiento[]
    promotorUbicacion?: {
        _lat: number
        _long: number
    }
}

const MapComponent: React.FC<MapComponentProps> = ({
    establecimientos,
    promotorUbicacion,
}) => {
    return (
        <MapContainer
            center={[10.500211, -66.922711]}
            zoom={12}
            className="h-96 w-full"
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Marcadores de los establecimientos */}
            {establecimientos
                .filter(
                    (est) =>
                        est.ubicacion &&
                        est.ubicacion._lat &&
                        est.ubicacion._long,
                )
                .map((est) => (
                    <Marker
                        key={est.id}
                        position={[est.ubicacion._lat, est.ubicacion._long]}
                    >
                        <Tooltip>{est.nombre}</Tooltip>{' '}
                        {/* Tooltip para establecimientos */}
                    </Marker>
                ))}

            {/* Marcador para la ubicación del promotor */}
            {promotorUbicacion &&
                promotorUbicacion._lat &&
                promotorUbicacion._long && (
                    <Marker
                        position={[
                            promotorUbicacion._lat,
                            promotorUbicacion._long,
                        ]}
                    >
                        <Tooltip>Ubicación del Promotor</Tooltip>
                    </Marker>
                )}
        </MapContainer>
    )
}

export default MapComponent
