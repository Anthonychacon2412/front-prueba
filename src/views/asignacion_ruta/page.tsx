import { DataTable } from '@/components/shared'
import { Button, Notification, Tabs, toast } from '@/components/ui'
import TabContent from '@/components/ui/Tabs/TabContent'
import TabList from '@/components/ui/Tabs/TabList'
import TabNav from '@/components/ui/Tabs/TabNav'
import { db } from '@/configs/firebaseAssets.config'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import { ColumnDef } from '@tanstack/react-table'

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    updateDoc,
    where,
} from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { FaArrowLeft, FaRegEye } from 'react-icons/fa'
import { HiChevronLeft, HiOutlineTrash, HiTrash } from 'react-icons/hi'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

const AsignacionRuta = () => {
    const { id } = useParams<{ id: string }>() // Obtén el id de la URL
    const [rutaData, setRutaData] = useState<{
        nombre: string
        region: string
        cliente: string
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
                    cliente: data.cliente || 'Región desconocida',
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
            const q = query(collection(db, 'establecimientos')) // Consulta todos los establecimientos
            const querySnapshot = await getDocs(q) // Obtiene los documentos de la consulta
            const establecimientosDisponibles: any[] = [] // Array para guardar los establecimientos filtrados

            querySnapshot.forEach((doc) => {
                const data = doc.data() // Obtiene los datos del establecimiento

                // Verifica que el establecimiento tenga las propiedades necesarias
                if (data && data.region && data.status && data.cliente) {
                    const establecimientoConId = { ...data, id: doc.id } // Incluye el ID del documento

                    // Filtra los establecimientos que coinciden con la ruta
                    if (
                        rutaData &&
                        data.region === rutaData.region && // Coincide la región
                        data.cliente.some(
                            (c: { status: boolean }) => c.status === false,
                        ) &&
                        data.cliente.some(
                            (c: { nombre: string }) =>
                                c.nombre === rutaData.cliente,
                        ) // Coincide al menos un cliente en el array
                    ) {
                        establecimientosDisponibles.push(establecimientoConId) // Añade el establecimiento al array
                    }
                } else {
                    console.warn(
                        'El establecimiento no tiene las propiedades necesarias: ',
                        doc.id,
                    )
                }
            })
            console.log(
                'estacimientos disponibles',
                establecimientosDisponibles,
            )

            setEstablecimientosDisponibles(establecimientosDisponibles) // Guarda los establecimientos filtrados
        } catch (error) {
            console.error('Error al obtener establecimientos:', error)
        }
    }

    const deleteNotification = (
        <Notification title="Mesasge" type="success">
            Se elimino el establecimiento de la ruta con exito!
        </Notification>
    )

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
                        console.log('Establecimientos asignado', asignados)

                        // Actualizar el estado de rutaData
                        setRutaData({
                            nombre: data.nombre_ruta || 'Nombre desconocido',
                            region: data.region || 'Región desconocida',
                            cliente: data.cliente || 'Región desconocida',
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

    const handleDelete = async (row: any) => {
        console.log('rutaData', rutaData)
        try {
            console.log('Row recibido:', row)
            console.log('ID recibido:', id)

            // Obtener la referencia del documento global del establecimiento
            const globalDocRef = doc(db, 'establecimientos', row.uid)
            const globalDocSnap = await getDoc(globalDocRef)

            if (!globalDocSnap.exists()) {
                console.error(
                    `No se encontró el documento global para el establecimiento con uid: ${row.uid}`,
                )
                return // Si no existe, detener la ejecución
            }

            // Obtener los datos del establecimiento global
            const globalData = globalDocSnap.data()
            if (globalData && globalData.cliente) {
                // Actualizar el estado del cliente dentro del array 'cliente'
                const updatedClientes = globalData.cliente.map(
                    (cliente: any) => {
                        if (cliente.nombre === rutaData?.cliente) {
                            return { ...cliente, status: false } // Cambiar el status a 'false' (o lo que corresponda)
                        }
                        return cliente
                    },
                )

                // Actualizar el documento con el nuevo array de clientes
                await updateDoc(globalDocRef, { cliente: updatedClientes })
            }

            // Referencia al subdocumento dentro de la ruta
            const subDocRef = doc(
                db,
                `Plantilla_rutas/${id}/Establecimientos`,
                row.id,
            )
            console.log('Referencia del subdocumento creada:', subDocRef)

            await deleteDoc(subDocRef).then(() => {
                toast.push(deleteNotification)
            })
            console.log('Subdocumento eliminado.')

            getRutaData() // Recargar datos de la ruta
        } catch (error) {
            console.error('Error en handleDelete:', error)
        }
    }

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

    const toastNotification = (
        <Notification title="Mesasge" type="success">
            Se asigno el establecimiento con exito!
        </Notification>
    )
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
                        return asignado.uid === establecimiento.uid
                    },
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
                    ubicacion: establecimiento.ubicacion,

                    uid: establecimiento.id, // Guardamos el uid para referencia futura
                }).then((resp) => {
                    toast.push(toastNotification)
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

                // Obtener los datos del establecimiento global
                const globalData = globalDocSnap.data()
                if (globalData && globalData.cliente) {
                    // Encontrar el cliente dentro del array
                    const updatedClientes = globalData.cliente.map(
                        (cliente: any) => {
                            if (cliente.nombre === rutaData?.cliente) {
                                // Si el cliente coincide con el que se está asignando, actualizar su status
                                return { ...cliente, status: true } // Cambiar el status a 'true' (o lo que corresponda)
                            }
                            return cliente // De lo contrario, mantener el cliente sin cambios
                        },
                    )

                    // Actualizar el documento con el nuevo array de clientes
                    await updateDoc(globalDocRef, { cliente: updatedClientes })
                }
            }

            await getRutaData() // Volver a cargar los datos de la ruta
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
        ],
        [],
    )

    const ActionColumn = ({ row }: { row: any }) => {
        console.log('row', row)
        return (
            <div className="justify-center text-lg flex">
                <span
                    className="cursor-pointer p-2 hover:text-red-500"
                    onClick={
                        () => handleDelete(row) // Llama a la función `handleDelete` con el ID del establecimiento
                    }
                >
                    <HiOutlineTrash />
                </span>
            </div>
        )
    }

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
                header: '',
                id: 'action',
                cell: (props) => <ActionColumn row={props.row.original} />,
            },
        ],
        [],
    )

    return (
        <>
            <div className="flex mb-6">
                <span
                    className="cursor-pointer p-2 hover:text-red-500 text-2xl"
                    onClick={() =>
                        navigate(`${APP_PREFIX_PATH}/plantilla-rutas`)
                    }
                >
                    <HiChevronLeft className="mr-2" />
                </span>
                <div>
                    <h1 className=" text-2xl font-bold text-center text-gray-800">
                        Asignación de establecimientos
                    </h1>
                    <span>
                        Nombre de la ruta:{' '}
                        <b className="text-black">{rutaData?.nombre}</b>
                    </span>
                </div>
            </div>

            <Tabs defaultValue="tab1" variant="pill">
                <TabList>
                    <TabNav value="tab1">Establecimientos Disponibles</TabNav>
                    <TabNav value="tab2">Establecimientos Asignados</TabNav>
                </TabList>
                <div className="p-4">
                    <TabContent value="tab1">
                        <DataTable
                            selectable
                            onCheckBoxChange={handleRowSelect}
                            columns={columns}
                            data={establecimientosDisponibles}
                        />
                        <div className="flex justify-end mt-4">
                            <Button
                                className="bg-orange-400 text-white font-semibold py-2 px-6 rounded-lg shadow hover:bg-orange-500 transition duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                color="orange-400"
                                variant="solid"
                                onClick={handleAsignarEstablecimientos}
                                disabled={selectedEstablecimientos.length === 0}
                            >
                                <span>Asignar Establecimientos</span>
                            </Button>
                        </div>
                    </TabContent>
                    <TabContent value="tab2">
                        <DataTable
                            columns={columns1}
                            data={establecimientosAsignados}
                        />
                    </TabContent>
                </div>
            </Tabs>
        </>
    )
}

export default AsignacionRuta
