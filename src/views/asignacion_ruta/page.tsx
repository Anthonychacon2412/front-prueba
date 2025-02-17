import { DataTable } from '@/components/shared'
import { Button, Notification, Tabs, toast, Tooltip } from '@/components/ui'
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
    updateDoc,
    query,
    where,
} from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { HiChevronLeft, HiOutlineTrash } from 'react-icons/hi'
import { useNavigate, useParams } from 'react-router-dom'

const AsignacionRuta = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [rutaData, setRutaData] = useState<any>(null)
    const [establecimientosAsignados, setEstablecimientosAsignados] = useState<
        any[]
    >([])
    const [establecimientosDisponibles, setEstablecimientosDisponibles] =
        useState<any[]>([])
    const [selectedEstablecimientos, setSelectedEstablecimientos] = useState<
        any[]
    >([])

    // Obtiene los datos de la ruta y sus establecimientos asignados
    const fetchRutaData = async () => {
        if (!id) return
        try {
            const docRef = doc(db, 'Plantilla_rutas', id)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data()
                setRutaData({
                    nombre: data.nombre_ruta || 'Nombre desconocido',
                    region: data.region || 'Región desconocida',
                    cliente: data.cliente || 'Cliente desconocido',
                })

                const establecimientosRef = collection(
                    docRef,
                    'Establecimientos',
                )
                const establecimientosSnap = await getDocs(establecimientosRef)
                const asignados = establecimientosSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
                setEstablecimientosAsignados(asignados)
            }
        } catch (error) {
            console.error('Error al obtener la ruta:', error)
        }
    }

    // Obtiene los establecimientos disponibles
    const fetchEstablecimientosDisponibles = async () => {
        if (!rutaData) return
        try {
            const q = query(collection(db, 'establecimientos'))
            const querySnapshot = await getDocs(q)

            const disponibles = querySnapshot.docs
                .map((doc) => {
                    const data = doc.data()
                    if (
                        data.region === rutaData.region &&
                        data.cliente.some(
                            (c: { status: boolean }) => c.status === false,
                        ) &&
                        data.cliente.some(
                            (c: { nombre: string }) =>
                                c.nombre === rutaData.cliente,
                        )
                    ) {
                        return { id: doc.id, ...data }
                    }
                    return null
                })
                .filter(Boolean)

            setEstablecimientosDisponibles(disponibles)
        } catch (error) {
            console.error('Error al obtener establecimientos:', error)
        }
    }

    useEffect(() => {
        fetchRutaData()
    }, [id])

    useEffect(() => {
        if (rutaData) {
            fetchEstablecimientosDisponibles()
        }
    }, [rutaData])

    const handleDelete = async (row: any) => {
        // Verificar si rutaData está definido y no es nulo
        if (!rutaData) {
            console.warn(
                'No se puede eliminar el establecimiento porque rutaData es null o undefined',
            )
            return // Salir de la función si rutaData no está disponible
        }

        try {
            const globalDocRef = doc(db, 'establecimientos', row.uid)
            const globalDocSnap = await getDoc(globalDocRef)

            if (globalDocSnap.exists()) {
                const globalData = globalDocSnap.data()
                const updatedClientes = globalData.cliente.map(
                    (cliente: any) =>
                        cliente.nombre === rutaData.cliente
                            ? { ...cliente, status: false }
                            : cliente,
                )
                await updateDoc(globalDocRef, { cliente: updatedClientes })
            }

            const subDocRef = doc(
                db,
                `Plantilla_rutas/${id}/Establecimientos`,
                row.id,
            )
            await deleteDoc(subDocRef)

            toast.push(
                <Notification title="Mensaje" type="success">
                    Establecimiento eliminado correctamente!
                </Notification>,
            )
            fetchRutaData()
        } catch (error) {
            console.error('Error al eliminar el establecimiento:', error)
        }
    }

    const handleAsignarEstablecimientos = async () => {
        if (!id) return

        try {
            const rutaRef = doc(db, 'Plantilla_rutas', id)
            const establecimientosRef = collection(rutaRef, 'Establecimientos')

            for (const establecimiento of selectedEstablecimientos) {
                const isAssigned = establecimientosAsignados.some(
                    (asignado) => asignado.uid === establecimiento.uid,
                )

                if (isAssigned) continue

                await addDoc(establecimientosRef, {
                    nombre_establecimiento: establecimiento.nombre,
                    region: establecimiento.region,
                    ubicacion: establecimiento.ubicacion,
                    uid: establecimiento.id,
                })

                const globalDocRef = doc(
                    db,
                    'establecimientos',
                    establecimiento.id,
                )
                const globalDocSnap = await getDoc(globalDocRef)

                if (globalDocSnap.exists()) {
                    const globalData = globalDocSnap.data()
                    const updatedClientes = globalData.cliente.map(
                        (cliente: any) =>
                            cliente.nombre === rutaData.cliente
                                ? { ...cliente, status: true }
                                : cliente,
                    )
                    await updateDoc(globalDocRef, { cliente: updatedClientes })
                }
            }

            fetchRutaData()
            toast.push(
                <Notification title="Mensaje" type="success">
                    Establecimientos asignados correctamente!
                </Notification>,
            )
        } catch (error) {
            console.error('Error al asignar establecimientos:', error)
        }
    }

    const columns: ColumnDef<any>[] = useMemo(
        () => [
            { header: 'Nombre Establecimiento', accessorKey: 'nombre' },
            { header: 'Región', accessorKey: 'region' },
        ],
        [],
    )

    const ActionColumn = ({ row }: { row: any }) => (
        <div className="justify-center text-lg flex">
            <Tooltip title="Eliminar establecimiento">
                <span
                    className={`cursor-pointer p-2 hover:text-red-500 ${
                        !rutaData ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                    onClick={() => rutaData && handleDelete(row)}
                >
                    <HiOutlineTrash />
                </span>
            </Tooltip>
        </div>
    )

    const columns1: ColumnDef<any>[] = useMemo(
        () => [
            {
                header: 'Nombre Establecimiento',
                accessorKey: 'nombre_establecimiento',
            },
            { header: 'Región', accessorKey: 'region' },
            {
                header: '',
                id: 'action',
                cell: (props) => <ActionColumn row={props.row.original} />,
            },
        ],
        [],
    )

    function handleRowSelect(checked: boolean, row: any): void {
        if (checked) {
            setSelectedEstablecimientos((prev) => [...prev, row])
        } else {
            setSelectedEstablecimientos((prev) =>
                prev.filter((est) => est.id !== row.id),
            )
        }
    }

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
                            onCheckBoxChange={(checked, row) =>
                                handleRowSelect(checked, row)
                            }
                            columns={columns}
                            data={establecimientosDisponibles}
                        />
                        <div className="flex justify-end mt-4">
                            <Button
                                variant="solid"
                                color="orange-500"
                                onClick={handleAsignarEstablecimientos}
                                disabled={selectedEstablecimientos.length === 0}
                            >
                                Asignar Establecimientos
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
