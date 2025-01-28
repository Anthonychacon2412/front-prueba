import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, doc } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import { ColumnDef, DataTable } from '@/components/shared'
import { Button, Dialog, Notification, toast } from '@/components/ui'
import { HiOutlineRefresh } from 'react-icons/hi'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'
import DrawerRutas from './drawer'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { MdOutlineAddBusiness } from 'react-icons/md'
import { BsCalendar4Week } from 'react-icons/bs'

const Plantilla_rutas = () => {
    const [data, setData] = useState<any>([])
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [selectedRow, setSelectedRow] = useState<any | null>(null)
    const [drawerCreateIsOpen, setDrawerCreateIsOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 4

    const navigate = useNavigate()

    const getDataFromPlantillaRutas = async () => {
        try {
            const q = query(collection(db, 'Plantilla_rutas'))
            const querySnapshot = await getDocs(q)
            const plantilla: any[] = []

            for (const docSnap of querySnapshot.docs) {
                const establecimientosRef = collection(
                    db,
                    'Plantilla_rutas',
                    docSnap.id,
                    'Establecimientos',
                )
                const establecimientosSnap = await getDocs(establecimientosRef)
                plantilla.push({
                    id: docSnap.id,
                    ...docSnap.data(),
                    hasEstablecimientos: !establecimientosSnap.empty,
                })
            }

            setData(plantilla)
        } catch (error) {
            console.error(error)
        }
    }

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage
        const endIndex = startIndex + rowsPerPage
        return data.slice(startIndex, endIndex)
    }, [data, currentPage])

    const totalPages = useMemo(
        () => (data ? Math.ceil(data.length / rowsPerPage) : 0),
        [data, rowsPerPage],
    )

    useEffect(() => {
        getDataFromPlantillaRutas()
    }, [])

    const handleRefresh = async () => {
        await getDataFromPlantillaRutas()
        toast.push(
            <Notification title="Datos actualizados">
                La tabla ha sido actualizada con éxito.
            </Notification>,
        )
    }

    const onDetail = (row: any) => {
        setSelectedRow(row)
        setIsOpen(true)
    }

    const ActionColumn = ({ row }: { row: any }) => {
        return (
            <div className="justify-center text-lg flex">
                <span
                    className="cursor-pointer p-2 hover:text-cyan-500"
                    onClick={() =>
                        navigate(`/asignacion_ruta/${row.original.id}`)
                    }
                >
                    <MdOutlineAddBusiness size={20} />
                </span>
                {row.original.hasEstablecimientos && (
                    <span
                        className="cursor-pointer p-2 hover:text-cyan-500"
                        onClick={() =>
                            navigate(`/asignacion_dias/${row.original.id}`)
                        }
                    >
                        <BsCalendar4Week />
                    </span>
                )}
            </div>
        )
    }

    const columns: ColumnDef<any>[] = useMemo(
        () => [
            {
                header: 'Nombre Rutas',
                accessorKey: 'nombre_ruta',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Region',
                accessorKey: 'region',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: '',
                id: 'action',
                cell: (props) => <ActionColumn row={props.row} />,
            },
        ],
        [],
    )

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold mb-3">
                    Visualizacion Rutas{' '}
                    <button
                        className="p-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-all duration-200 shadow-md transform hover:scale-105 rounded-md"
                        onClick={handleRefresh}
                    >
                        <HiOutlineRefresh className="w-5 h-5 text-gray-700 hover:text-orange-500 transition-colors duration-200" />
                    </button>
                </h1>

                <Button
                    className="p-2 ml-4 bg-orange-400 text-white rounded-md shadow-md hover:bg-orange-500 active:bg-orange-600 transition duration-200 hover:opacity-80"
                    onClick={() => setDrawerCreateIsOpen(true)}
                    style={{ backgroundColor: '#FFA500' }}
                >
                    Crear Ruta
                </Button>
            </div>
            {/* Pasamos paginatedData en lugar de data */}
            <DataTable columns={columns} data={paginatedData} />
            <div className="flex justify-center items-center space-x-2 mt-4">
                <Button
                    icon={<FaAngleLeft />}
                    variant="plain"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                />
                <span>
                    Página {currentPage} de {totalPages}
                </span>
                <Button
                    icon={<FaAngleRight />}
                    variant="plain"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                />
            </div>
            <DrawerRutas
                isOpen={drawerCreateIsOpen}
                onClose={() => setDrawerCreateIsOpen(false)}
                onRutaCreated={getDataFromPlantillaRutas}
            />
            <ToastContainer />
        </>
    )
}

export default Plantilla_rutas
