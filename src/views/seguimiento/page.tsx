import { Button, DatePicker, Select } from '@/components/ui'
import React, { useEffect, useState } from 'react'
import { HiOutlineSearch } from 'react-icons/hi'
import MapComponent from './components/mapComponent'
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
} from 'firebase/firestore'
import 'leaflet/dist/leaflet.css'
import { db } from '@/configs/firebaseAssets.config'
import moment from 'moment'

const Seguimiento = () => {
    const [cliente, setCliente] = useState<any>(null)
    const [region, setRegion] = useState<any>(null)
    const [usuario, setUsuario] = useState<any>(null)
    const [fecha, setFecha] = useState<any>(null)
    const [dataClients, setDataClients] = useState<any[]>([])
    const [dataRegion, setDataRegion] = useState<any[]>([])
    const [dataUsuarios, setDataUsuarios] = useState<any[]>([])
    const [mapData, setMapData] = useState<any[]>([]) // Estado para datos del mapa

    const getClients = async () => {
        const db = getFirestore()
        const clientsCollection = collection(db, 'clientes')

        try {
            const querySnapshot = await getDocs(clientsCollection)
            const optionsClients = querySnapshot.docs.map((doc) => {
                const nombreCliente = doc.data().nombre
                return { value: nombreCliente, label: nombreCliente }
            })
            setDataClients(optionsClients)
        } catch (error) {
            console.error('Error getting clients: ', error)
        }
    }

    const getRegiones = async () => {
        const db = getFirestore()
        const regionCollection = collection(db, 'regiones')

        try {
            const querySnapshot = await getDocs(regionCollection)
            const optionsRegion = querySnapshot.docs.map((doc) => {
                const nombreRegion = doc.data().nombre
                return { value: nombreRegion, label: nombreRegion }
            })
            setDataRegion(optionsRegion)
        } catch (error) {
            console.error('Error getting regions: ', error)
        }
    }

    const getUsuarios = async (cliente: any, region: any) => {
        const db = getFirestore()
        const usuariosCollection = collection(db, 'usuarios')

        const q = query(
            usuariosCollection,
            where('cliente', '==', cliente),
            where('region', '==', region),
        )

        try {
            const querySnapshot = await getDocs(q)
            const usuariosFiltrados = querySnapshot.docs.map((doc) => {
                return { id: doc.id, ...doc.data() }
            })
            setDataUsuarios(usuariosFiltrados)
        } catch (error) {
            console.error('Error getting users: ', error)
        }
    }

    const getFormularios = async (usuarioNombre: string, fecha: Date) => {
        const db = getFirestore()
        const formulariosCollection = collection(db, 'formularios_llenos')

        try {
            const q = query(
                formulariosCollection,
                where('promotor', '==', usuarioNombre),
                where(
                    'fecha_sincronizado',
                    '==',
                    moment(fecha).format('YYYY-MM-DD'),
                ),
            )
            const querySnapshot = await getDocs(q)
            return querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
        } catch (error) {
            console.error('Error getting formularios: ', error)
            return []
        }
    }

    const getActivaciones = async (usuarioNombre: string, fecha: Date) => {
        const db = getFirestore()
        const activacionCollection = collection(db, 'activacion')

        try {
            const q = query(
                activacionCollection,
                where('nombre', '==', usuarioNombre),
                where(
                    'fecha_activacion',
                    '==',
                    moment(fecha).format('YYYY-MM-DD'),
                ),
            )
            const querySnapshot = await getDocs(q)
            return querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
        } catch (error) {
            console.error('Error getting activaciones: ', error)
            return []
        }
    }

    const combineData = (formularios: any, activaciones: any) => {
        return formularios.map((formulario: any) => {
            const activacion = activaciones.find(
                (act: { nombre: any }) => act.nombre === formulario.promotor,
            )
            return {
                ...formulario,
                coordenadas: {
                    sincronizado: formulario.coordenadas,
                    fin: activacion?.coordenadas?.fin,
                    inicio: activacion?.coordenadas?.inicio,
                },
                fechas: {
                    sincronizado: formulario.fecha_sincronizado,
                    activacion: activacion?.fecha_activacion,
                },
            }
        })
    }

    useEffect(() => {
        getClients()
        getRegiones()
    }, [])

    useEffect(() => {
        if (cliente && region) {
            getUsuarios(cliente.value, region.value)
        } else {
            setDataUsuarios([])
        }
    }, [cliente, region])

    const handleSearch = async () => {
        if (usuario && fecha) {
            const formularios = await getFormularios(usuario.label, fecha)
            const activaciones = await getActivaciones(usuario.label, fecha)
            const combinedData = combineData(formularios, activaciones)
            setMapData(combinedData) // Almacena los datos combinados para usarlos en el mapa
            console.log('Datos combinados:', combinedData)
        } else {
            console.warn('Por favor selecciona un usuario y una fecha.')
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Seguimiento</h1>
            <div className="flex justify-between relative z-10 mb-4">
                <Select
                    className="relative z-20 w-48"
                    placeholder="Clientes"
                    options={dataClients}
                    onChange={(value) => setCliente(value)}
                />
                <Select
                    className="relative z-20 w-48"
                    placeholder="Región"
                    options={dataRegion}
                    onChange={(value) => setRegion(value)}
                />
                <Select
                    className="relative z-20 w-48"
                    placeholder="Usuario"
                    options={dataUsuarios.map((usuario) => ({
                        value: usuario.id,
                        label: usuario.nombre,
                    }))}
                    onChange={(value) => setUsuario(value)}
                />
                <DatePicker
                    className="relative z-20 w-48"
                    placeholder="Fecha"
                    onChange={(date) => setFecha(date)}
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
