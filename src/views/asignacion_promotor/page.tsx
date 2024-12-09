import { ColumnDef, DataTable } from '@/components/shared'
import { db } from '@/configs/firebaseAssets.config'
import { collection, getDocs, query } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'

const AsignacionPromotor = () => {
    const [Rutas, setRutas] = useState([]) // Estado inicial como array vacío

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
    }, []) // Asegúrate de incluir las dependencias del efecto

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
        ],
        [], // Memoriza las columnas para evitar renderizados innecesarios
    )

    return (
        <>
            <h1>Aquí pones a trabajar al promotor</h1>
            <DataTable columns={columns} data={Rutas}></DataTable>
        </>
    )
}

export default AsignacionPromotor
