import { ColumnDef, DataTable } from '@/components/shared'
import { db } from '@/configs/firebaseAssets.config'
import { collection, getDocs, query } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { HiOutlinePencil, HiOutlineSearch } from 'react-icons/hi'
import AsignarDrawer from './components/AsignarDrawer'
import { Input, Tooltip } from '@/components/ui'
import { LucideUserRoundPlus } from 'lucide-react'
import { TiUserAddOutline } from 'react-icons/ti'

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
            <Tooltip title={'Asignar promotor'}>
                <span
                    className="cursor-pointer p-2 hover:text-orange-500"
                    onClick={() => onEdit(row.original)}
                >
                    <LucideUserRoundPlus />
                </span>
            </Tooltip>
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
        <div className="ml-3 p-2">
            <div className="flex justify-between mb-6">
                <div className="flex items-center">
                    <TiUserAddOutline
                        size={40}
                        className="text-amber-600 mr-4"
                    />
                    <div>
                        <h1 className="mb-0 pb-0 text-3xl">
                            Asignacion de Promotor
                        </h1>
                        <span className="text-xs">
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Optio quae ratione alias?
                        </span>
                    </div>
                </div>
                <div>
                    <Input
                        // className="max-w-md md:w-52 md:mb-0 mb-4"
                        // size="sm"
                        placeholder="Buscar Promotor"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        prefix={<HiOutlineSearch className="text-lg" />}
                    />
                </div>
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
        </div>
    )
}

export default AsignacionPromotor
