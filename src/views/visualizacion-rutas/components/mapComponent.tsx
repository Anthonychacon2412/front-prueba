import L, { LatLngExpression } from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import { useEffect } from 'react'

// Import the leaflet-routing-machine library to make sure TypeScript recognizes it
import 'leaflet-routing-machine'

const MapComponent: React.FC<{
    promotorCoords: LatLngExpression
    estCoords: LatLngExpression
}> = ({ promotorCoords, estCoords }) => {
    const customIcon = L.icon({
        iconUrl: markerIcon,
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    })

    // Hook to add routing control
    const RoutingControl = () => {
        const map = useMap()

        useEffect(() => {
            if (!map) return

            // Convert LatLngExpression to L.LatLng if necessary
            const promotorLatLng = L.latLng(
                Array.isArray(promotorCoords)
                    ? promotorCoords[0]
                    : promotorCoords.lat,
                Array.isArray(promotorCoords)
                    ? promotorCoords[1]
                    : promotorCoords.lng,
            )
            const estLatLng = L.latLng(
                Array.isArray(estCoords) ? estCoords[0] : estCoords.lat,
                Array.isArray(estCoords) ? estCoords[1] : estCoords.lng,
            )

            // Create routing control
            L.Routing.control({
                waypoints: [promotorLatLng, estLatLng],
                routeWhileDragging: true,
            }).addTo(map)

            // Cleanup function to remove control on component unmount
            return () => {
                map.eachLayer((layer) => {
                    if (layer instanceof L.Routing.Control) {
                        map.removeLayer(layer)
                    }
                })
            }
        }, [map, promotorCoords, estCoords])

        return null
    }

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
                    <Popup>Establecimiento</Popup>
                </Marker>
                <RoutingControl />
            </MapContainer>
        </div>
    )
}

export default MapComponent
