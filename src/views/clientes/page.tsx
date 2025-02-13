import { ColumnDef, DataTable } from '@/components/shared'
import { Button, Dialog, Input, Spinner } from '@/components/ui'
import { db } from '@/configs/firebaseAssets.config'
import { collection, getDocs, query } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { HiOutlinePencil, HiOutlineSearch } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import CreateDrawer from './components/CreateDrawer'
import EditDrawerCliente from './components/EditDrawerCliente'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'

const Clientes = () => {
    const [data, setData] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [selectedRow, setSelectedRow] = useState<any | null>(null)
    const [drawerCreateIsOpen, setDrawerCreateIsOpen] = useState(false)
    const [drawerEditIsOpen, setDrawerEditIsOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 4

    const navigate = useNavigate()

    const getDataClientes = async () => {
        try {
            setIsLoading(true)
            const q = query(collection(db, 'clientes'))
            const querySnapshot = await getDocs(q)
            const clientes: any[] = []

            querySnapshot.forEach((doc) => {
                clientes.push({ id: doc.id, ...doc.data() })
            })

            setData(clientes)
        } catch (error) {
            console.error('Error al obtener los clientes:', error)
            toast.error('Error al obtener los clientes')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        getDataClientes()
    }, [])

    // Filtra los datos basándose en el término de búsqueda
    const filteredData = useMemo(() => {
        return data.filter((item) =>
            item.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
        )
    }, [data, searchTerm])

    // Paginación aplicada después de filtrar los datos
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage
        const endIndex = startIndex + rowsPerPage
        return filteredData.slice(startIndex, endIndex)
    }, [filteredData, currentPage])

    // Total de páginas después del filtrado
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
                <span
                    className="cursor-pointer p-2 hover:text-orange-500"
                    onClick={() => onEdit(row.original)}
                >
                    <HiOutlinePencil />
                </span>
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
                header: 'Region',
                accessorKey: 'region',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Rif',
                accessorKey: 'rif',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props: any) => {
                    const value = props.getValue()
                    const label = value ? 'Activo' : 'Inactivo'
                    const backgroundColor = value
                        ? 'rgba(144, 238, 144, 0.2)'
                        : 'rgba(255, 99, 71, 0.2)'
                    const color = value ? 'green' : 'red'
                    return (
                        <span
                            style={{
                                color,
                                backgroundColor,
                                padding: '4px 8px',
                                borderRadius: '10px',
                            }}
                        >
                            {label}
                        </span>
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
        <>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold mb-3">Clientes</h1>
                <div className="flex">
                    <Input
                        className="max-w-md md:w-52 md:mb-0 mb-4"
                        size="sm"
                        placeholder="Buscar Cliente"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        prefix={<HiOutlineSearch className="text-lg mb-2" />}
                    />
                    <Button
                        className="w-40 ml-4 bg-orange-400 text-white rounded-md shadow-md hover:bg-orange-500 active:bg-orange-600 transition duration-200 hover:opacity-80"
                        variant="solid"
                        onClick={() =>
                            !isLoading && setDrawerCreateIsOpen(true)
                        }
                        disabled={isLoading}
                    >
                        Crear Cliente
                    </Button>
                </div>
            </div>
            {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <Spinner color="orange-500" size={60} />
                </div>
            ) : (
                <>
                    <DataTable columns={columns} data={paginatedData} />
                    <div className="flex justify-center items-center space-x-2 mt-4">
                        <Button
                            icon={<FaAngleLeft />}
                            variant="plain"
                            disabled={currentPage === 1 || isLoading}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                        />
                        <span>
                            Página {currentPage} de {totalPages}
                        </span>
                        <Button
                            icon={<FaAngleRight />}
                            variant="plain"
                            disabled={currentPage === totalPages || isLoading}
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                        />
                    </div>
                </>
            )}
            <CreateDrawer
                isOpen={drawerCreateIsOpen}
                onClose={() => setDrawerCreateIsOpen(false)}
                onClienteCreated={getDataClientes}
            />
            {selectedRow && (
                <EditDrawerCliente
                    isOpen={drawerEditIsOpen}
                    onClose={() => setDrawerEditIsOpen(false)}
                    clienteId={selectedRow.id}
                    onClienteUpdated={getDataClientes}
                />
            )}
            <ToastContainer />
        </>
    )
}

export default Clientes
