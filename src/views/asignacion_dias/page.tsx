import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import { toast } from 'react-toastify'
import { DataTable } from '@/components/shared'
import { ColumnDef } from '@tanstack/react-table'
import Checkbox from '@/components/ui/Checkbox'
import { Button } from '@/components/ui'

const AsignacionDias = () => {
    const { id } = useParams<{ id: string }>()
    const [rutaData, setRutaData] = useState<any>(null)
    const [establecimientos, setEstablecimientos] = useState<any[]>([])

    useEffect(() => {
        const getRutaData = async () => {
            if (!id) {
                toast.error('ID de la ruta no proporcionado')
                return
            }

            try {
                const docRef = doc(db, 'Plantilla_rutas', id)
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    const data = docSnap.data()
                    console.log('Datos de la ruta:', data)

                    setRutaData({
                        nombre_ruta: data?.nombre_ruta || 'Nombre desconocido',
                        region: data?.region || 'Región desconocida',
                    })

                    // Obtener subcolección "Establecimientos"
                    const establecimientosRef = collection(
                        docRef,
                        'Establecimientos',
                    )
                    const establecimientosSnap =
                        await getDocs(establecimientosRef)
                    const establecimientosList = establecimientosSnap.docs.map(
                        (doc) => ({ id: doc.id, ...doc.data() }),
                    )
                    console.log(
                        'Datos de los establecimientos:',
                        establecimientosList,
                    )
                    setEstablecimientos(establecimientosList)
                } else {
                    console.error('No se encontró el documento')
                    toast.error('No se encontró la ruta')
                }
            } catch (error) {
                console.error('Error al obtener la ruta:', error)
                toast.error('Error al obtener la ruta')
            }
        }

        getRutaData()
    }, [id])

    const handleCheckboxChange = async (
        rowIndex: number,
        day: string,
        checked: boolean,
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setEstablecimientos((prevState) => {
            const newState = [...prevState]
            if (!newState[rowIndex].dias) {
                newState[rowIndex].dias = {}
            }
            newState[rowIndex].dias[day] = checked
            return newState
        })

        try {
            const establecimiento = establecimientos[rowIndex]
            const establecimientoRef = doc(
                db,
                'Plantilla_rutas',
                id!,
                'Establecimientos',
                establecimiento.id,
            )
            await updateDoc(establecimientoRef, {
                dias: {
                    ...establecimiento.dias,
                    [day]: checked,
                },
            })
            toast.success('Día actualizado correctamente')
        } catch (error) {
            console.error('Error al actualizar el día:', error)
            toast.error('Error al actualizar el día')
        }
    }

    const columns: ColumnDef<any>[] = [
        {
            header: 'Nombre del Establecimiento',
            accessorKey: 'nombre_establecimiento',
            enableSorting: false,
        },
        {
            header: 'Lunes',
            accessorKey: 'dias.lunes',
            enableSorting: false,
            cell: ({ row }) => (
                <Checkbox
                    checked={row.original.dias?.lunes || false}
                    onChange={(
                        checked: boolean,
                        e: React.ChangeEvent<HTMLInputElement>,
                    ) => handleCheckboxChange(row.index, 'lunes', checked, e)}
                />
            ),
        },
        {
            header: 'Martes',
            accessorKey: 'dias.martes',
            enableSorting: false,
            cell: ({ row }) => (
                <Checkbox
                    checked={row.original.dias?.martes || false}
                    onChange={(
                        checked: boolean,
                        e: React.ChangeEvent<HTMLInputElement>,
                    ) => handleCheckboxChange(row.index, 'martes', checked, e)}
                />
            ),
        },
        {
            header: 'Miércoles',
            accessorKey: 'dias.miercoles',
            enableSorting: false,
            cell: ({ row }) => (
                <Checkbox
                    checked={row.original.dias?.miercoles || false}
                    onChange={(
                        checked: boolean,
                        e: React.ChangeEvent<HTMLInputElement>,
                    ) =>
                        handleCheckboxChange(row.index, 'miercoles', checked, e)
                    }
                />
            ),
        },
        {
            header: 'Jueves',
            accessorKey: 'dias.jueves',
            enableSorting: false,
            cell: ({ row }) => (
                <Checkbox
                    checked={row.original.dias?.jueves || false}
                    onChange={(
                        checked: boolean,
                        e: React.ChangeEvent<HTMLInputElement>,
                    ) => handleCheckboxChange(row.index, 'jueves', checked, e)}
                />
            ),
        },
        {
            header: 'Viernes',
            accessorKey: 'dias.viernes',
            enableSorting: false,
            cell: ({ row }) => (
                <Checkbox
                    checked={row.original.dias?.viernes || false}
                    onChange={(
                        checked: boolean,
                        e: React.ChangeEvent<HTMLInputElement>,
                    ) => handleCheckboxChange(row.index, 'viernes', checked, e)}
                />
            ),
        },
    ]

    return (
        <div>
            <h1>Asignación de Días para la Ruta {rutaData?.nombre_ruta}</h1>
            {rutaData ? (
                <div>
                    {establecimientos.length > 0 ? (
                        <>
                            <div className="justify-end flex mb-2">
                                <Button
                                    className="w-40 ml-4 text-white hover:opacity-80"
                                    style={{ backgroundColor: '#000B7E' }}
                                    // Agrega el evento onClick para llamar a handleSaveDays
                                >
                                    Asignar Días
                                </Button>
                            </div>
                            <DataTable
                                columns={columns}
                                data={establecimientos}
                            />
                        </>
                    ) : (
                        <p>No hay establecimientos disponibles.</p>
                    )}
                </div>
            ) : (
                <p>Cargando datos de la ruta...</p>
            )}
        </div>
    )
}

export default AsignacionDias
