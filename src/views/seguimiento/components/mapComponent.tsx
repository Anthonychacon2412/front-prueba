import React from 'react'
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Define el ícono personalizado para el promotor
const promotorIcon = new L.Icon({
    iconUrl: '/img/markerPromotor.png', // Reemplaza con la URL de tu ícono
    iconSize: [40, 50], // Tamaño del ícono
    iconAnchor: [12, 41], // Punto del ícono que corresponde a la ubicación del marcador
    popupAnchor: [1, -34], // Punto desde el cual se abrirá el popup relativo al iconAnchor
    tooltipAnchor: [16, -28], // Punto desde el cual se abrirá el tooltip relativo al iconAnchor
    shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png', // Sombra del ícono
    shadowSize: [41, 41], // Tamaño de la sombra
    shadowAnchor: [12, 41], // Punto de la sombra que corresponde a la ubicación del marcador
})

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
                        icon={promotorIcon} // Asigna el ícono personalizado aquí
                    >
                        <Tooltip>Ubicación del Promotor</Tooltip>
                    </Marker>
                )}
        </MapContainer>
    )
}

export default MapComponent
