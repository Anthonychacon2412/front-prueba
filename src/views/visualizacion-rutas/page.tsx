import { ColumnDef, DataTable } from '@/components/shared'
import { Button, Dialog } from '@/components/ui'
import { collection, getDocs, query } from 'firebase/firestore'
import React, { useEffect, useMemo, useState } from 'react'
import { HiOutlineGlobe } from 'react-icons/hi'
import { db } from '@/configs/firebaseAssets.config'
import 'leaflet/dist/leaflet.css'
import MapComponent from './components/mapComponent'

const Visualizacion = () => {
    const [data, setData] = useState<any[]>([])
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [selectedRow, setSelectedRow] = useState<any | null>(null)

    const getData = async () => {
        try {
            const q = query(collection(db, 'Rutas'))
            const querySnapshot = await getDocs(q)
            const dataDocs: any[] = []

            querySnapshot.forEach((doc) => {
                dataDocs.push(doc.data())
            })

            setData(dataDocs)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getData()
    }, [])

    const onDetail = (row: any) => {
        setSelectedRow(row)
        setIsOpen(true)
    }

    const ActionColumn = ({ row }: { row: any }) => {
        return (
            <div className="flex justify-end text-lg">
                <span
                    className="cursor-pointer p-2 hover:text-cyan-500"
                    onClick={() => onDetail(row.original)}
                >
                    <HiOutlineGlobe />
                </span>
            </div>
        )
    }

    const columns: ColumnDef<any>[] = useMemo(
        () => [
            {
                header: 'Nombre Establecimiento',
                accessorKey: 'establecimiento',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Promotor',
                accessorKey: 'promotor',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Dia',
                accessorKey: 'dia',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Direccion',
                accessorKey: 'direccion',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Mapa',
                id: 'action',
                cell: (props) => <ActionColumn row={props.row} />,
            },
        ],
        [],
    )

    return (
        <>
            <h1 className="text-2xl font-semibold mb-3">
                Visualización de Rutas
            </h1>
            <DataTable columns={columns} data={data} />

            {/* Modal para Detalles del Mapa */}
            <Dialog
                isOpen={dialogIsOpen}
                onClose={() => setIsOpen(false)}
                onRequestClose={() => setIsOpen(false)}
                className="max-w-3xl w-full"
            >
                <div className="h-96">
                    {selectedRow && (
                        <MapComponent
                            promotorCoords={[
                                selectedRow.coordenadas_pro.latitude,
                                selectedRow.coordenadas_pro.longitude,
                            ]}
                            estCoords={[
                                selectedRow.coordenadas_est.latitude,
                                selectedRow.coordenadas_est.longitude,
                            ]}
                        />
                    )}
                </div>
            </Dialog>
        </>
    )
}

export default Visualizacion
