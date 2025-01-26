import { Button, Drawer, Spinner } from '@/components/ui'
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import EditMap from './EditMap'

interface EditDrawerProps {
    isOpen: boolean
    onClose: () => void
    establecimientoId: string
    onEstablecimientoUpdated: () => void
}

interface FormValues {
    nombre: string
    region: string
    ubicacion: [number, number] | null
}

const EditDrawer: React.FC<EditDrawerProps> = ({
    isOpen,
    onClose,
    establecimientoId,
    onEstablecimientoUpdated,
}) => {
    const [regiones, setRegiones] = useState<string[]>([])
    const [ubicacion, setUbicacion] = useState<[number, number] | null>(null)
    const [initialValues, setInitialValues] = useState<FormValues>({
        nombre: '',
        region: '',
        ubicacion: null,
    })

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
            const establecimientoRef = doc(
                db,
                'establecimientos',
                establecimientoId,
            )
            await updateDoc(establecimientoRef, {
                ...values,
                ubicacion,
            })
            toast.success('Establecimiento actualizado exitosamente')
            setSubmitting(false)
            onClose()
            onEstablecimientoUpdated()
        } catch (error) {
            console.error('Error al actualizar el establecimiento:', error)
            toast.error('Error al actualizar el establecimiento')
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

    const getEstablecimiento = async () => {
        try {
            const establecimientoRef = doc(
                db,
                'establecimientos',
                establecimientoId,
            )
            const docSnap = await getDoc(establecimientoRef)
            if (docSnap.exists()) {
                const data = docSnap.data()
                setInitialValues({
                    nombre: data.nombre,
                    region: data.region,
                    ubicacion: data.ubicacion,
                })
                setUbicacion(data.ubicacion)
            } else {
                console.error('No se encontró el establecimiento')
            }
        } catch (error) {
            console.error('Error al obtener el establecimiento:', error)
        }
    }

    useEffect(() => {
        getRegiones()
        if (establecimientoId) {
            getEstablecimiento()
        }
    }, [establecimientoId])

    return (
        <Drawer isOpen={isOpen} onClose={onClose} className="rounded-md shadow">
            <h2 className="mb-4 text-xl font-bold">Editar Establecimiento</h2>
            <Formik
                enableReinitialize
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
                        <div className="flex flex-col">
                            {ubicacion && (
                                <EditMap
                                    initialLocation={ubicacion}
                                    onLocationSelect={setUbicacion}
                                />
                            )}
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
                                    'Editar'
                                )}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Drawer>
    )
}

export default EditDrawer
