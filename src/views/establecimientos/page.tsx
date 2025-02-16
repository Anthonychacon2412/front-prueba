import { ColumnDef, DataTable } from '@/components/shared'
import { Badge, Button, Dialog, Input, Tooltip } from '@/components/ui'
import { db } from '@/configs/firebaseAssets.config'
import { collection, getDocs, query } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { HiOutlinePencil, HiOutlineSearch } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DrawerEstablecimiento from './Drawer'
import EditDrawer from './EditDrawer'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'
import { MdOutlineStore, MdOutlineStorefront } from 'react-icons/md'

const Establecimientos = () => {
    const [data, setData] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('') // Estado del buscador
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [selectedRow, setSelectedRow] = useState<any | null>(null)
    const [drawerCreateIsOpen, setDrawerCreateIsOpen] = useState(false)
    const [drawerEditIsOpen, setDrawerEditIsOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 4

    const getDataEstablecimientos = async () => {
        try {
            const q = query(collection(db, 'establecimientos'))
            const querySnapshot = await getDocs(q)
            const establecimientos: any[] = []

            querySnapshot.forEach((doc) => {
                establecimientos.push({ id: doc.id, ...doc.data() })
            })

            setData(establecimientos)
        } catch (error) {
            console.error('Error al obtener los establecimientos:', error)
            toast.error('Error al obtener los establecimientos')
        }
    }

    useEffect(() => {
        getDataEstablecimientos()
    }, [])

    // 🔹 Filtrar los datos en base al término de búsqueda
    const filteredData = useMemo(() => {
        return data.filter((item) =>
            item.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
        )
    }, [data, searchTerm])

    // 🔹 Paginación después del filtrado
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage
        const endIndex = startIndex + rowsPerPage
        return filteredData.slice(startIndex, endIndex)
    }, [filteredData, currentPage])

    const totalPages = useMemo(
        () => Math.ceil(filteredData.length / rowsPerPage),
        [filteredData],
    )

    const onEdit = (row: any) => {
        setSelectedRow(row)
        setDrawerEditIsOpen(true)
    }

    const ActionColumn = ({ row }: { row: any }) => {
        return (
            <div className="flex justify-center text-lg space-x-2">
                <Tooltip title={'Editar Establecimiento'}>
                    <span
                        className="cursor-pointer p-2 hover:text-orange-500"
                        onClick={() => onEdit(row.original)}
                    >
                        <HiOutlinePencil />
                    </span>
                </Tooltip>
            </div>
        )
    }

    const columns: ColumnDef<any>[] = useMemo(
        () => [
            {
                header: 'Nombre',
                accessorKey: 'nombre',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Región',
                accessorKey: 'region',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Estatus',
                accessorKey: 'status',
                cell: (props: any) => {
                    const value = props.getValue()
                    const label = value ? 'Disponible' : 'Inactivo'
                    const color = value ? 'green' : 'red'
                    return (
                        <div className="flex items-center">
                            <Badge
                                className="mr-2"
                                innerClass={`bg-${color}-500`}
                            />
                            <span>{label}</span>
                        </div>
                    )
                },
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
                    <MdOutlineStorefront
                        size={40}
                        className="text-amber-600 mr-4"
                    />
                    <div>
                        <h1 className="mb-0 pb-0 text-3xl">Establecimientos</h1>
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
                        placeholder="Buscar Establecimiento"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        prefix={<HiOutlineSearch className="text-lg" />}
                    />

                    <Button
                        // className="ml-4 bg-orange-400 text-white rounded-md shadow-md hover:bg-orange-500 active:bg-orange-600 transition duration-200 hover:opacity-80"
                        onClick={() => setDrawerCreateIsOpen(true)}
                        variant="solid"
                    >
                        Crear Establecimiento
                    </Button>
                </div>
            </div>

            {/* 🔹 Tabla con los resultados filtrados */}
            <DataTable columns={columns} data={paginatedData} />

            {/* 🔹 Controles de Paginación */}
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

            {/* 🔹 Drawer para crear */}
            <DrawerEstablecimiento
                isOpen={drawerCreateIsOpen}
                onClose={() => setDrawerCreateIsOpen(false)}
                onEstablecimientoCreated={getDataEstablecimientos}
            />

            {/* 🔹 Drawer para editar */}
            {selectedRow && (
                <EditDrawer
                    isOpen={drawerEditIsOpen}
                    onClose={() => setDrawerEditIsOpen(false)}
                    establecimientoId={selectedRow.id}
                    onEstablecimientoUpdated={getDataEstablecimientos}
                />
            )}

            <ToastContainer />
        </div>
    )
}

export default Establecimientos
