import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import { toast } from 'react-toastify'
import { DataTable } from '@/components/shared'
import { ColumnDef } from '@tanstack/react-table'
import Checkbox from '@/components/ui/Checkbox'
import { Button } from '@/components/ui'
import { FaArrowLeft } from 'react-icons/fa'
import { APP_PREFIX_PATH } from '@/constants/route.constant'

const AsignacionDias = () => {
    const { id } = useParams<{ id: string }>()
    const [rutaData, setRutaData] = useState<any>(null)
    const [establecimientos, setEstablecimientos] = useState<any[]>([])
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

    const getNextWeekdayDate = (dayOfWeek: string): string => {
        const daysOfWeek: { [key: string]: number } = {
            lunes: 1,
            martes: 2,
            miercoles: 3,
            jueves: 4,
            viernes: 5,
        }

        const today = new Date()
        const currentDay = today.getDay() // Día actual (0-6)
        const targetDay = daysOfWeek[dayOfWeek.toLowerCase()] // Día objetivo (lunes=1, martes=2, etc.)

        // Calcular cuántos días faltan para el próximo día objetivo
        let daysToAdd = targetDay - currentDay
        if (daysToAdd <= 0) {
            daysToAdd += 7 // Si ya pasó el día de la semana, obtenemos el siguiente
        }

        today.setDate(today.getDate() + daysToAdd) // Establecemos la fecha al próximo día objetivo
        return today.toLocaleDateString() // Devolvemos la fecha en formato legible
    }

    const handleCheckboxChange = async (
        rowIndex: number,
        day: string,
        checked: boolean,
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const targetDate = getNextWeekdayDate(day) // Obtenemos la fecha del próximo día

        setEstablecimientos((prevState) => {
            const newState = [...prevState]
            if (!newState[rowIndex].dias) {
                newState[rowIndex].dias = {}
            }
            if (!newState[rowIndex].fechas) {
                newState[rowIndex].fechas = {}
            }

            // Asignamos el día y la fecha al establecimiento
            newState[rowIndex].dias[day] = checked
            if (checked) {
                newState[rowIndex].fechas[day] = targetDate // Guardamos la fecha del día específico
            } else {
                delete newState[rowIndex].fechas[day] // Eliminamos la fecha si el checkbox se deselecciona
            }

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

            // Actualizamos el documento con los días y las fechas
            await updateDoc(establecimientoRef, {
                dias: {
                    ...establecimiento.dias,
                    [day]: checked,
                },
                fechas: {
                    ...establecimiento.fechas,
                    [day]: checked ? targetDate : null, // Si el día está activado, asignamos la fecha del día
                },
            })

            toast.success('Día y fecha actualizados correctamente')
        } catch (error) {
            console.error('Error al actualizar el día y la fecha:', error)
            toast.error('Error al actualizar el día y la fecha')
        }
    }

    const handleAssignDays = async () => {
        const today = new Date()
        const currentDay = today.getDay() // 0 (Domingo) a 6 (Sábado)

        // Definir la secuencia de días de la semana (lunes a viernes)
        const weekDays = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes']

        // Calcular el índice de hoy dentro de los días de la semana (de lunes a viernes)
        const currentIndex =
            currentDay >= 1 && currentDay <= 5 ? currentDay - 1 : 0

        // Crear una secuencia rotada de días (lunes a viernes)
        const rotatedWeekDays = [
            ...weekDays.slice(currentIndex),
            ...weekDays.slice(0, currentIndex),
        ]

        // Limitar a solo 4 combinaciones (patrones) de días consecutivos
        const dayPatterns = [
            ['lunes', 'martes'],
            ['miércoles', 'jueves'],
            ['viernes', 'lunes'],
            ['martes', 'miércoles'],
        ]

        // Ahora actualizamos todos los establecimientos con las fechas correspondientes
        const monthDays: any = {}
        dayPatterns.forEach(([day1, day2], index) => {
            const firstDay1 = getFirstDayOfWeek(today, weekDays.indexOf(day1))
            const firstDay2 = getFirstDayOfWeek(today, weekDays.indexOf(day2))

            // Si la segunda fecha es antes que la primera, ajustamos al siguiente mes
            if (firstDay2 < firstDay1) {
                firstDay2.setMonth(firstDay2.getMonth() + 1)
            }

            monthDays[`pattern${index + 1}`] = {
                [day1]: firstDay1.toISOString().split('T')[0],
                [day2]: firstDay2.toISOString().split('T')[0],
            }
        })

        // Actualizar todos los establecimientos con las fechas correspondientes
        try {
            for (const establecimiento of establecimientos) {
                const establecimientoRef = doc(
                    db,
                    'Plantilla_rutas',
                    id!,
                    'Establecimientos',
                    establecimiento.id,
                )

                // Actualizamos las fechas de los días
                await updateDoc(establecimientoRef, {
                    dias: monthDays,
                })
            }

            toast.success('Días asignados correctamente para todo el mes')
        } catch (error) {
            console.error('Error al asignar los días:', error)
            toast.error('Error al asignar los días')
        }
    }

    // Función para obtener el primer día de la semana
    const getFirstDayOfWeek = (date: Date, dayOfWeek: number) => {
        const diff = (dayOfWeek - date.getDay() + 7) % 7
        const firstDayOfWeek = new Date(date)
        firstDayOfWeek.setDate(date.getDate() + diff)
        return firstDayOfWeek
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
            <button
                onClick={() => navigate(`${APP_PREFIX_PATH}/plantilla-rutas`)}
                className="flex items-center text-white mb-3 ml-2 px-4 py-2 bg-orange-400 rounded-lg hover:bg-orange-500 transition duration-300"
            >
                <FaArrowLeft className="mr-2" />
                <span>Volver</span>
            </button>
            <h1>Asignación de Días para la Ruta {rutaData?.nombre_ruta}</h1>
            {rutaData ? (
                <div>
                    {establecimientos.length > 0 ? (
                        <>
                            <div className="justify-end flex mb-2">
                                <Button
                                    className="w-40 ml-4 text-white hover:opacity-80"
                                    style={{ backgroundColor: '#FFA500' }}
                                    onClick={handleAssignDays}
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
