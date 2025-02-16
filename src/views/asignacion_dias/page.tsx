import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    doc,
    getDoc,
    collection,
    getDocs,
    updateDoc,
    setDoc,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import { toast } from 'react-toastify'
import { DataTable } from '@/components/shared'
import { ColumnDef } from '@tanstack/react-table'
import Checkbox from '@/components/ui/Checkbox'
import { Button, Calendar, Card } from '@/components/ui'
import { FaArrowLeft } from 'react-icons/fa'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import { HiChevronLeft } from 'react-icons/hi'

const AsignacionDias = () => {
    const { id } = useParams<{ id: string }>()
    const [rutaData, setRutaData] = useState<any>(null)
    const [establecimientos, setEstablecimientos] = useState<any[]>([])
    const [selectedDates, setSelectedDates] = useState<Date[]>([])

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
                            ...(doc.data() as { fechas_asignadas?: string[] }),
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
                        if (
                            est.fechas_asignadas &&
                            Array.isArray(est.fechas_asignadas)
                        ) {
                            est.fechas_asignadas.forEach((fechaStr) => {
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

    // Función para asignar la fecha seleccionada a los establecimientos
    const assignDatesToEstablishments = async () => {
        if (selectedDates.length === 0) {
            toast.error('Por favor selecciona al menos una fecha')
            return
        }

        try {
            if (!id) {
                throw new Error('ID de la ruta no proporcionado')
            }

            const rutaDocRef = doc(db, 'Plantilla_rutas', id)

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

                // Convertimos todas las fechas a string en formato ISO
                const nuevasFechas = selectedDates.map((d) => d.toISOString())

                // Fusionamos y eliminamos duplicados
                const fechasFinales = Array.from(
                    new Set([...existingDates, ...nuevasFechas]),
                )

                await setDoc(
                    estRef,
                    { fechas_asignadas: fechasFinales },
                    { merge: true },
                )
            }

            toast.success('Fechas asignadas correctamente')
        } catch (error) {
            console.error('Error al asignar las fechas:', error)
            toast.error('Error al asignar las fechas')
        }
    }

    // Función para manejar la selección de fechas
    const handleDateSelect = (date: Date | Date[]) => {
        setSelectedDates((prevDates) => {
            if (Array.isArray(date)) {
                return date // Si ya es un array, se asigna directamente
            } else {
                return [...prevDates, date] // Agrega la nueva fecha al array
            }
        })
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
                            <div className="flex justify- justify-between gap-4">
                                <div className="border border-gray-200 rounded-lg w-[25vw]">
                                    <DataTable
                                        columns={columns}
                                        data={establecimientos}
                                    />
                                </div>

                                <Card className="w-[50vw] h-[50vh]">
                                    <Calendar
                                        locale="es"
                                        multipleSelection={true} // Habilita la selección múltiple
                                        onChange={handleDateSelect}
                                        value={selectedDates}
                                    />
                                </Card>
                            </div>
                            <div className="w-full mt-6 flex justify-end items-center">
                                <Button
                                    onClick={assignDatesToEstablishments}
                                    variant="solid"
                                    // className="ml-10 bg-orange-400 text-white rounded-md shadow-md hover:bg-orange-500 active:bg-orange-600 transition duration-200 hover:opacity-80"
                                >
                                    Asignar Fechas
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
