import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, doc } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import { ColumnDef, DataTable } from '@/components/shared'
import {
    Button,
    Dialog,
    Input,
    Notification,
    toast,
    Tooltip,
} from '@/components/ui'
import { HiOutlineRefresh, HiOutlineSearch } from 'react-icons/hi'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'
import DrawerRutas from './drawer'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { MdOutlineAddBusiness } from 'react-icons/md'
import { BsCalendar4Week } from 'react-icons/bs'
import { TbRoute } from 'react-icons/tb'

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
                <Tooltip title="Asignar Establecimientos">
                    <span
                        className="cursor-pointer p-2 hover:text-orange-500"
                        onClick={() =>
                            navigate(`/asignacion_ruta/${row.original.id}`)
                        }
                    >
                        <MdOutlineAddBusiness size={24} />
                    </span>
                </Tooltip>
                {row.original.hasEstablecimientos && (
                    <Tooltip title="Asignar Días">
                        <span
                            className="cursor-pointer p-2 hover:text-orange-500"
                            onClick={() =>
                                navigate(`/asignacion_dias/${row.original.id}`)
                            }
                        >
                            <BsCalendar4Week size={20} className="font-bold" />
                        </span>
                    </Tooltip>
                )}
            </div>
        )
    }

    const columns: ColumnDef<any>[] = useMemo(
        () => [
            {
                header: 'Nombre rutas',
                accessorKey: 'nombre_ruta',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Cliente',
                accessorKey: 'cliente',
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
                cell: (props) => <ActionColumn row={props.row} />,
            },
        ],
        [],
    )

    return (
        <div className="ml-3 p-2">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <TbRoute size={40} className="text-amber-600 mr-4" />
                    <div>
                        <h1 className="mb-0 pb-0 text-3xl">
                            Visualización de Rutas
                        </h1>
                        <span className="text-xs">
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Optio quae ratione alias?
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Input
                        // className="max-w-md md:w-52 md:mb-0 mb-4"
                        // size="sm"
                        placeholder="Buscar Ruta"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        prefix={<HiOutlineSearch className="text-lg" />}
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
        </div>
    )
}

export default Plantilla_rutas
