import { useEffect, useState } from 'react'
import { useAppSelector } from '@/store'
import { db } from '@/configs/firebaseAssets.config'
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from 'firebase/firestore'
import { Card } from '@/components/ui'
import { CgProfile } from 'react-icons/cg'

const Perfil = () => {
    const { userName, email } = useAppSelector((state: any) => state.auth.user)
    console.log('Usuario en Redux:', userName, email)

    const [userData, setUserData] = useState<{
        nombre: string
        apellido: string
        email: string
        telefono: string
        typeUser: string
    } | null>(null)

    useEffect(() => {
        if (!email) {
            console.warn('No hay email definido para buscar en Firestore')
            return
        }

        const fetchUserData = async () => {
            if (!email) return

            const usersRef = collection(db, 'usuarios') // Referencia a la colección
            const q = query(usersRef, where('email', '==', email)) // Buscar por campo 'email'

            try {
                const querySnapshot = await getDocs(q)
                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0] // Tomamos el primer resultado
                    setUserData(userDoc.data() as any)
                    console.log('Usuario encontrado:', userDoc.data())
                } else {
                    console.log(
                        'No se encontró el usuario con el email proporcionado.',
                    )
                }
            } catch (error) {
                console.error('Error obteniendo datos del usuario:', error)
            }
        }

        fetchUserData()
    }, [email]) // Se ejecuta solo cuando `email` cambia

    return (
        <div className="bg-white min-h-screen flex flex-col">
            <div className="container mx-auto p-4 flex-1">
                <div className="flex-1">
                    <h2 className="font-bold flex items-center mb-8">
                        <CgProfile className="mx-8 h-10 w-10" color="#3B82F6" />
                        Mi perfil
                    </h2>
                    <div className="flex gap-4 justify-center items-center p-6">
                        <Card className="w-full max-w-xl p-6 shadow-lg rounded-lg">
                            {userData ? (
                                <>
                                    {/* Tipo de Usuario */}
                                    <h2 className="text-2xl font-bold text-center mb-2 capitalize">
                                        <strong>Tipo de Usuario:</strong>{' '}
                                        {userData.typeUser === 'admin'
                                            ? 'Administrador'
                                            : userData.typeUser === 'Odontologo'
                                              ? 'Odontólogo'
                                              : userData.typeUser}
                                    </h2>

                                    {/* Información del Perfil */}
                                    <p className="text-center text-gray-600 mb-4">
                                        Información del perfil
                                    </p>

                                    <div className="grid grid-cols-2">
                                        {/* Datos Personales */}
                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-1 mb-4">
                                                Datos Personales:
                                            </h3>
                                            <p className="mb-2">
                                                <strong>Nombre:</strong>{' '}
                                                {userData.nombre}
                                            </p>
                                            <p>
                                                <strong>Apellido:</strong>{' '}
                                                {userData.apellido}
                                            </p>
                                        </div>

                                        {/* Datos de Contacto */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-1 mb-4">
                                                Datos de Contacto:
                                            </h3>
                                            <p className="mb-2">
                                                <strong>Email:</strong>{' '}
                                                {userData.email}
                                            </p>
                                            <p>
                                                <strong>Teléfono:</strong>{' '}
                                                {userData.telefono}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-center text-gray-500">
                                    Cargando datos...
                                </p>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Perfil
