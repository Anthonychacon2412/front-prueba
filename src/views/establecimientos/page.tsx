import { ColumnDef, DataTable } from '@/components/shared'
import { Button, Dialog } from '@/components/ui'
import { db } from '@/configs/firebaseAssets.config'
import { collection, getDocs, query } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { HiOutlinePlusSm } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DrawerEstablecimiento from './Drawer'

const Establecimientos = () => {
    const [data, setData] = useState<any>()
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [selectedRow, setSelectedRow] = useState<any | null>(null)
    const [drawerCreateIsOpen, setDrawerCreateIsOpen] = useState(false)

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

    const onDetail = (row: any) => {
        setSelectedRow(row)
        setIsOpen(true)
    }

    const ActionColumn = ({ row }: { row: any }) => {
        return (
            <div className="justify-center text-lg">
                <span
                    className="cursor-pointer p-2 hover:text-cyan-500"
                    onClick={() =>
                        navigate(`/asignacion_ruta/${row.original.id}`)
                    }
                >
                    <HiOutlinePlusSm />
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
                    className="w-40 ml-4 text-white hover:opacity-80"
                    style={{ backgroundColor: '#000B7E' }}
                    onClick={() => setDrawerCreateIsOpen(true)}
                >
                    Crear Establecimiento
                </Button>
            </div>
            <DataTable columns={columns} data={data} />
            <DrawerEstablecimiento
                isOpen={drawerCreateIsOpen}
                onClose={() => setDrawerCreateIsOpen(false)}
                onEstablecimientoCreated={getDataEstablecimientos} // Renombrado para mayor claridad
            />
            <ToastContainer />
        </>
    )
}

export default Establecimientos
