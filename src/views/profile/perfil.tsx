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
import { Avatar, Card, FormItem, Input } from '@/components/ui'
import { CgProfile } from 'react-icons/cg'
import { HiOutlineUserCircle } from 'react-icons/hi'

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
    }, [email])

    function getInitials(name: string): string {
        return name.match(/(\b\S)?/g)?.join('') ?? ''
    }

    const initials = userData?.nombre ? getInitials(userData?.nombre) : '' // Se ejecuta solo cuando `email` cambia

    return (
        <div className="ml-3 p-2">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <HiOutlineUserCircle
                        size={40}
                        className="text-amber-600 mr-4"
                    />
                    <div>
                        <h1 className="mb-0 pb-0 text-3xl">Mi perfil</h1>
                        <span className="text-xs">
                            Bienvenido a tu perfil. Aquí puedes ver visualizar
                            tu información personal
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex gap-4  items-center p-6">
                <div
                    className="relative inline-block"
                    style={{
                        width: '90px',
                        height: '90px',
                        padding: '2px',
                        background:
                            'linear-gradient(45deg, #f1c40f, #f39c12, #e67e22, #d35400)',
                        borderRadius: '50%',
                    }}
                >
                    <div
                        className="w-full h-full rounded-full bg-white flex items-center justify-center"
                        style={{
                            width: 'calc(100% - 4px)',
                            height: 'calc(100% - 4px)',
                            margin: '2px',
                        }}
                    >
                        <span className="text-xl font-bold text-[#af601a]">
                            {initials}
                        </span>
                    </div>
                </div>

                <div>
                    <h2>{userData?.nombre}</h2>
                    <p className="text-xl">
                        Rol:{' '}
                        <span className="font-bold capitalize">
                            {userData?.rol}
                        </span>
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mx-20">
                <FormItem label="Correo electrónico">
                    <Input
                        readOnly
                        value={userData?.email}
                        className="cursor-not-allowed"
                    />
                </FormItem>
                <FormItem label="Cliente">
                    <Input
                        readOnly
                        value={userData?.cliente}
                        className="cursor-not-allowed"
                    />
                </FormItem>
                <FormItem label="Región">
                    <Input
                        readOnly
                        value={userData?.region}
                        className="cursor-not-allowed"
                    />
                </FormItem>
                <FormItem label="Teléfono">
                    <Input
                        readOnly
                        value={userData?.telefono}
                        className="cursor-not-allowed"
                    />
                </FormItem>
            </div>
        </div>
    )
}

export default Perfil
