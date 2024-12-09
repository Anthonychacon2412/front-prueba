import { ColumnDef, DataTable } from '@/components/shared'
import { Dialog } from '@/components/ui'
import { db } from '@/configs/firebaseAssets.config'
import { collection, getDocs, query } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { HiOutlinePlusSm } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'

const Plantilla_rutas = () => {
    const [data, setData] = useState<any>()
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [selectedRow, setSelectedRow] = useState<any | null>(null)

    const navigate = useNavigate()

    const getDataFromPlantillaRutas = async () => {
        try {
            const q = query(collection(db, 'Plantilla_rutas'))
            const querySnapshot = await getDocs(q)
            const plantilla: any[] = []

            querySnapshot.forEach((doc) => {
                plantilla.push({ id: doc.id, ...doc.data() }) // Incluye el ID del documento si lo necesitas
            })

            setData(plantilla)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getDataFromPlantillaRutas()
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
                    } // Pasa el id
                >
                    <HiOutlinePlusSm />
                </span>
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
            <h1 className="text-2xl font-semibold mb-3">Plantilla Rutas</h1>
            <DataTable columns={columns} data={data} />
        </>
    )
}

export default Plantilla_rutas
