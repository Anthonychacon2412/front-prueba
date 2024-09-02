import L, { LatLngExpression } from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import { useEffect } from 'react'

// Componente para el control de enrutamiento
const RoutingControl = ({
    promotorCoords,
    estCoords,
}: {
    promotorCoords: LatLngExpression
    estCoords: LatLngExpression
}) => {
    const map = useMap()

    useEffect(() => {
        if (!map) return

        const promotorLatLng = L.latLng(promotorCoords as [number, number])
        const estLatLng = L.latLng(estCoords as [number, number])

        const routingControl = L.Routing.control({
            waypoints: [promotorLatLng, estLatLng],
            routeWhileDragging: true,
        }).addTo(map)

        return () => {
            map.removeControl(routingControl)
        }
    }, [map, promotorCoords, estCoords])

    return null
}

const MapComponent: React.FC<{
    promotorCoords: LatLngExpression
    estCoords: LatLngExpression
    establecimientoNombre: string // Nombre del establecimiento para el popup
}> = ({ promotorCoords, estCoords, establecimientoNombre }) => {
    const customIcon = L.icon({
        iconUrl: markerIcon,
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    })

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <MapContainer
                center={promotorCoords}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={promotorCoords} icon={customIcon}>
                    <Popup>Promotor</Popup>
                </Marker>
                <Marker position={estCoords} icon={customIcon}>
                    <Popup>{establecimientoNombre}</Popup>
                </Marker>
                <RoutingControl
                    promotorCoords={promotorCoords}
                    estCoords={estCoords}
                />
            </MapContainer>
        </div>
    )
}

export default MapComponent
