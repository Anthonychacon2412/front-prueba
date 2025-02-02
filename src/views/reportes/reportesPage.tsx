import { Button } from '@/components/ui'
import { functions } from '@/configs/firebaseAssets.config'
import { httpsCallable } from 'firebase/functions'
import { useState } from 'react'

const FormularioPrueba = () => {
    const [assistantResponse, setAssistantResponse] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const getOpenAIResponse = async (conversation: any) => {
        const func = httpsCallable(functions, 'getOpenAIResponse')
        const response = await func({ conversation }) // Enviar el objeto correctamente
        return response.data
    }

    const conversation = [
        { role: 'system', content: 'Eres un asistente útil.' },
        { role: 'user', content: '¿Cuánto es 2+2?' },
    ]

    const handleClick = async () => {
        setLoading(true)
        try {
            console.log(
                'Datos enviados a Firebase:',
                JSON.stringify({ conversation }, null, 2),
            ) // 🔍 Verifica los datos antes de enviar
            const response = await getOpenAIResponse({ conversation }) // ✅ Enviamos el objeto con clave 'conversation'
            console.log('Respuesta de Firebase:', response)
            setAssistantResponse(response)
        } catch (error) {
            console.error('Error al obtener respuesta:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <Button onClick={handleClick} disabled={loading}>
                {loading ? 'Cargando...' : 'Realizar consulta'}
            </Button>
            {assistantResponse && (
                <pre>{JSON.stringify(assistantResponse, null, 2)}</pre>
            )}
        </div>
    )
}

export default FormularioPrueba
