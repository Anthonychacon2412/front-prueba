import { Button, Drawer, Spinner, Switcher } from '@/components/ui'
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface EditDrawerClienteProps {
    isOpen: boolean
    onClose: () => void
    clienteId: string
    onClienteUpdated: () => void
}

interface FormValues {
    nombre: string
    region: string
    rif: string
    status: boolean
}

const EditDrawerCliente: React.FC<EditDrawerClienteProps> = ({
    isOpen,
    onClose,
    clienteId,
    onClienteUpdated,
}) => {
    const [regiones, setRegiones] = useState<string[]>([])
    const [initialValues, setInitialValues] = useState<FormValues>({
        nombre: '',
        region: '',
        rif: '',
        status: false, // Estado inicial del status
    })
    const [isLoading, setIsLoading] = useState<boolean>(true) // Estado para cargar datos

    const validationSchema = Yup.object({
        nombre: Yup.string().required('El nombre del cliente es obligatorio'),
        region: Yup.string().required('La región es obligatoria'),
        rif: Yup.string()
            .matches(
                /^[JE]-\d+$/,
                'El RIF debe comenzar con J- o E- seguido de números',
            )
            .required('El RIF es obligatorio'),
    })

    const handleSubmit = async (
        values: FormValues & { status: boolean },
        { setSubmitting }: FormikHelpers<FormValues & { status: boolean }>,
    ) => {
        try {
            const clienteRef = doc(db, 'clientes', clienteId)
            await updateDoc(clienteRef, {
                ...values,
            })
            toast.success('Cliente actualizado exitosamente')
            setSubmitting(false)
            onClose()
            onClienteUpdated()
        } catch (error) {
            console.error('Error al actualizar el cliente:', error)
            toast.error('Error al actualizar el cliente')
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

    const getCliente = async () => {
        try {
            const clienteRef = doc(db, 'clientes', clienteId)
            const docSnap = await getDoc(clienteRef)
            if (docSnap.exists()) {
                const data = docSnap.data()
                setInitialValues({
                    nombre: data.nombre,
                    region: data.region,
                    rif: data.rif,
                    status: data.status || false,
                })
            } else {
                console.error('No se encontró el cliente')
            }
        } catch (error) {
            console.error('Error al obtener el cliente:', error)
        }
    }

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true) // Iniciar carga
            await getRegiones()
            if (clienteId) {
                await getCliente()
            }
            setIsLoading(false) // Finalizar carga
        }

        loadData()
    }, [clienteId])

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

    return (
        <Drawer isOpen={isOpen} onClose={onClose} className="rounded-md shadow">
            <div className="flex justify-between">
                <h2 className="mb-4 text-xl font-bold">Editar Cliente</h2>
            </div>
            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue, isSubmitting }) => (
                    <Form className="flex flex-col space-y-6">
                        <div className="flex items-center space-x-4">
                            <label className="font-semibold text-gray-700">
                                Estado del cliente:
                            </label>
                            <Switcher
                                defaultChecked={values.status}
                                onChange={(checked) =>
                                    setFieldValue('status', checked)
                                }
                                color="green-500"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="font-semibold text-gray-700">
                                Nombre cliente:
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
                                Rif:
                            </label>
                            <Field
                                type="text"
                                name="rif"
                                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                disabled
                            />
                            <ErrorMessage
                                name="rif"
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

export default EditDrawerCliente
