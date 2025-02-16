import {
    Button,
    Drawer,
    Input,
    InputGroup,
    Select,
    Spinner,
} from '@/components/ui'
import {
    ErrorMessage,
    Field,
    Form,
    Formik,
    FormikHelpers,
    useFormikContext,
} from 'formik'
import * as Yup from 'yup'
import { addDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface CreateDrawerProps {
    isOpen: boolean
    onClose: () => void
    onClienteCreated: () => void
}

interface FormValues {
    nombre: string
    region: string
    rif: string
}

const CreateDrawer: React.FC<CreateDrawerProps> = ({
    isOpen,
    onClose,
    onClienteCreated,
}) => {
    const [regiones, setRegiones] = useState<string[]>([])

    const initialValues: FormValues = {
        nombre: '',
        rif: '',
        region: '',
    }
    const options1 = [
        { value: 'J-', label: 'J-' },
        { value: 'E-', label: 'E-' },
    ]

    const validationSchema = Yup.object({
        nombre: Yup.string().required('El nombre del cliente es obligatorio'),
        rif: Yup.string()
            .matches(
                /^[JE]-\d+$/,
                'El RIF debe comenzar con J- o E- seguido de números',
            )
            .required('El RIF es obligatorio'),
        region: Yup.array()
            .of(Yup.string().required('Cada región debe ser válida'))
            .min(1, 'Debes seleccionar al menos una región'),
    })

    const handleSubmit = async (
        values: FormValues,
        { setSubmitting }: FormikHelpers<FormValues>,
    ) => {
        try {
            const newCliente = {
                ...values,
                status: 'true',
            }
            await addDoc(collection(db, 'clientes'), newCliente)
            toast.success('Cliente creado exitosamente')
            setSubmitting(false)
            onClose()
            onClienteCreated()
        } catch (error) {
            console.error('Error al crear el cliente:', error)
            toast.error('Error al crear el cliente')
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
            <h2 className="mb-4 text-xl font-bold">Crear Cliente</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, values, setFieldValue }) => (
                    <Form className="flex flex-col space-y-6">
                        <div className="flex flex-col">
                            <label className="font-semibold text-gray-700">
                                Nombre Cliente:
                            </label>
                            <Field
                                type="text"
                                name="nombre"
                                placeholder="Ingrese nombre"
                                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 transition duration-200"
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
                            <InputGroup>
                                <div style={{ minWidth: 80 }}>
                                    <Select
                                        isSearchable={false}
                                        options={options1}
                                        onChange={(option) => {
                                            const rifNumber =
                                                values.rif.replace(/^[JE]-/, '')
                                            setFieldValue(
                                                'rif',
                                                `${option?.value}${rifNumber}`,
                                            )
                                        }}
                                    />
                                </div>
                                <Input
                                    value={values.rif}
                                    type="number"
                                    onChange={(e) =>
                                        setFieldValue('rif', e.target.value)
                                    }
                                    placeholder="Ingrese RIF"
                                />
                            </InputGroup>
                            <ErrorMessage
                                name="rif"
                                component="div"
                                className="text-red-600 text-sm mt-1"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="font-semibold text-gray-700">
                                Regiones:
                            </label>
                            <Select
                                name="region"
                                isMulti
                                options={regiones.map((region) => ({
                                    value: region,
                                    label: region,
                                }))}
                                onChange={(selectedOptions) =>
                                    setFieldValue(
                                        'region',
                                        selectedOptions
                                            ? selectedOptions.map(
                                                  (option) => option.value,
                                              )
                                            : [],
                                    )
                                }
                                className="mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            />
                            <ErrorMessage
                                name="region"
                                component="div"
                                className="text-red-600 text-sm mt-1"
                            />
                        </div>

                        <div className="text-right mt-6 flex justify-end">
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
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Spinner color="white" />
                                ) : (
                                    'Crear'
                                )}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Drawer>
    )
}

export default CreateDrawer
