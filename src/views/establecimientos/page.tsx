import { ColumnDef, DataTable } from '@/components/shared'
import { Button, Dialog } from '@/components/ui'
import { db } from '@/configs/firebaseAssets.config'
import { collection, getDocs, query } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { HiOutlinePlusSm, HiOutlinePencil } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DrawerEstablecimiento from './Drawer'
import EditDrawer from './EditDrawer'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'

const Establecimientos = () => {
    const [data, setData] = useState<any[]>([])

    const [dialogIsOpen, setIsOpen] = useState(false)
    const [selectedRow, setSelectedRow] = useState<any | null>(null)
    const [drawerCreateIsOpen, setDrawerCreateIsOpen] = useState(false)
    const [drawerEditIsOpen, setDrawerEditIsOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 4

    const navigate = useNavigate()

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

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage
        const endIndex = startIndex + rowsPerPage
        return data.slice(startIndex, endIndex)
    }, [data, currentPage])

    // Calcula el número total de páginas
    const totalPages = useMemo(
        () => (data ? Math.ceil(data.length / rowsPerPage) : 0),
        [data, rowsPerPage],
    )

    const onDetail = (row: any) => {
        setSelectedRow(row)
        setIsOpen(true)
    }

    const onEdit = (row: any) => {
        setSelectedRow(row)
        setDrawerEditIsOpen(true)
    }

    const ActionColumn = ({ row }: { row: any }) => {
        return (
            <div className="flex justify-center text-lg space-x-2">
                <span
                    className="cursor-pointer p-2 hover:text-cyan-500"
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
                header: 'Status',
                accessorKey: 'status',
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
                    Establecimientos
                </h1>
                <Button
                    className="ml-4 bg-orange-400 text-white rounded-md shadow-md hover:bg-orange-500 active:bg-orange-600 transition duration-200 hover:opacity-80"
                    onClick={() => setDrawerCreateIsOpen(true)}
                    variant="solid"
                >
                    Crear Establecimiento
                </Button>
            </div>
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
            <DrawerEstablecimiento
                isOpen={drawerCreateIsOpen}
                onClose={() => setDrawerCreateIsOpen(false)}
                onEstablecimientoCreated={getDataEstablecimientos}
            />
            {selectedRow && (
                <EditDrawer
                    isOpen={drawerEditIsOpen}
                    onClose={() => setDrawerEditIsOpen(false)}
                    establecimientoId={selectedRow.id}
                    onEstablecimientoUpdated={getDataEstablecimientos}
                />
            )}
            <ToastContainer />
        </>
    )
}

export default Establecimientos
