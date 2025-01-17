import { Button, Drawer } from '@/components/ui'
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { addDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface DrawerEstablecimientoProps {
    isOpen: boolean
    onClose: () => void
    onEstablecimientoCreated: () => void
}

interface FormValues {
    nombre: string
    region: string
}

const DrawerEstablecimiento: React.FC<DrawerEstablecimientoProps> = ({
    isOpen,
    onClose,
    onEstablecimientoCreated,
}) => {
    const [regiones, setRegiones] = useState<string[]>([])

    const initialValues: FormValues = {
        nombre: '',
        region: '',
    }

    const validationSchema = Yup.object({
        nombre: Yup.string().required(
            'El nombre del establecimiento es obligatorio',
        ),
        region: Yup.string().required('La región es obligatoria'),
    })

    const handleSubmit = async (
        values: FormValues,
        { setSubmitting }: FormikHelpers<FormValues>,
    ) => {
        try {
            const newEstablecimiento = {
                ...values,
                status: 'Disponible',
            }
            await addDoc(collection(db, 'establecimientos'), newEstablecimiento)
            toast.success('Establecimiento creado exitosamente')
            setSubmitting(false)
            onClose()
            onEstablecimientoCreated()
        } catch (error) {
            console.error('Error al crear el establecimiento:', error)
            toast.error('Error al crear el establecimiento')
            setSubmitting(false)
        }
    }

    const getRegiones = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'regiones'))
            const regionesList: string[] = []
            querySnapshot.forEach((doc) => {
                regionesList.push(doc.data().nombre)
            })
            setRegiones(regionesList)
        } catch (error) {
            console.error('Error al obtener las regiones:', error)
        }
    }

    useEffect(() => {
        getRegiones()
    }, [])

    return (
        <Drawer isOpen={isOpen} onClose={onClose} className="rounded-md shadow">
            <h2 className="mb-4 text-xl font-bold">Crear Establecimiento</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className="flex flex-col space-y-6">
                        <div className="flex flex-col">
                            <label className="font-semibold text-gray-700">
                                Nombre establecimiento:
                            </label>
                            <Field
                                type="text"
                                name="nombre"
                                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            />
                            <ErrorMessage
                                name="nombre"
                                component="div"
                                className="text-red-600 text-sm mt-1"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="font-semibold text-gray-700">
                                Región:
                            </label>
                            <Field
                                as="select"
                                name="region"
                                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            >
                                <option value="">Seleccione una región</option>
                                {regiones.map((region, index) => (
                                    <option key={index} value={region}>
                                        {region}
                                    </option>
                                ))}
                            </Field>
                            <ErrorMessage
                                name="region"
                                component="div"
                                className="text-red-600 text-sm mt-1"
                            />
                        </div>

                        <div className="text-right mt-6">
                            <Button
                                variant="default"
                                onClick={onClose}
                                className="mr-2"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                style={{ backgroundColor: '#000B7E' }}
                                className="text-white hover:opacity-80"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Drawer>
    )
}

export default DrawerEstablecimiento
