import { ColumnDef, DataTable } from '@/components/shared'
import { Table } from '@/components/ui'
import TBody from '@/components/ui/Table/TBody'
import Td from '@/components/ui/Table/Td'
import Th from '@/components/ui/Table/Th'
import THead from '@/components/ui/Table/THead'
import Tr from '@/components/ui/Table/Tr'
import { db } from '@/configs/firebaseAssets.config'
import { useAppDispatch } from '@/store'
import { collection, doc, getDocs, query } from 'firebase/firestore'
import React, { useEffect, useMemo, useState } from 'react'
import { HiOutlineEye } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'

const visualizacion = () => {
    const [data, setData] = useState<any>()
    const getData = async () => {
        try {
            const q = query(collection(db, 'Rutas'))

            const querySnapshot = await getDocs(q)
            const dataDocs: any[] = [] // Crear un array para acumular los documentos

            querySnapshot.forEach((doc) => {
                dataDocs.push(doc.data()) // Agregar cada documento al array
            })

            setData(dataDocs) // Actualizar el estado con todos los documentos
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getData()
        console.log(data)
    }, [])
    const ActionColumn = ({ row }: { row: any }) => {
        const dispatch = useAppDispatch()
        const navigate = useNavigate()

        const onDetail = () => {
            console.log(row)
        }

        return (
            <div className="flex justify-end text-lg">
                <span
                    className="cursor-pointer p-2 hover:text-cyan-500"
                    onClick={onDetail}
                >
                    <HiOutlineEye />
                </span>
            </div>
        )
    }

    const columns: ColumnDef<any>[] = useMemo(
        () => [
            {
                header: 'Nombre Establecimiento',
                accessorKey: 'client',
                cell: (props) => {
                    const row = props.row.original
                    return <span>{row.establecimiento}</span>
                },
            },
            {
                header: 'Promotor',
                accessorKey: 'client',
                cell: (props) => {
                    const row = props.row.original
                    return <span>{row.promotor}</span>
                },
            },
            {
                header: 'Dia',
                accessorKey: 'client',
                cell: (props) => {
                    const row = props.row.original
                    return <span>{row.dia}</span>
                },
            },
            {
                header: 'Direccion',
                accessorKey: 'client',
                cell: (props) => {
                    const row = props.row.original
                    return <span>{row.direccion}</span>
                },
            },
            {
                header: 'mapa',
                id: 'action',
                cell: (props) => <ActionColumn row={props} />,
            },
        ],
        [],
    )

    return <DataTable columns={columns} data={data} />
}

export default visualizacion
