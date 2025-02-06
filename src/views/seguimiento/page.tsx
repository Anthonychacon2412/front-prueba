import { Button, DatePicker, Select } from '@/components/ui'
import React, { useEffect, useState } from 'react'
import { HiOutlineSearch } from 'react-icons/hi'
import MapComponent from './components/mapComponent'
import { collection, getDocs, query, doc } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'

import 'leaflet/dist/leaflet.css'

const Seguimiento = () => {
    const [cliente, setCliente] = useState<any>(null)
    const [promotor, setPromotor] = useState<any>(null)
    const [rutas, setRutas] = useState<any[]>([])
    const [region, setRegion] = useState<any>(null)
    const [mapData, setMapData] = useState<any[]>([]) // Estado para datos del mapa

    const getDataFromRutas = async () => {
        try {
            const q = query(collection(db, 'Plantilla_rutas'))
            const querySnapshot = await getDocs(q)
            const rutasData: any[] = [] // Cambié rutas a rutasData para evitar confusión

            for (const docSnap of querySnapshot.docs) {
                const establecimientosRef = collection(
                    db,
                    'Plantilla_rutas',
                    docSnap.id,
                    'Establecimientos',
                )
                const establecimientosSnap = await getDocs(establecimientosRef)

                // Iteramos sobre los establecimientos en la subcolección
                for (const establecimientoDoc of establecimientosSnap.docs) {
                    const data = establecimientoDoc.data()
                    const { uid, ubicacion, region, nombre_establecimiento } =
                        data

                    // Accediendo a las coordenadas
                    const lat = ubicacion._lat
                    const long = ubicacion._long

                    // Mostrar las coordenadas y otros detalles
                    console.log('Establecimiento:', nombre_establecimiento)
                    console.log('ID:', uid)
                    console.log('Región:', region)
                    console.log('Ubicación:', `Lat: ${lat}, Long: ${long}`)

                    // Agregar estos datos al estado del mapa
                    setMapData((prevMapData) => [
                        ...prevMapData,
                        { lat, long, nombre_establecimiento, region },
                    ])
                }

                rutasData.push({
                    id: docSnap.id,
                    ...docSnap.data(),
                    hasEstablecimientos: !establecimientosSnap.empty,
                })
            }

            console.log(rutasData)
            setRutas(rutasData)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        getDataFromRutas()
    }, [])

    const handleSearch = () => {
        // Lógica de búsqueda según cliente, región, etc.
        console.log('Buscando...', { cliente, region })
    }

    // Mapear las opciones de cliente y región
    const clientesOptions = rutas.map((ruta) => ({
        label: ruta.cliente || 'Desconocido', // Ajusta según la estructura de cliente
        value: ruta.cliente,
    }))
    const regionOptions = rutas.map((ruta) => ({
        label: ruta.region || 'Desconocido', // Ajusta según la estructura de región
        value: ruta.region,
    }))
    const promotorOptions = rutas.map((ruta) => ({
        label: ruta.promotor || 'Desconocido', // Ajusta según la estructura de región
        value: ruta.promotor,
    }))

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Seguimiento</h1>
            <div className="flex justify-between relative z-10 mb-4">
                <Select
                    className="relative z-20 w-48"
                    placeholder="Clientes"
                    options={clientesOptions} // Cambié a opciones de clientes
                    onChange={(value) => setCliente(value)}
                />
                <Select
                    className="relative z-20 w-48"
                    placeholder="Región"
                    options={regionOptions} // Cambié a opciones de regiones
                    onChange={(value) => setRegion(value)}
                />
                <Select
                    className="relative z-20 w-48"
                    placeholder="Promotor"
                    options={promotorOptions}
                    onChange={(value) => setPromotor(value)}
                />

                <Button variant="solid" onClick={handleSearch}>
                    <HiOutlineSearch />
                </Button>
            </div>
            <div className="relative z-0">
                <MapComponent data={mapData} />{' '}
                {/* Pasa los datos combinados al mapa */}
            </div>
        </div>
    )
}

export default Seguimiento
