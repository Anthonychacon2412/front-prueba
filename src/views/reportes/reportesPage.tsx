import { Button } from '@/components/ui'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { useState } from 'react'

const functions = getFunctions()
const getOpenAIResponse = httpsCallable(functions, 'getOpenAIResponse')

const FormularioPrueba = () => {
    const [assistantResponse, setAssistantResponse] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const realizarConsulta = async () => {
        setLoading(true)

        try {
            console.log('Hice la consulta')
            const conversation = [
                {
                    role: 'system',
                    content:
                        'JSON. Eres el encargado de crear itinerarios de viajes',
                },
                {
                    role: 'user',
                    content: `JSON. Hola, necesito ayuda para crear un itinerario de viaje para un grupo de 10 personas. ¿Puedes ayudarme?`,
                },
            ]
            console.log(conversation)
            const response = await getOpenAIResponse({ conversation })

            console.log(response.data)
        } catch (error) {
            console.error('Error:', error)
            alert(
                'Ocurrió un error al procesar la solicitud. Por favor, inténtalo de nuevo.',
            )
        } finally {
            setLoading(false)
        }
    }

    const downloadImage = async (urlImagen: any) => {
        try {
            const response = await fetch(
                `https://downloadimages-ozzehddkba-uc.a.run.app/?url=${urlImagen}`,
            )

            if (!response.ok) {
                throw new Error('No se pudo descargar la imagen')
            }

            // Convertir la respuesta en un blob
            const blob = await response.blob()

            // Crear una URL de objeto para mostrar la imagen
            const imageUrl = URL.createObjectURL(blob)

            // Asignar la imagen a un elemento <img>
            // document.getElementById("miImagen").src = imageUrl;
        } catch (error) {
            console.error('Error al descargar la imagen:', error)
        }
    }

    return (
        <div>
            <Button onClick={() => realizarConsulta()} disabled={loading}>
                {loading ? 'Cargando...' : 'Realizar consulta'}
            </Button>
            <Button
                onClick={() =>
                    downloadImage(
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Eiche_bei_Graditz.jpg/640px-Eiche_bei_Graditz.jpgs',
                    )
                }
                disabled={loading}
            >
                {loading ? 'Descargando Imagen...' : 'Descargar Imagen'}
            </Button>
            {assistantResponse && (
                <pre>{JSON.stringify(assistantResponse, null, 2)}</pre>
            )}
        </div>
    )
}

export default FormularioPrueba
