import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import { toast } from 'react-toastify'
import { DataTable } from '@/components/shared'
import { ColumnDef } from '@tanstack/react-table'
import { Button, Calendar, Card } from '@/components/ui'
import { HiChevronLeft } from 'react-icons/hi'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import es from 'dayjs/locale/es'

const AsignacionDias = () => {
    const { id } = useParams<{ id: string }>()
    const [rutaData, setRutaData] = useState<any>(null)
    const [establecimientos, setEstablecimientos] = useState<any[]>([])
    const [selectedDates, setSelectedDates] = useState<Date[]>([])
    const [hasChanges, setHasChanges] = useState(false)

    const navigate = useNavigate()

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
                        (doc) => ({
                            id: doc.id,
                            nombre_establecimiento:
                                doc.data().nombre_establecimiento,
                            fechas_asignadas: doc.data().fechas_asignadas || [],
                        }),
                    )

                    console.log(
                        'Datos de los establecimientos:',
                        establecimientosList,
                    )
                    setEstablecimientos(establecimientosList)

                    // Extraer todas las fechas asignadas de todos los establecimientos
                    const fechasAsignadas: Date[] = []
                    establecimientosList.forEach((est) => {
                        if (est.fechas_asignadas) {
                            est.fechas_asignadas.forEach((fechaStr: string) => {
                                const fecha = new Date(fechaStr)
                                if (!isNaN(fecha.getTime())) {
                                    fechasAsignadas.push(fecha)
                                }
                            })
                        }
                    })

                    setSelectedDates(fechasAsignadas)
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

    // Función para manejar la selección de fechas
    const handleDateSelect = (date: Date | Date[]) => {
        setSelectedDates((prevDates) => {
            let newDates: Date[]
            if (Array.isArray(date)) {
                // Si ya es un array, se asigna directamente
                newDates = date
            } else {
                // Si la fecha ya está seleccionada, la eliminamos
                if (prevDates.some((d) => d.getTime() === date.getTime())) {
                    newDates = prevDates.filter(
                        (d) => d.getTime() !== date.getTime(),
                    )
                } else {
                    newDates = [...prevDates, date] // Agrega la nueva fecha al array
                }
            }
            setHasChanges(true)
            return newDates
        })
    }

    // Función para asignar las fechas seleccionadas a los establecimientos
    const assignDatesToEstablishments = async () => {
        if (!id) {
            toast.error('ID de la ruta no proporcionado')
            return
        }

        try {
            const rutaDocRef = doc(db, 'Plantilla_rutas', id)
            let cambiosRealizados = false // Verificará si hubo cambios

            for (const establecimiento of establecimientos) {
                const estRef = doc(
                    rutaDocRef,
                    'Establecimientos',
                    establecimiento.id,
                )
                const estSnap = await getDoc(estRef)

                let existingDates: string[] = []
                if (estSnap.exists()) {
                    existingDates = estSnap.data().fechas_asignadas || []
                }

                // Convertir selectedDates a formato de string ISO
                const nuevasFechas = selectedDates.map((d) => d.toISOString())

                // Identificar si hay cambios reales
                const fechasAgregadas = nuevasFechas.filter(
                    (fecha) => !existingDates.includes(fecha),
                )
                const fechasEliminadas = existingDates.filter(
                    (fecha) => !nuevasFechas.includes(fecha),
                )

                if (fechasAgregadas.length > 0 || fechasEliminadas.length > 0) {
                    // Actualizar Firestore solo si hubo cambios
                    const fechasActualizadas = [
                        ...existingDates.filter(
                            (fecha) => !fechasEliminadas.includes(fecha),
                        ),
                        ...fechasAgregadas,
                    ]

                    await setDoc(
                        estRef,
                        { fechas_asignadas: fechasActualizadas },
                        { merge: true },
                    )
                    cambiosRealizados = true
                }
            }

            if (cambiosRealizados) {
                toast.success('Fechas actualizadas correctamente')

                // Actualizar el estado local
                setEstablecimientos((prev) =>
                    prev.map((est) => ({
                        ...est,
                        fechas_asignadas: selectedDates.map((d) =>
                            d.toISOString(),
                        ),
                    })),
                )
                setHasChanges(false)
            } else {
                toast.info('No hubo cambios en las fechas')
            }
        } catch (error) {
            console.error('Error al asignar las fechas:', error)
            toast.error('Error al asignar las fechas')
        }
    }

    const columns: ColumnDef<any>[] = [
        {
            header: 'Nombre del Establecimiento',
            accessorKey: 'nombre_establecimiento',
            enableSorting: false,
        },
    ]

    return (
        <div className="ml-3 p-2">
            <div className="flex mb-6">
                <span
                    className="cursor-pointer p-2 hover:text-red-500 text-2xl"
                    onClick={() =>
                        navigate(`${APP_PREFIX_PATH}/plantilla-rutas`)
                    }
                >
                    <HiChevronLeft className="" />
                </span>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Asignación de días
                    </h1>
                    <span>
                        Nombre de la ruta:{' '}
                        <b className="text-black">{rutaData?.nombre_ruta}</b>
                    </span>
                </div>
            </div>
            {rutaData ? (
                <div>
                    {establecimientos.length > 0 ? (
                        <>
                            <div className="flex justify-between gap-4">
                                <div className="border border-gray-200 rounded-lg w-[25vw]">
                                    <DataTable
                                        columns={columns}
                                        data={establecimientos}
                                    />
                                </div>

                                <Card className="w-[50vw] h-[50vh]">
                                    <Calendar
                                        multipleSelection={true} // Habilita la selección múltiple
                                        onChange={handleDateSelect}
                                        value={selectedDates}
                                        locale={es}
                                    />
                                </Card>
                            </div>
                            <div className="w-full mt-6 flex justify-end items-center">
                                <Button
                                    onClick={assignDatesToEstablishments}
                                    variant="solid"
                                    disabled={!hasChanges}
                                >
                                    Actualizar Fechas
                                </Button>
                            </div>
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
