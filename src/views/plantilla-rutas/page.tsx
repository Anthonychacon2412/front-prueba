import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, doc } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import { ColumnDef, DataTable } from '@/components/shared'
import { Button, Dialog, Input, Notification, toast } from '@/components/ui'
import { HiOutlineRefresh, HiOutlineSearch } from 'react-icons/hi'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'
import DrawerRutas from './drawer'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { MdOutlineAddBusiness } from 'react-icons/md'
import { BsCalendar4Week } from 'react-icons/bs'

const Plantilla_rutas = () => {
    const [data, setData] = useState<any>([])
    const [searchTerm, setSearchTerm] = useState('') // Estado del buscador
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

    // Filtrar los datos antes de paginarlos
    const filteredData = useMemo(() => {
        return data.filter((item: any) =>
            item.nombre_ruta.toLowerCase().includes(searchTerm.toLowerCase()),
        )
    }, [data, searchTerm])

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage
        const endIndex = startIndex + rowsPerPage
        return filteredData.slice(startIndex, endIndex)
    }, [filteredData, currentPage])

    const totalPages = useMemo(
        () => Math.ceil(filteredData.length / rowsPerPage),
        [filteredData, rowsPerPage],
    )

    const ActionColumn = ({ row }: { row: any }) => {
        return (
            <div className="justify-center text-lg flex">
                <span
                    className="cursor-pointer p-2 hover:text-orange-500"
                    onClick={() =>
                        navigate(`/asignacion_ruta/${row.original.id}`)
                    }
                >
                    <MdOutlineAddBusiness size={20} />
                </span>
                {row.original.hasEstablecimientos && (
                    <span
                        className="cursor-pointer p-2 hover:text-orange-500"
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
                header: 'Cliente',
                accessorKey: 'cliente',
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
                    Visualización Rutas{' '}
                    <button
                        className="p-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-all duration-200 shadow-md transform hover:scale-105 rounded-md"
                        onClick={handleRefresh}
                    >
                        <HiOutlineRefresh className="w-5 h-5 text-gray-700 hover:text-orange-500 transition-colors duration-200" />
                    </button>
                </h1>
                <div className="flex">
                    <Input
                        className="max-w-md md:w-52 md:mb-0 mb-4"
                        size="sm"
                        placeholder="Buscar Ruta"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        prefix={<HiOutlineSearch className="text-lg mb-2" />}
                    />

                    <Button
                        className="ml-2"
                        variant="solid"
                        color="orange-500"
                        onClick={() => setDrawerCreateIsOpen(true)}
                    >
                        Crear Ruta
                    </Button>
                </div>
            </div>

            {/* Tabla con datos paginados y filtrados */}
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
