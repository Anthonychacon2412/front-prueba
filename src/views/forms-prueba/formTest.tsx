import { Button } from '@/components/ui'
import { db, functions } from '@/configs/firebaseAssets.config'
import { ColumnDef } from '@tanstack/react-table'
import { httpsCallable } from 'firebase/functions'
import { useEffect, useMemo, useState } from 'react'
import { collection, doc, getDocs } from 'firebase/firestore'
import { DataTable } from '@/components/shared'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'

const FormularioPrueba = () => {
    const [forms, setForms] = useState<any>()
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const getFormData = async () => {
        try {
            setLoading(true)
            const querySnapshot = await getDocs(
                collection(db, 'forms-resp-prueba'),
            )

            const documents: any[] = []
            querySnapshot.forEach((doc) => {
                documents.push({ id: doc.id, ...doc.data() })
            })

            console.log('Documents:', documents)
            setForms(documents)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching documents:', error)
        }
    }

    useEffect(() => {
        getFormData()
    }, [])

    const ActionColumn = ({ row }: { row: any }) => {
        return (
            // <div className="flex justify-center text-lg space-x-2">
            //     <span
            //         className="cursor-pointer p-2 hover:text-cyan-500"
            //         onClick={() => }
            //     >

            //     </span>
            // </div>
            <Button
                size="sm"
                onClick={() => {
                    console.log('Navigating to:', `/forms/${row.original.id}`)
                    navigate(`/forms/${row.original.id}`)
                }}
            >
                Ver detalle
            </Button>
        )
    }

    const columns: ColumnDef<any>[] = useMemo(
        () => [
            {
                header: 'Usuario',
                accessorKey: 'nombre_usuario',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Nombre Formulario',
                accessorKey: 'nombre_formulario',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Establecimiento',
                accessorKey: 'establecimiento',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Fecha Sincronizacion',
                accessorKey: 'fecha_sincronizacion',
                cell: (props: any) => (
                    <span>
                        {moment
                            .unix(
                                props.row.original.fecha_sincronizacion.seconds,
                            )
                            .format('DD/MM/YYYY hh:mm:ss')}
                    </span>
                ),
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
        <div>
            {loading ? (
                <>
                    <div>Loading...</div>
                </>
            ) : (
                <DataTable columns={columns} data={forms} />
            )}
        </div>
    )
}

export default FormularioPrueba
