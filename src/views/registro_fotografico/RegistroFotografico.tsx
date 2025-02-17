import { useEffect, useState } from 'react'
import { collection, getDocs, query } from 'firebase/firestore'
import JSZip from 'jszip'
import { Button, DatePicker, Card, Select } from '@/components/ui'
import { db, functions } from '@/configs/firebaseAssets.config'
import { SingleValue } from 'react-select'
import { httpsCallable } from 'firebase/functions'
import { HiOutlineFilter, HiOutlinePhotograph, HiSearch } from 'react-icons/hi'

interface OptionType {
    label: string
    value: string
}

const Photos = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [formData, setFormData] = useState<any[]>([])
    const [clientes, setClientes] = useState<OptionType[]>([])
    const [establecimientos, setEstablecimientos] = useState<OptionType[]>([])
    const [regiones, setRegiones] = useState<OptionType[]>([])

    const [selectedCliente, setSelectedCliente] =
        useState<SingleValue<OptionType>>(null)
    const [selectedEstablecimiento, setSelectedEstablecimiento] =
        useState<SingleValue<OptionType>>(null)
    const [selectedRegion, setSelectedRegion] =
        useState<SingleValue<OptionType>>(null)
    const [selectedFecha, setSelectedFecha] = useState<Date | null>(null)
    const [imageUrls, setImageUrls] = useState<string[]>([])
    const [filteredClientes, setFilteredClientes] = useState<any[]>([])

    useEffect(() => {
        getDataFormResp()
    }, [])

    const getDataFormResp = async () => {
        try {
            setIsLoading(true)
            const q = query(collection(db, 'forms-resp-prueba'))
            const querySnapshot = await getDocs(q)
            const formData: any[] = []

            querySnapshot.forEach((doc) => {
                formData.push({ id: doc.id, ...doc.data() })
            })

            setFormData(formData)

            // Extraer clientes únicos
            const clientesUnicos = [
                ...new Set(formData.map((cliente) => cliente.nombre_cliente)),
            ].map((cliente) => ({ label: cliente, value: cliente }))
            setClientes(clientesUnicos)
        } catch (error) {
            console.error('Error al obtener los datos:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        setImageUrls(
            filteredClientes.flatMap((cliente) =>
                cliente.photos.map((photo: any) => photo.imgUrl),
            ),
        )
    }, [filteredClientes])

    const handleSelectChange = (
        newValue: SingleValue<OptionType>,
        setter: React.Dispatch<React.SetStateAction<SingleValue<OptionType>>>,
        type: 'cliente' | 'establecimiento',
    ) => {
        setter(newValue)

        if (type === 'cliente' && newValue) {
            // Filtrar los establecimientos solo del cliente seleccionado
            const establecimientosFiltrados = [
                ...new Set(
                    formData
                        .filter(
                            (cliente) =>
                                cliente.nombre_cliente === newValue.value,
                        )
                        .map((cliente) => cliente.establecimiento),
                ),
            ].map((establecimiento) => ({
                label: establecimiento,
                value: establecimiento,
            }))

            setEstablecimientos(establecimientosFiltrados)
            setSelectedEstablecimiento(null) // Reset establecimiento al cambiar cliente
            setSelectedRegion(null) // Reset región al cambiar cliente
            setRegiones([]) // Limpiar regiones
        }

        if (type === 'establecimiento' && newValue) {
            // Filtrar regiones solo del establecimiento seleccionado
            const regionesFiltradas = [
                ...new Set(
                    formData
                        .filter(
                            (cliente) =>
                                cliente.establecimiento === newValue.value,
                        )
                        .map((cliente) => cliente.region),
                ),
            ].map((region) => ({ label: region, value: region }))

            setRegiones(regionesFiltradas)
            setSelectedRegion(null) // Reset región al cambiar establecimiento
        }
    }

    const filterData = () => {
        const filtered = formData.filter((cliente) => {
            const matchesCliente = selectedCliente
                ? cliente.nombre_cliente === selectedCliente.value
                : true
            const matchesEstablecimiento = selectedEstablecimiento
                ? cliente.establecimiento === selectedEstablecimiento.value
                : true
            const matchesRegion = selectedRegion
                ? cliente.region === selectedRegion.value
                : true
            const matchesFecha = selectedFecha
                ? new Date(cliente.fecha_llenado.seconds * 1000)
                      .toISOString()
                      .split('T')[0] ===
                  selectedFecha.toISOString().split('T')[0]
                : true

            return (
                matchesCliente &&
                matchesEstablecimiento &&
                matchesRegion &&
                matchesFecha
            )
        })

        setFilteredClientes(filtered)
        setImageUrls(
            filtered.flatMap((cliente) =>
                cliente.photos.map((photo: any) => photo.imgUrl),
            ),
        )
    }

    const downloadZip = async (imageUrls: any) => {
        try {
            const func = httpsCallable(functions, '	downloadImages')
            const response = await func({ imageUrls }) // Enviar el objeto correctamente

            const blob = await response?.blob()
            const url = window.URL.createObjectURL(blob)

            const a = document.createElement('a')
            a.href = url
            a.download = 'imagenes.zip'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)

            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const urls = [
        'https://picsum.photos/200/300',
        'https://picsum.photos/200/300',
    ]

    return (
        <div className="ml-3 p-2">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                    <HiOutlinePhotograph
                        size={40}
                        className="text-amber-600 mr-4"
                    />
                    <div>
                        <h1 className="mb-0 pb-0 text-3xl">
                            Visualización de Fotos
                        </h1>
                        <span className="text-xs">
                            Visualiza y gestiona fotos relacionadas a los
                            formularios cargados.
                        </span>
                    </div>
                </div>
                {/* <Button onClick={() => downloadZip(imageUrls)}>
                    Descargar lote filtrado
                </Button> */}
            </div>
            <div className="grid grid-cols-5 gap-4  mb-3">
                <div>
                    <Select
                        value={selectedCliente}
                        onChange={(newValue) =>
                            handleSelectChange(
                                newValue,
                                setSelectedCliente,
                                'cliente',
                            )
                        }
                        options={clientes}
                        placeholder="Seleccionar Cliente"
                    />
                </div>

                <div>
                    <Select
                        value={selectedEstablecimiento}
                        onChange={(newValue) =>
                            handleSelectChange(
                                newValue,
                                setSelectedEstablecimiento,
                                'establecimiento',
                            )
                        }
                        options={establecimientos}
                        placeholder="Seleccionar Establecimiento"
                        isDisabled={!selectedCliente} // Bloquea si no hay cliente seleccionado
                    />
                </div>

                <div>
                    <Select
                        value={selectedRegion}
                        onChange={(newValue) => setSelectedRegion(newValue)}
                        options={regiones}
                        placeholder="Seleccionar Región"
                        isDisabled={!selectedEstablecimiento} // Bloquea si no hay establecimiento seleccionado
                    />
                </div>

                <div>
                    <DatePicker
                        value={selectedFecha}
                        onChange={setSelectedFecha}
                        placeholder="Seleccionar Fecha"
                    />
                </div>
                <Button
                    variant="solid"
                    color="orange-500"
                    onClick={filterData}
                    icon={<HiSearch />}
                />
            </div>

            <div>
                {filteredClientes.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                        {filteredClientes.map((cliente) =>
                            cliente.photos.map((photo: any) => (
                                <Card key={photo.imgUrl}>
                                    <img
                                        src={photo.imgUrl}
                                        alt={photo.tag}
                                        className="w-full h-[35vh] object-cover"
                                    />
                                    <div className="pt-4 px-4 w-full h-[15vh]">
                                        <p className="font-black">
                                            {photo.tag}
                                        </p>
                                        <p>{cliente.nombre_usuario}</p>
                                        <p>
                                            {new Date(
                                                cliente.fecha_llenado.seconds *
                                                    1000,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="w-full flex justify-end items-center">
                                        {/* <Button
                                        size="xs"
                                        variant="twoTone"
                                        onClick={() =>
                                            handleDownload(photo.imgUrl)
                                        }
                                    >
                                        Descargar imagen
                                    </Button> */}
                                    </div>
                                </Card>
                            )),
                        )}
                    </div>
                ) : (
                    <Card className="w-full h-full mt-32 border-none">
                        <div className="flex justify-center items-center flex-col">
                            <HiOutlineFilter
                                size={90}
                                className="text-gray-300"
                            />
                            <h4 className="text-gray-300">
                                Debe seleccionar un cliente y una region
                            </h4>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default Photos
