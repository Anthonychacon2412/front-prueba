import { Button } from '@/components/ui'
import { db } from '@/configs/firebaseAssets.config'
import { doc, updateDoc } from 'firebase/firestore'
import { useState } from 'react'

const FormularioPrueba = () => {
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)

    async function addDocument() {
        setUploading(true)
        try {
            const docRef = doc(db, 'forms-resp-prueba', 'z9W8yYcpDKGFLGJDk9G9')

            const data = {
                form_structure: {
                    categories: {
                        '0': {
                            name: 'Cervezas',
                            subcategories: {
                                '0': {
                                    name: 'Cervezas Lager',
                                    brands: {
                                        '0': {
                                            name: 'Heineken',
                                            products: {
                                                '0': {
                                                    name: 'Heineken 330ml',
                                                    questions: {
                                                        '0': {
                                                            question: 'Precio',
                                                            answer: '2.5$',
                                                        },
                                                        '1': {
                                                            question:
                                                                'Se encuentra el producto en el anaquel?',
                                                            answer: 'Sí',
                                                        },
                                                        '2': {
                                                            question:
                                                                'Cumple con el planograma?',
                                                            answer: 'Sí',
                                                        },
                                                    },
                                                },
                                                '1': {
                                                    name: 'Heineken 500ml',
                                                    questions: {
                                                        '0': {
                                                            question: 'Precio',
                                                            answer: '3.0$',
                                                        },
                                                        '1': {
                                                            question:
                                                                'Se encuentra el producto en el anaquel?',
                                                            answer: 'No',
                                                        },
                                                        '2': {
                                                            question:
                                                                'Cumple con el planograma?',
                                                            answer: 'No',
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                        '1': {
                                            name: 'Amstel',
                                            products: {
                                                '0': {
                                                    name: 'Amstel Lager 330ml',
                                                    questions: {
                                                        '0': {
                                                            question: 'Precio',
                                                            answer: '2.3$',
                                                        },
                                                        '1': {
                                                            question:
                                                                'Se encuentra el producto en el anaquel?',
                                                            answer: 'Sí',
                                                        },
                                                        '2': {
                                                            question:
                                                                'Cumple con el planograma?',
                                                            answer: 'No',
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            }

            await updateDoc(docRef, data)
            console.log('Documento actualizado correctamente!')
        } catch (error) {
            console.error('Error al actualizar el documento:', error)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Button onClick={addDocument} disabled={uploading}>
                {uploading ? 'Subiendo...' : 'Subir Datos'}
            </Button>

            <Button
                onClick={() => console.log('Descargar Imagen')}
                disabled={loading}
            >
                {loading ? 'Descargando Imagen...' : 'Descargar Imagen'}
            </Button>
        </div>
    )
}

export default FormularioPrueba
