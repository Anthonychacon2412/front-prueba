import { Button } from '@/components/ui'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { useState } from 'react'

const functions = getFunctions()
const downloadImageFunction = httpsCallable(functions, 'downloadImage') // Evitamos confusión de nombres

const FormularioPrueba = () => {
    const [loading, setLoading] = useState(false)

    const handleDownloadImage = async (urlImagen: string) => {
        console.log('Descargando imagen:', urlImagen)
        setLoading(true) // Activamos el estado de carga
        try {
            const response = await downloadImageFunction({ url: urlImagen }) // Llamada correcta a Firebase Function
            console.log('Imagen descargada:', response.data)
        } catch (error) {
            console.error('Error al descargar la imagen:', error)
        } finally {
            setLoading(false) // Desactivamos el estado de carga
        }
    }

    return (
        <div>
            <Button
                onClick={() =>
                    handleDownloadImage(
                        'https://firebasestorage.googleapis.com/v0/b/tesis-mobility.firebasestorage.app/o/images%2Fl8LK3y4jkPbcujNpMakl%2Fdepositphotos_40253985-stock-photo-chocolate-sweets-on-supermarket-shelf.jpg?alt=media&token=3c468b4f-a3b7-4a33-aaa9-1091ee6516f1',
                    )
                }
                disabled={loading}
            >
                {loading ? 'Descargando Imagen...' : 'Descargar Imagen'}
            </Button>
        </div>
    )
}

export default FormularioPrueba
