import { ColumnDef, DataTable } from '@/components/shared'
import { db } from '@/configs/firebaseAssets.config'
import { collection, getDocs, query } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { HiOutlinePencil, HiOutlineSearch } from 'react-icons/hi'
import AsignarDrawer from './components/AsignarDrawer'
import { Input } from '@/components/ui'
import { LucideUserRoundPlus } from 'lucide-react'

const AsignacionPromotor = () => {
    const [Rutas, setRutas] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState<string>('') // Estado para el buscador
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

    // Filtrar rutas según el término de búsqueda
    const filteredRutas = useMemo(() => {
        return Rutas.filter(
            (ruta) =>
                ruta.nombre_ruta
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()),
        )
    }, [Rutas, searchTerm])

    const onEdit = (row: any) => {
        setSelectedRow(row)
        setDrawerAsignarIsOpen(true)
    }

    const ActionColumn = ({ row }: { row: any }) => (
        <div className="flex justify-center text-lg space-x-2">
            <span
                className="cursor-pointer p-2 hover:text-orange-500"
                onClick={() => onEdit(row.original)}
            >
                <LucideUserRoundPlus />
            </span>
        </div>
    )

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
                header: 'Promotor',
                accessorKey: 'promotor',
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
            <div className="flex justify-between">
                <h3 className="mb-4">Asignación de Promotor</h3>
                <Input
                    className="max-w-md md:w-52 md:mb-0 mb-4"
                    size="sm"
                    placeholder="Buscar Ruta"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    prefix={<HiOutlineSearch className="text-lg mb-2" />}
                />
            </div>
            <DataTable columns={columns} data={filteredRutas} />{' '}
            {/* Se usa la lista filtrada */}
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
