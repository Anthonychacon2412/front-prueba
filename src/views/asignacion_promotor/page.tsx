import { ColumnDef, DataTable } from '@/components/shared'
import { db } from '@/configs/firebaseAssets.config'
import { collection, getDocs, query } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { HiOutlinePencil } from 'react-icons/hi'
import AsignarDrawer from './components/AsignarDrawer'

const AsignacionPromotor = () => {
    const [Rutas, setRutas] = useState([])
    const [selectedRow, setSelectedRow] = useState<any | null>(null)
    const [drawerAsignarIsOpen, setDrawerAsignarIsOpen] = useState(false)

    const getrutas = async () => {
        try {
            const q = query(collection(db, 'Plantilla_rutas'))
            const querySnapshot = await getDocs(q)
            const rutas: any = []

            querySnapshot.forEach((doc) => {
                rutas.push({ id: doc.id, ...doc.data() }) // Incluye el ID del documento si lo necesitas
            })

            setRutas(rutas) // Asigna correctamente los datos obtenidos
        } catch (error) {
            console.log('Error al obtener rutas:', error)
        }
    }

    useEffect(() => {
        getrutas()
    }, [])

    const onEdit = (row: any) => {
        setSelectedRow(row)
        setDrawerAsignarIsOpen(true)
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
                header: 'Nombre Rutas',
                accessorKey: 'nombre_ruta',
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
        <>
            <h3 className="mb-4">Asignacion promotor</h3>
            <DataTable columns={columns} data={Rutas}></DataTable>
            {selectedRow && (
                <AsignarDrawer
                    isOpen={drawerAsignarIsOpen}
                    onClose={() => setDrawerAsignarIsOpen(false)}
                    rutaId={selectedRow.id}
                    onRutaUpdated={getrutas}
                />
            )}
        </>
    )
}

export default AsignacionPromotor
