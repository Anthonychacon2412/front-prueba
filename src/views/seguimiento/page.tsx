import { Button, Select } from '@/components/ui'
import React, { useEffect, useState } from 'react'
import { HiOutlineSearch } from 'react-icons/hi'
import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import MapComponent from './components/mapComponent'

const Seguimiento = () => {
    const [cliente, setCliente] = useState<string | null>(null)
    const [region, setRegion] = useState<string | null>(null)

    const [rutas, setRutas] = useState<any[]>([])
    const [rutasFiltradas, setRutasFiltradas] = useState<any[]>([])
    const [clientesOptions, setClientesOptions] = useState<any[]>([])
    const [regionesOptions, setRegionesOptions] = useState<any[]>([])
    const [establecimientos, setEstablecimientos] = useState<any[]>([]) // Estado para establecimientos
    const [promotorUbicacion, setPromotorUbicacion] = useState<any>(null) // NUEVO ESTADO para la ubicación del promotor

    const getDataFromRutas = async () => {
        try {
            const q = query(collection(db, 'Plantilla_rutas'))
            const querySnapshot = await getDocs(q)
            const rutasData: any[] = []

            for (const docSnap of querySnapshot.docs) {
                const data = docSnap.data()
                const rutaId = docSnap.id

                // Obtener la subcolección de establecimientos
                const establecimientosRef = collection(
                    db,
                    `Plantilla_rutas/${rutaId}/Establecimientos`,
                )
                const establecimientosSnap = await getDocs(establecimientosRef)

                const establecimientos = establecimientosSnap.docs.map(
                    (estDoc) => ({
                        id: estDoc.id,
                        nombre:
                            estDoc.data().nombre_establecimiento ||
                            'Desconocido',
                        ubicacion: estDoc.data().ubicacion || null,
                    }),
                )

                // Extraer la ubicación del promotor de cada ruta
                const ubicacionPromotor = data.ubicacion_promotor || null

                rutasData.push({
                    id: rutaId,
                    ...data,
                    establecimientos,
                    ubicacion_promotor: ubicacionPromotor, // Guardar la ubicación del promotor
                })
            }

            setRutas(rutasData)
        } catch (error) {
            console.error('Error obteniendo datos de rutas:', error)
        }
    }

    useEffect(() => {
        getDataFromRutas()
    }, [])

    useEffect(() => {
        if (rutas.length > 0) {
            const uniqueClientes = Array.from(
                new Set(rutas.map((ruta) => ruta.cliente || 'Desconocido')),
            )
            setClientesOptions(
                uniqueClientes.map((cliente) => ({
                    label: cliente,
                    value: cliente,
                })),
            )
        }
    }, [rutas])

    const handleClienteChange = (selectedOption: {
        label: string
        value: string
    }) => {
        const value = selectedOption.value
        setCliente(value)
        setRegion(null)
        setRutasFiltradas([])

        const rutasFiltradas = rutas.filter((ruta) => ruta.cliente === value)

        const uniqueRegiones = Array.from(
            new Set(rutasFiltradas.map((ruta) => ruta.region || 'Desconocida')),
        )

        setRegionesOptions(
            uniqueRegiones.map((reg) => ({ label: reg, value: reg })),
        )
    }

    const handleRegionChange = (selectedOption: {
        label: string
        value: string
    }) => {
        setRegion(selectedOption.value)
    }

    const handleSearch = () => {
        const resultados = rutas.filter(
            (ruta) =>
                (!cliente || ruta.cliente === cliente) &&
                (!region || ruta.region === region),
        )

        setRutasFiltradas(resultados)

        // Extraer los establecimientos de las rutas filtradas
        const establecimientosFiltrados = resultados.flatMap(
            (ruta) => ruta.establecimientos || [],
        )
        setEstablecimientos(establecimientosFiltrados)

        // Obtener la ubicación del promotor de las rutas filtradas
        const ubicacionPromotor = resultados[0]?.ubicacion_promotor || null
        setPromotorUbicacion(ubicacionPromotor)

        console.log('Resultados filtrados:', resultados)
        console.log('Establecimientos filtrados:', establecimientosFiltrados)
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Seguimiento</h1>
            <div className="flex gap-4 mb-4">
                <Select
                    className="w-48"
                    placeholder="Clientes"
                    options={clientesOptions}
                    onChange={handleClienteChange}
                />

                <Select
                    className="w-48"
                    placeholder="Regiones"
                    options={regionesOptions}
                    onChange={handleRegionChange}
                    isDisabled={!cliente}
                />

                <Button variant="solid" onClick={handleSearch}>
                    <HiOutlineSearch />
                </Button>
            </div>

            <div>
                {rutasFiltradas.length > 0 ? (
                    <ul className="border p-4 rounded-md">
                        {rutasFiltradas.map((ruta) => (
                            <li
                                key={ruta.id}
                                className="p-2 border-b last:border-0"
                            >
                                <p>
                                    <strong>Ruta:</strong> {ruta.nombre_ruta}
                                </p>
                                <p>
                                    <strong>Cliente:</strong> {ruta.cliente}
                                </p>
                                <p>
                                    <strong>Región:</strong> {ruta.region}
                                </p>
                                <p>
                                    <strong>Promotor:</strong> {ruta.promotor}
                                </p>
                            </li>
                        ))}
                        <MapComponent
                            establecimientos={establecimientos}
                            promotorUbicacion={promotorUbicacion} // Pasamos la ubicación del promotor
                        />
                    </ul>
                ) : (
                    <p className="text-gray-500">No hay resultados</p>
                )}
            </div>

            {/* Pasamos los establecimientos y la ubicación del promotor al mapa */}
        </div>
    )
}

export default Seguimiento
