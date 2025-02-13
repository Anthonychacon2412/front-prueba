import { Button, Drawer } from '@/components/ui'
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { addDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface DrawerRutasProps {
    isOpen: boolean
    onClose: () => void
    onRutaCreated: () => void
}

interface FormValues {
    nombre_ruta: string
    region: string
    cliente: string // Agregamos el campo cliente
}

const DrawerRutas: React.FC<DrawerRutasProps> = ({
    isOpen,
    onClose,
    onRutaCreated,
}) => {
    const [regionesCliente, setRegionesCliente] = useState<string[]>([])
    const [clientesData, setClientesData] = useState<
        {
            nombre: string
            region: string[]
        }[]
    >([])
    const [selectedCliente, setSelectedCliente] = useState<string>('')

    const initialValues: FormValues = {
        nombre_ruta: '',
        region: '',
        cliente: '', // Inicializamos el campo cliente
    }

    const validationSchema = Yup.object({
        nombre_ruta: Yup.string().required(
            'El nombre de la ruta es obligatorio',
        ),
        region: Yup.string().required('La región es obligatoria'),
        cliente: Yup.string().required('El cliente es obligatorio'), // Validación para cliente
    })

    const handleSubmit = async (
        values: FormValues,
        { setSubmitting }: FormikHelpers<FormValues>,
    ) => {
        try {
            const rutaData = {
                ...values,
                status: true, // Aquí agregas el campo status
            }

            await addDoc(collection(db, 'Plantilla_rutas'), rutaData)
            toast.success('Ruta creada exitosamente')
            onClose()
            onRutaCreated()
        } catch (error) {
            console.error('Error al crear la ruta:', error)
            toast.error('Error al crear la ruta')
        } finally {
            setSubmitting(false)
        }
    }

    const getClientes = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'clientes'))
            const clientesList: { nombre: string; region: string[] }[] = []

            querySnapshot.forEach((doc) => {
                const data = doc.data()
                if (data.nombre) {
                    clientesList.push({
                        nombre: data.nombre,
                        region: data.region || [],
                    })
                }
            })

            setClientesData(clientesList)
        } catch (error) {
            console.error('Error al obtener los clientes y regiones:', error)
        }
    }

    useEffect(() => {
        getClientes()
    }, [])

    return (
        <Drawer isOpen={isOpen} onClose={onClose} className="rounded-md shadow">
            <h2 className="mb-4 text-xl font-bold">Crear Ruta</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue, isSubmitting }) => (
                    <Form className="flex flex-col space-y-6">
                        <div className="flex flex-col">
                            <label className="font-semibold text-gray-700">
                                Nombre de la Ruta:
                            </label>
                            <Field
                                type="text"
                                name="nombre_ruta"
                                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 transition duration-200"
                            />
                            <ErrorMessage
                                name="nombre_ruta"
                                component="div"
                                className="text-red-600 text-sm mt-1"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="font-semibold text-gray-700">
                                Cliente:
                            </label>
                            <select
                                onChange={(e) => {
                                    const selectedValue = e.target.value
                                    setSelectedCliente(selectedValue)
                                    setFieldValue('cliente', selectedValue)

                                    // Filtrar las regiones correspondientes al cliente seleccionado
                                    const clienteData = clientesData.find(
                                        (cliente) =>
                                            cliente.nombre === selectedValue,
                                    )
                                    setRegionesCliente(
                                        clienteData?.region || [],
                                    )
                                }}
                                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 transition duration-200"
                            >
                                <option value="">Seleccione un cliente</option>
                                {clientesData.map((cliente, index) => (
                                    <option key={index} value={cliente.nombre}>
                                        {cliente.nombre}
                                    </option>
                                ))}
                            </select>

                            <ErrorMessage
                                name="cliente"
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
                                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 transition duration-200"
                            >
                                <option value="">Seleccione una región</option>
                                {regionesCliente.map((region, index) => (
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

                        {/* Botones */}
                        <div className="text-right mt-6">
                            <Button
                                type="button"
                                variant="default"
                                onClick={onClose}
                                className="mr-2"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="solid"
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

export default DrawerRutas
