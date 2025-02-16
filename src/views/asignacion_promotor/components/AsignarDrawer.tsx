import { Button, Drawer, Select, Spinner } from '@/components/ui'
import {
    ErrorMessage,
    Field,
    Form,
    Formik,
    FormikHelpers,
    FormikValues,
} from 'formik'
import * as Yup from 'yup'
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    updateDoc,
    where,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface AsignarDrawerProps {
    isOpen: boolean
    onClose: () => void
    rutaId: string
    onRutaUpdated: () => void
}

interface FormValues {
    cliente: string
    nombre_ruta: string
    region: string
    promotor: string
}

const AsignarDrawer: React.FC<AsignarDrawerProps> = ({
    isOpen,
    onClose,
    rutaId,
    onRutaUpdated,
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [promotores, setPromotores] = useState<
        { id: string; nombre: string }[]
    >([])

    const [initialValues, setInitialValues] = useState<FormValues>({
        cliente: '',
        nombre_ruta: '',
        region: '',
        promotor: '',
    })

    const validationSchema = Yup.object({
        promotor: Yup.string().required('Debe asignar un promotor'),
    })

    const getRuta = async () => {
        try {
            const rutaRef = doc(db, 'Plantilla_rutas', rutaId)
            const docSnap = await getDoc(rutaRef)
            if (docSnap.exists()) {
                const data = docSnap.data() as FormValues
                setInitialValues({
                    cliente: data.cliente,
                    nombre_ruta: data.nombre_ruta,
                    region: data.region,
                    promotor: data.promotor || '',
                })
            } else {
                console.error('No se encontró la ruta')
            }
        } catch (error) {
            console.error('Error al obtener la ruta:', error)
        }
    }

    const getUsuarios = async () => {
        try {
            const usuariosRef = collection(db, 'usuarios')
            const q = query(usuariosRef, where('rol', '==', 'promotor'))
            const querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
                const data = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    nombre: doc.data().nombre, // Asegúrate de que 'nombre' existe en Firestore
                }))
                setPromotores(data)
            } else {
                console.error("No se encontraron usuarios con rol 'promotor'")
            }
        } catch (error) {
            console.error('Error al obtener los usuarios:', error)
        }
    }

    useEffect(() => {
        const loadData = async () => {
            if (rutaId) {
                setIsLoading(true)
                await getRuta()
                await getUsuarios()
                setIsLoading(false)
            }
        }
        loadData()
    }, [rutaId])

    if (isLoading) {
        return (
            <Drawer
                isOpen={isOpen}
                onClose={onClose}
                className="rounded-md shadow"
            >
                <div className="flex justify-center items-center h-full">
                    <Spinner size={40} />
                </div>
            </Drawer>
        )
    }

    const handleSubmit = async (
        values: FormValues & { promotor: string },
        { setSubmitting }: FormikHelpers<FormValues>,
    ) => {
        try {
            const rutaRef = doc(db, 'Plantilla_rutas', rutaId)
            await updateDoc(rutaRef, { promotor: values.promotor }) // Solo actualiza 'promotor'
            toast.success('Ruta actualizada correctamente')
            onRutaUpdated()
            onClose()
        } catch (error) {
            toast.error('Error al actualizar la ruta')
            console.error('Error:', error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Drawer isOpen={isOpen} onClose={onClose} className="rounded-md shadow">
            <div className="flex justify-between">
                <h2 className="mb-4 text-xl font-bold">Asignar Promotor</h2>
            </div>
            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, values, setFieldValue }) => (
                    <Form className="flex flex-col space-y-6">
                        <div className="space-y-4">
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Nombre cliente:
                                </label>
                                <Field
                                    type="text"
                                    name="cliente"
                                    disabled
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Nombre Ruta:
                                </label>
                                <Field
                                    type="text"
                                    name="nombre_ruta"
                                    disabled
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Región:
                                </label>
                                <Field
                                    type="text"
                                    name="region"
                                    disabled
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="font-semibold text-gray-700">
                                    Asignar Promotor:
                                </label>
                                <Select
                                    name="promotor"
                                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 transition duration-200"
                                >
                                    <option value="">
                                        Seleccione un promotor
                                    </option>
                                    {promotores.map((promotor) => (
                                        <option
                                            key={promotor.id}
                                            value={promotor.nombre}
                                        >
                                            {promotor.nombre}
                                        </option>
                                    ))}
                                </Select>
                                <ErrorMessage
                                    name="promotor"
                                    component="div"
                                    className="text-red-500 text-sm"
                                />
                            </div>
                        </div>
                        <div className="text-right mt-6">
                            <Button
                                variant="default"
                                onClick={onClose}
                                className="mr-2"
                                type="button"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="solid"
                                className="text-white hover:opacity-80"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Spinner color="white" />
                                ) : (
                                    'Asignar'
                                )}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Drawer>
    )
}

export default AsignarDrawer
