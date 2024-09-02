import React from 'react'
import L, { LatLngExpression } from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

interface GeoPoint {
    _lat: number
    _long: number
}

interface MapComponentProps {
    data: Array<{
        id: string
        nombre: string
        coordenadas: {
            [key: string]: GeoPoint // Clave dinámica para soportar cualquier cantidad de coordenadas
        }
    }>
}

const MapComponent: React.FC<MapComponentProps> = ({ data }) => {
    const positionInit: LatLngExpression = [11.0698283, -63.9681467]

    const customIcon = L.icon({
        iconUrl: markerIcon,
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    })

    // Genera marcadores dinámicamente para todas las coordenadas
    const markers = data.flatMap(({ id, nombre, coordenadas }) =>
        Object.keys(coordenadas).map((key) => {
            const coord = coordenadas[key]
            console.log(
                `Generando marcador para ${nombre} - ${key} con coordenadas:`,
                coord,
            )
            return {
                id: `${id}-${key}`,
                position: [coord._lat, coord._long] as LatLngExpression,
                name: `${nombre} - ${
                    key.charAt(0).toUpperCase() + key.slice(1)
                }`,
            }
        }),
    )

    console.log('Marcadores generados:', markers)

    return (
        <div style={{ height: '400px', width: '100%' }} className="mt-4">
            <MapContainer
                center={positionInit}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {markers.map(({ id, position, name }) => (
                    <Marker key={id} position={position} icon={customIcon}>
                        <Popup>
                            {name} <br /> ID: {id}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    )
}

export default MapComponent
