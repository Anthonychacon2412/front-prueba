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
    doc,
    getDoc,
} from 'firebase/firestore'
import 'leaflet/dist/leaflet.css'
import { db } from '@/configs/firebaseAssets.config'

const Seguimiento = () => {
    const [cliente, setCliente] = useState<any>(null)
    const [region, setRegion] = useState<any>(null)
    const [usuario, setUsuario] = useState<any>(null)
    const [fecha, setFecha] = useState<any>(null)
    const [dataClients, setDataClients] = useState<any[]>([])
    const [dataRegion, setDataRegion] = useState<any[]>([])
    const [dataUsuarios, setDataUsuarios] = useState<any[]>([]) // Estado para usuarios

    const getClients = async () => {
        const db = getFirestore()
        const clientsCollection = collection(db, 'clientes')

        try {
            const querySnapshot = await getDocs(clientsCollection)
            const optionsClients = querySnapshot.docs.map((doc) => {
                const nombreCliente = doc.data().nombre // Ajusta 'nombre' según tu estructura de datos
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
                const nombreRegion = doc.data().nombre // Ajusta 'nombre' según tu estructura de datos
                return { value: nombreRegion, label: nombreRegion }
            })
            setDataRegion(optionsRegion)
        } catch (error) {
            console.error('Error getting regions: ', error)
        }
    }

    const getUsuarios = async (cliente: string, region: string) => {
        const usuariosCollection = collection(db, 'usuarios')

        try {
            // Consulta por cliente
            const qCliente = query(
                usuariosCollection,
                where('clientes', 'array-contains', cliente),
            )
            const querySnapshotCliente = await getDocs(qCliente)
            const usuariosPorCliente = new Set(
                querySnapshotCliente.docs.map((doc) => doc.id),
            )

            // Consulta por región
            const qRegion = query(
                usuariosCollection,
                where('regiones', 'array-contains', region),
            )
            const querySnapshotRegion = await getDocs(qRegion)
            const usuariosPorRegion = new Set(
                querySnapshotRegion.docs.map((doc) => doc.id),
            )

            // Intersección de usuarios
            const usuariosFiltradosIds = Array.from(usuariosPorCliente).filter(
                (id) => usuariosPorRegion.has(id),
            )

            // Obtener detalles de los usuarios filtrados
            const usuariosFiltrados = await Promise.all(
                usuariosFiltradosIds.map(async (id) => {
                    const docRef = doc(usuariosCollection, id)
                    const docSnap = await getDoc(docRef)
                    return { id: docSnap.id, ...docSnap.data() }
                }),
            )

            setDataUsuarios(usuariosFiltrados)
        } catch (error) {
            console.error('Error getting users: ', error)
        }
    }

    useEffect(() => {
        getClients()
        getRegiones()
    }, [])

    useEffect(() => {
        // Llama a getUsuarios cada vez que se seleccionen cliente y región
        if (cliente && region) {
            getUsuarios(cliente.value, region.value)
        } else {
            setDataUsuarios([]) // Limpia los usuarios si no hay cliente o región seleccionados
        }
    }, [cliente, region])

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
                        label: usuario.nombre || 'Sin Nombre', // Ajusta según tu estructura de datos
                    }))}
                    onChange={(value) => setUsuario(value)}
                />
                <DatePicker
                    className="relative z-20 w-48"
                    placeholder="Fecha"
                    onChange={(date) => setFecha(date)}
                />
                <Button
                    variant="solid"
                    onClick={() =>
                        console.log({ cliente, region, usuario, fecha })
                    }
                >
                    <HiOutlineSearch />
                </Button>
            </div>
            <div className="relative z-0">
                <MapComponent />
            </div>
        </div>
    )
}

export default Seguimiento
