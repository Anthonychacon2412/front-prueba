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
}

const DrawerRutas: React.FC<DrawerRutasProps> = ({
    isOpen,
    onClose,
    onRutaCreated,
}) => {
    const [regiones, setRegiones] = useState<string[]>([])
    const [clientes, setClientes] = useState<string[]>([])
    const [selectedCliente, setSelectedCliente] = useState<string>('')

    const initialValues: FormValues = {
        nombre_ruta: '',
        region: '',
    }

    const validationSchema = Yup.object({
        nombre_ruta: Yup.string().required(
            'El nombre de la ruta es obligatorio',
        ),
        region: Yup.string().required('La región es obligatoria'),
    })

    const handleSubmit = async (
        values: FormValues,
        { setSubmitting }: FormikHelpers<FormValues>,
    ) => {
        try {
            await addDoc(collection(db, 'Plantilla_rutas'), values)
            toast.success('Ruta creada exitosamente')
            setSubmitting(false)
            onClose()
            onRutaCreated()
        } catch (error) {
            console.error('Error al crear la ruta:', error)
            toast.error('Error al crear la ruta')
            setSubmitting(false)
        }
    }

    const getClientes = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'clientes'))
            const clientesList: string[] = []
            querySnapshot.forEach((doc) => {
                clientesList.push(doc.data().nombre)
            })
            setClientes(clientesList)
        } catch (error) {
            console.error('Error al obtener los clientes:', error)
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
                                Cliente:
                            </label>
                            <select
                                onChange={(
                                    e: React.ChangeEvent<HTMLSelectElement>,
                                ) => {
                                    const selectedValue = e.target.value
                                    setSelectedCliente(selectedValue)
                                    setFieldValue('nombre_ruta', selectedValue) // Rellena el nombre_ruta automáticamente
                                }}
                                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            >
                                <option value="">Seleccione un cliente</option>
                                {clientes.map((cliente, index) => (
                                    <option key={index} value={cliente}>
                                        {cliente}
                                    </option>
                                ))}
                            </select>
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
                            <label className="font-semibold text-gray-700">
                                Nombre de la ruta:
                            </label>
                            <Field
                                type="text"
                                name="nombre_ruta"
                                value={selectedCliente} // Se muestra el cliente seleccionado
                                readOnly
                                className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                            <ErrorMessage
                                name="nombre_ruta"
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

export default DrawerRutas
