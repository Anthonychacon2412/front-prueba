import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'

const FormularioDetalle = () => {
    const [preguntas, setPreguntas] = useState<any[]>([])
    const location = useLocation()
    const params = new URLSearchParams(location.search)
    const nombreFormulario = params.get('nombre')

    useEffect(() => {
        const getFormulario = async () => {
            if (nombreFormulario) {
                try {
                    const q = query(
                        collection(db, 'formularios'),
                        where('nombre', '==', nombreFormulario),
                    )
                    const querySnapshot = await getDocs(q)

                    querySnapshot.forEach((doc) => {
                        const data = doc.data()
                        if (data.preguntas) {
                            setPreguntas(data.preguntas)
                        }
                    })
                } catch (error) {
                    console.error('Error al obtener el formulario:', error)
                }
            }
        }

        getFormulario()
    }, [nombreFormulario])

    return (
        <div className="p-6 bg-white">
            <h1 className="text-2xl font-semibold">Detalles del Formulario</h1>
            <div>
                {preguntas.length > 0 ? (
                    <pre>{JSON.stringify(preguntas, null, 2)}</pre> // Puedes reemplazar esto con tu propia lógica de visualización
                ) : (
                    <p>No se encontraron preguntas.</p>
                )}
            </div>
        </div>
    )
}

export default FormularioDetalle
