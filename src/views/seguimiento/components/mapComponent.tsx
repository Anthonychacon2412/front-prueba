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

const establecimientoIcon = new L.Icon({
    iconUrl: '/img/markerEstablecimiento.png', // Reemplaza con la URL de tu ícono
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
    console.log('Establecimientos:', establecimientos)
    console.log('Ubicación del promotor:', promotorUbicacion)
    return (
        <MapContainer
            center={[10.500211, -66.922711]}
            zoom={12}
            className="h-96 w-full"
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Marcadores de los establecimientos */}
            {establecimientos
                .filter((est) => est.ubicacion) // Filtrar aquellos que tienen ubicación
                .map((est) => {
                    // Normalizar la ubicación para que siempre tenga el formato correcto
                    const lat = est.ubicacion._lat || est.ubicacion.latitude
                    const lng = est.ubicacion._long || est.ubicacion.longitude

                    // Solo renderizar el marcador si la ubicación es válida
                    return lat && lng ? (
                        <Marker
                            key={est.id}
                            position={[lat, lng]}
                            icon={establecimientoIcon}
                        >
                            <Tooltip>{est.nombre}</Tooltip>{' '}
                            {/* Tooltip para establecimientos */}
                        </Marker>
                    ) : null
                })}

            {/* Marcador para la ubicación del promotor */}
            {promotorUbicacion && (
                <Marker
                    position={[
                        promotorUbicacion._lat || promotorUbicacion?.latitude,
                        promotorUbicacion._long || promotorUbicacion?.longitude,
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
