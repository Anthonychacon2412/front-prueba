import { ColumnDef, DataTable } from '@/components/shared'
import { Button, Dialog } from '@/components/ui'
import { useAppDispatch } from '@/store'
import { collection, getDocs, query } from 'firebase/firestore'
import React, { useEffect, useMemo, useState } from 'react'
import { HiOutlineEye, HiOutlinePhotograph } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import { db } from '@/configs/firebaseAssets.config'

interface SupervisionEntry {
    pregunta: string
    respuesta: boolean | string
}

interface FotosEntry {
    foto: string // URL de la foto
}

interface Supervisiones {
    supervisor: string
    cliente: string
    establecimiento: string
    promotor: string
    fecha: string
    supervision: SupervisionEntry[]
    fotos: FotosEntry[] // Array de fotos
}

const Supervisiones = () => {
    const [data, setData] = useState<Supervisiones[]>([])
    const [dialogIsOpen, setIsOpen] = useState<{ [key: string]: boolean }>({
        respuestas: false,
        fotos: false,
    })
    const [selectedRow, setSelectedRow] = useState<Supervisiones | null>(null)

    const getData = async () => {
        try {
            const q = query(collection(db, 'supervisiones'))
            const querySnapshot = await getDocs(q)
            const dataDocs: Supervisiones[] = []

            querySnapshot.forEach((doc) => {
                dataDocs.push(doc.data() as Supervisiones)
            })

            setData(dataDocs)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getData()
    }, [])

    const openDialog = (type: string, row: Supervisiones) => {
        setSelectedRow(row)
        setIsOpen((prev) => ({ ...prev, [type]: true }))
    }

    const onDialogClose = (type: string) => {
        setIsOpen((prev) => ({ ...prev, [type]: false }))
        setSelectedRow(null)
    }

    const formatRespuesta = (respuesta: boolean | string) => {
        if (typeof respuesta === 'boolean') {
            return respuesta ? 'Sí' : 'No'
        }
        return respuesta
    }

    const ActionColumn = ({ row }: { row: Supervisiones }) => {
        const navigate = useNavigate()

        return (
            <div className="flex justify-end text-lg">
                <span
                    className="cursor-pointer p-2 hover:text-cyan-500"
                    onClick={() => openDialog('respuestas', row)}
                >
                    <HiOutlineEye />
                </span>
                <span
                    className="cursor-pointer p-2 hover:text-cyan-500"
                    onClick={() => openDialog('fotos', row)}
                >
                    <HiOutlinePhotograph />
                </span>
            </div>
        )
    }

    const columns: ColumnDef<Supervisiones>[] = useMemo(
        () => [
            {
                header: 'Supervisor',
                accessorKey: 'supervisor',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Cliente',
                accessorKey: 'cliente',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Establecimiento',
                accessorKey: 'establecimiento',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Promotor',
                accessorKey: 'promotor',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Fecha',
                accessorKey: 'fecha',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Acciones',
                id: 'action',
                cell: (props) => <ActionColumn row={props.row.original} />,
            },
        ],
        [],
    )

    return (
        <>
            <h1 className="text-2xl font-semibold mb-3">Supervisiones</h1>
            <DataTable columns={columns} data={data} />

            {/* Modal para Ver Respuestas */}
            <Dialog
                isOpen={dialogIsOpen.respuestas}
                onClose={() => onDialogClose('respuestas')}
                onRequestClose={() => onDialogClose('respuestas')}
            >
                <h5 className="mb-4">Supervision de {selectedRow?.promotor}</h5>
                {selectedRow?.supervision.length ? (
                    <div>
                        {selectedRow.supervision.map((entry, index) => (
                            <div key={index} className="mb-3">
                                <strong className="block">Pregunta:</strong>
                                <p>{entry.pregunta}</p>
                                <strong className="block mt-2">
                                    Respuesta:
                                </strong>
                                <p>{formatRespuesta(entry.respuesta)}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No hay respuestas disponibles.</p>
                )}
            </Dialog>

            {/* Modal para Ver Fotos */}
            <Dialog
                isOpen={dialogIsOpen.fotos}
                onClose={() => onDialogClose('fotos')}
                onRequestClose={() => onDialogClose('fotos')}
            >
                <h5 className="mb-4">Fotos para {selectedRow?.cliente}</h5>
                {selectedRow?.fotos.length ? (
                    <div className="grid grid-cols-2 gap-4">
                        {selectedRow.fotos.map((entry, index) => (
                            <div key={index} className="flex justify-center">
                                <img
                                    src={entry.foto}
                                    alt={`Foto ${index}`}
                                    className="max-w-full h-auto"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No hay fotos disponibles.</p>
                )}
            </Dialog>
        </>
    )
}

export default Supervisiones
