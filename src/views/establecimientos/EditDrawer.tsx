import { Button, Drawer, Select, Spinner } from '@/components/ui'
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import {
    doc,
    getDoc,
    updateDoc,
    collection,
    getDocs,
    GeoPoint,
} from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'
import { useEffect, useState, useCallback } from 'react'
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
    cliente: string[]
    ubicacion: [number, number] | null
}

const EditDrawer: React.FC<EditDrawerProps> = ({
    isOpen,
    onClose,
    establecimientoId,
    onEstablecimientoUpdated,
}) => {
    const [regiones, setRegiones] = useState<string[]>([])
    const [clientes, setClientes] = useState<string[]>([])
    const [ubicacion, setUbicacion] = useState<[number, number] | null>(null)
    const [initialValues, setInitialValues] = useState<FormValues>({
        nombre: '',
        region: '',
        cliente: [],
        ubicacion: null,
    })

    const validationSchema = Yup.object({
        nombre: Yup.string().required(
            'El nombre del establecimiento es obligatorio',
        ),
        region: Yup.string().required('La región es obligatoria'),
        cliente: Yup.array().min(1, 'Debe seleccionar al menos un cliente'),
        ubicacion: Yup.array()
            .of(Yup.number())
            .length(2, 'La ubicación debe tener exactamente dos coordenadas')
            .nullable(),
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
                ubicacion: values.ubicacion
                    ? new GeoPoint(values.ubicacion[0], values.ubicacion[1])
                    : null,
            })

            toast.success('Establecimiento actualizado exitosamente')
            setSubmitting(false)
            onEstablecimientoUpdated()
            onClose()
        } catch (error) {
            console.error('Error al actualizar el establecimiento:', error)
            toast.error('Error al actualizar el establecimiento')
            setSubmitting(false)
        }
    }

    const getRegiones = useCallback(async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'regiones'))
            const regionesList: string[] = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                if (data.nombre) {
                    regionesList.push(data.nombre)
                }
            })
            setRegiones(regionesList)
        } catch (error) {
            console.error('Error al obtener las regiones:', error)
        }
    }, [])

    const getClientes = useCallback(async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'clientes'))
            const clientesList: string[] = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                if (data.nombre) {
                    clientesList.push(data.nombre)
                }
            })
            setClientes(clientesList)
        } catch (error) {
            console.error('Error al obtener los clientes:', error)
        }
    }, [])

    const getEstablecimiento = useCallback(async () => {
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
                    nombre: data.nombre || '',
                    region: data.region || '',
                    ubicacion: data.ubicacion
                        ? [data.ubicacion._lat, data.ubicacion._long]
                        : null,
                    cliente: data.cliente
                        ? data.cliente.map((c: { nombre: string }) => c.nombre)
                        : [],
                })

                setUbicacion(
                    data.ubicacion
                        ? [data.ubicacion._lat, data.ubicacion._long]
                        : null,
                )
                console.log('establecimientos data', data)
            } else {
                console.error('No se encontró el establecimiento')
            }
        } catch (error) {
            console.error('Error al obtener el establecimiento:', error)
        }
    }, [establecimientoId])

    useEffect(() => {
        getRegiones()
    }, [getRegiones])

    useEffect(() => {
        if (establecimientoId) {
            getEstablecimiento()
            getClientes()
        }
    }, [establecimientoId, getEstablecimiento, getClientes])

    return (
        <Drawer isOpen={isOpen} onClose={onClose} className="rounded-md shadow">
            <h2 className="mb-4 text-xl font-bold">Editar Establecimiento</h2>
            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ setFieldValue, isSubmitting }) => (
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
                            <label className="font-semibold text-gray-700">
                                Clientes:
                            </label>
                            <Select
                                name="cliente"
                                isMulti
                                options={clientes.map((cliente) => ({
                                    value: cliente,
                                    label: cliente,
                                }))} // Opciones para el Select
                                value={initialValues.cliente.map((cliente) => ({
                                    value: cliente,
                                    label: cliente,
                                }))} // Mapea los valores seleccionados actuales
                                onChange={(selectedOptions) => {
                                    const selectedValues = selectedOptions.map(
                                        (option) => option.value,
                                    )
                                    setFieldValue('cliente', selectedValues)
                                }}
                                placeholder="Selecciona los clientes"
                                className="mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                menuPortalTarget={document.body}
                                styles={{
                                    menuPortal: (base) => ({
                                        ...base,
                                        zIndex: 9999,
                                    }), // Asegura que el menú se muestre por encima del mapa
                                }}
                            />

                            <ErrorMessage
                                name="cliente"
                                component="div"
                                className="text-red-600 text-sm mt-1"
                            />
                        </div>
                        <div className="flex flex-col">
                            {ubicacion && (
                                <EditMap
                                    initialLocation={ubicacion}
                                    onLocationSelect={(location) =>
                                        setUbicacion(location)
                                    }
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
