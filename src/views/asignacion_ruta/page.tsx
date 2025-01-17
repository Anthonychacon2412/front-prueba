import { DataTable } from '@/components/shared'
import { Button } from '@/components/ui'
import { db } from '@/configs/firebaseAssets.config'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import { ColumnDef } from '@tanstack/react-table'

import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    updateDoc,
    where,
} from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

const AsignacionRuta = () => {
    const { id } = useParams<{ id: string }>() // Obtén el id de la URL
    const [rutaData, setRutaData] = useState<{
        nombre: string
        region: string
    } | null>(null)
    const [establecimientosAsignados, setEstablecimientosAsignados] = useState<
        any[]
    >([])
    const [establecimientosDisponibles, setEstablecimientosDisponibles] =
        useState<any[]>([])
    const [selectedEstablecimientos, setSelectedEstablecimientos] = useState<
        any[]
    >([])
    const navigate = useNavigate()

    // Obtén los datos de la ruta
    const getRutaData = async () => {
        try {
            const docRef = doc(db, 'Plantilla_rutas', `${id}`)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data()
                console.log(data)

                // Obtén la data de la subcolección "Establecimientos"
                const establecimientosRef = collection(
                    docRef,
                    'Establecimientos',
                )
                const establecimientosSnap = await getDocs(establecimientosRef)

                const asignados = establecimientosSnap.docs.map((doc) => ({
                    id: doc.id, // Incluye el ID del documento de la subcolección
                    ...doc.data(), // Incluye los datos del documento
                }))

                setRutaData({
                    nombre: data.nombre_ruta || 'Nombre desconocido',
                    region: data.region || 'Región desconocida',
                })

                setEstablecimientosAsignados(asignados)
            } else {
                console.error('No se encontró el documento')
            }
        } catch (error) {
            console.error('Error al obtener la ruta:', error)
        }
    }

    // Obtén los establecimientos
    const getDataEstablecimientos = async () => {
        try {
            const q = query(collection(db, 'establecimientos'))
            const querySnapshot = await getDocs(q)
            const establecimientosDisponibles: any[] = []

            querySnapshot.forEach((doc) => {
                const data = doc.data() // Aquí debes asegurarte que `data` contiene `region`, `status`, etc.

                // Verifica si `data` tiene las propiedades necesarias
                if (data && data.region && data.status) {
                    // Incluye el ID del documento en los datos
                    const establecimientoConId = { ...data, id: doc.id }

                    // Verifica si la región de los establecimientos coincide con la región de la ruta
                    if (
                        rutaData &&
                        data.region === rutaData.region &&
                        data.status === 'Disponible'
                    ) {
                        establecimientosDisponibles.push(establecimientoConId)
                    }
                } else {
                    console.warn(
                        'El establecimiento no tiene las propiedades necesarias: ',
                        doc.id,
                    )
                }
            })

            setEstablecimientosDisponibles(establecimientosDisponibles)
        } catch (error) {
            console.error('Error al obtener establecimientos:', error)
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                try {
                    const docRef = doc(db, 'Plantilla_rutas', `${id}`)
                    const docSnap = await getDoc(docRef)

                    if (docSnap.exists()) {
                        const data = docSnap.data()
                        console.log(data)

                        // Obtén la data de la subcolección "Establecimientos"
                        const establecimientosRef = collection(
                            docRef,
                            'Establecimientos',
                        )
                        const establecimientosSnap =
                            await getDocs(establecimientosRef)

                        const asignados = establecimientosSnap.docs.map(
                            (doc) => ({
                                id: doc.id, // Incluye el ID del documento de la subcolección
                                ...doc.data(), // Incluye los datos del documento
                            }),
                        )

                        // Actualizar el estado de rutaData
                        setRutaData({
                            nombre: data.nombre_ruta || 'Nombre desconocido',
                            region: data.region || 'Región desconocida',
                        })

                        setEstablecimientosAsignados(asignados)
                    } else {
                        console.error('No se encontró el documento')
                    }
                } catch (error) {
                    console.error('Error al obtener la ruta:', error)
                }
            }
        }

        fetchData()
    }, [id]) // Solo depende de "id"

    useEffect(() => {
        if (rutaData) {
            getDataEstablecimientos() // Llama a la función solo cuando "rutaData" se actualiza por primera vez
        }
    }, [rutaData])

    const handleRowSelect = (checked: boolean, row: any) => {
        if (checked) {
            // Verificar si el establecimiento ya está en selectedEstablecimientos
            const isAlreadySelected = selectedEstablecimientos.some(
                (selected) => selected.id === row.id,
            )

            if (!isAlreadySelected) {
                setSelectedEstablecimientos((prevSelected) => [
                    ...prevSelected,
                    row,
                ])
            } else {
                console.warn(
                    `El establecimiento ${row.nombre} ya está seleccionado.`,
                )
            }
        } else {
            setSelectedEstablecimientos((prevSelected) =>
                prevSelected.filter((item) => item.id !== row.id),
            )
        }
    }

    const handleAsignarEstablecimientos = async () => {
        try {
            if (!id) {
                console.error('ID de ruta no definido')
                return
            }

            console.log('id', id)

            const rutaRef = doc(db, 'Plantilla_rutas', id) // Referencia a la ruta
            const establecimientosRef = collection(rutaRef, 'Establecimientos') // Subcolección de Establecimientos

            for (const establecimiento of selectedEstablecimientos) {
                // Verificar si el establecimiento ya está asignado a la ruta

                console.log(
                    'establecimientosAsignados',
                    establecimientosAsignados,
                )
                const isAssigned = establecimientosAsignados.some(
                    (asignado) => {
                        console.log('asignado', asignado)
                        asignado.uid === establecimiento.uid
                    }, // Usamos uid para comparar
                )

                if (isAssigned) {
                    console.warn(
                        `El establecimiento ${establecimiento.nombre} ya está asignado.`,
                    )
                    continue // Si ya está asignado, seguimos al siguiente establecimiento
                }

                console.log(establecimiento.id)

                // Agregar el establecimiento a la subcolección "Establecimientos" de la ruta
                await addDoc(establecimientosRef, {
                    nombre_establecimiento: establecimiento.nombre,
                    region: establecimiento.region,
                    status: 'Asignado',
                    uid: establecimiento.id, // Guardamos el uid para referencia futura
                })

                // **Verificar que el documento con el `uid` existe en la colección global `establecimientos`**
                const globalDocRef = doc(
                    db,
                    'establecimientos',
                    establecimiento.id,
                ) // Usamos el `uid` para acceder al documento global
                const globalDocSnap = await getDoc(globalDocRef)

                if (!globalDocSnap.exists()) {
                    console.error(
                        `No se encontró el documento global para el establecimiento con uid: ${establecimiento.uid}`,
                    )
                    continue // Si no existe el documento, saltamos este establecimiento
                }

                // Si el documento existe, actualizamos el `status`
                await updateDoc(globalDocRef, { status: 'Asignado' })
            }

            // // Refrescar los datos después de la asignación
            await getRutaData() // Volver a cargar los datos de la ruta
            // setSelectedEstablecimientos([]) // Limpiar los establecimientos seleccionados
            // setEstablecimientosDisponibles([]) // Limpiar los establecimientos disponibles
            // setEstablecimientosAsignados([]) // Limpiar los establecimientos ya asignados
        } catch (error) {
            console.error('Error al asignar establecimientos:', error)
        }
    }

    const columns: ColumnDef<any>[] = useMemo(
        () => [
            {
                header: 'Nombre Establecimiento',
                accessorKey: 'nombre',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Región',
                accessorKey: 'region',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Estado',
                accessorKey: 'status',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
        ],
        [],
    )

    const columns1: ColumnDef<any>[] = useMemo(
        () => [
            {
                header: 'Nombre Establecimiento',
                accessorKey: 'nombre_establecimiento',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Región',
                accessorKey: 'region',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Estado',
                accessorKey: 'status',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
        ],
        [],
    )

    return (
        <>
            <button
                onClick={() => navigate(`${APP_PREFIX_PATH}/plantilla-rutas`)}
                className="flex items-center text-blue-900 mb-3 ml-2 px-4 py-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition duration-200"
            >
                <FaArrowLeft className="mr-2" />
                <span>Volver</span>
            </button>
            <h1 className="mb-4 text-2xl font-bold text-center text-gray-800">
                Asignación de Establecimientos a ruta {rutaData?.nombre}
            </h1>
            <div className="mt-4 flex justify-evenly items-center my-3">
                <div className="rounded shadow-lg p-4 bg-white h-screen">
                    <DataTable
                        selectable
                        onCheckBoxChange={handleRowSelect}
                        columns={columns}
                        data={establecimientosDisponibles}
                    />
                </div>
                <div>
                    <Button
                        className="mx-6 bg-orange-400 text-white font-semibold py-2 px-4 rounded hover:bg-orange-500 transition duration-300"
                        color="orange-400"
                        variant="solid"
                        onClick={handleAsignarEstablecimientos}
                        disabled={selectedEstablecimientos.length === 0} // Desactiva si no hay seleccionados
                    >
                        <span>Asignar</span>
                    </Button>
                </div>
                <div className="rounded shadow h-screen">
                    <DataTable
                        columns={columns1}
                        data={establecimientosAsignados}
                    />
                </div>
            </div>
        </>
    )
}

export default AsignacionRuta
