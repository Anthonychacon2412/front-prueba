import { DataTable } from '@/components/shared'
import { Button } from '@/components/ui'
import { db } from '@/configs/firebaseAssets.config'
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
import { useParams } from 'react-router-dom'

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

    // Obtén los datos de la ruta
    const getRutaData = async () => {
        try {
            const docRef = doc(db, 'Plantilla_rutas', id!)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data()

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
                const data = doc.data()
                // Verifica si la región de los establecimientos coincide con la región de la ruta
                if (
                    rutaData &&
                    data.region === rutaData.region &&
                    data.status === 'Disponible'
                ) {
                    establecimientosDisponibles.push(data)
                }
            })

            setEstablecimientosDisponibles(establecimientosDisponibles)
        } catch (error) {
            console.error('Error al obtener establecimientos:', error)
        }
    }

    useEffect(() => {
        if (id) {
            getRutaData()
        }
    }, [id])

    useEffect(() => {
        if (rutaData) {
            getDataEstablecimientos()
        }
    }, [rutaData])

    const handleRowSelect = (checked: boolean, row: any) => {
        if (checked) {
            // Verificar si el establecimiento ya está en selectedEstablecimientos
            const isAlreadySelected = selectedEstablecimientos.some(
                (selected) => selected.uid === row.uid,
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

            const rutaRef = doc(db, 'Plantilla_rutas', id)
            const establecimientosRef = collection(rutaRef, 'Establecimientos')

            for (const establecimiento of selectedEstablecimientos) {
                // Verificar si el establecimiento ya está asignado
                const isAssigned = establecimientosAsignados.some(
                    (asignado) => asignado.uid === establecimiento.uid,
                )

                if (isAssigned) {
                    console.warn(
                        `El establecimiento ${establecimiento.nombre} ya está asignado.`,
                    )
                    continue
                }

                // Agregar el establecimiento a la ruta
                await addDoc(establecimientosRef, {
                    nombre_establecimiento: establecimiento.nombre,
                    region: establecimiento.region,
                    status: 'Asignado',
                })

                // Actualizar el campo `status` en la colección global por su ID
                const globalDocRef = doc(
                    db,
                    'establecimientos',
                    establecimiento.uid,
                )
                await updateDoc(globalDocRef, { status: 'Asignado' })
            }

            // Refrescar los datos
            await getRutaData()
            setSelectedEstablecimientos([])
            setEstablecimientosDisponibles([])
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
            <h1 className="mb-4">Asignación de Establecimientos</h1>
            <div className="mt-4 flex justify-evenly items-center">
                <div className="rounded shadow">
                    <DataTable
                        selectable
                        onCheckBoxChange={handleRowSelect}
                        columns={columns}
                        data={establecimientosDisponibles}
                    />
                </div>
                <div>
                    <Button
                        className="mr-2"
                        color="orange-400"
                        variant="solid"
                        onClick={handleAsignarEstablecimientos}
                        disabled={selectedEstablecimientos.length === 0} // Desactiva si no hay seleccionados
                    >
                        <span>Asignar</span>
                    </Button>
                </div>
                <div className="rounded shadow">
                    <h6 className="mb-2">
                        Establecimientos asignados a ruta: {rutaData?.nombre}
                    </h6>
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
