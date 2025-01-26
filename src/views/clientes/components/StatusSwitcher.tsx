import { Switcher, Spinner } from '@/components/ui'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface StatusSwitcherProps {
    clienteId: string
    onStatusChange: (newStatus: boolean) => void
}

const StatusSwitcher: React.FC<StatusSwitcherProps> = ({
    clienteId,
    onStatusChange,
}) => {
    const [status, setStatus] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    // Obtener el estado inicial del cliente
    const fetchStatus = async () => {
        try {
            const clienteRef = doc(db, 'clientes', clienteId)
            const docSnap = await getDoc(clienteRef)
            if (docSnap.exists()) {
                setStatus(docSnap.data().status || false)
            } else {
                toast.error('Cliente no encontrado.')
            }
        } catch (error) {
            console.error('Error al obtener el estado del cliente:', error)
            toast.error('No se pudo obtener el estado del cliente.')
        } finally {
            setIsLoading(false)
        }
    }

    // Cambiar el estado en Firestore y en el componente
    const toggleStatus = async (checked: boolean) => {
        try {
            const clienteRef = doc(db, 'clientes', clienteId)
            await updateDoc(clienteRef, { status: checked })
            setStatus(checked)
            onStatusChange(checked) // Llamar a la función para actualizar el estado en el componente padre
            toast.success('Estado actualizado exitosamente.')
        } catch (error) {
            console.error('Error al actualizar el estado:', error)
            toast.error('Error al actualizar el estado.')
        }
    }

    useEffect(() => {
        fetchStatus()
    }, [clienteId])

    if (isLoading) {
        return <Spinner size={20} />
    }

    return (
        <Switcher
            checked={status}
            onChange={(checked) => {
                console.log('Cambio de estado:', checked) // Agregado para ver el cambio
                toggleStatus(checked)
            }}
            color="green-500"
            className="mt-4"
        />
    )
}

export default StatusSwitcher
