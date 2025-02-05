import { useEffect, useState } from 'react'
import { collection, getDocs, query } from 'firebase/firestore'
import JSZip from 'jszip'
import { Button, DatePicker, Card } from '@/components/ui'
import { db } from '@/configs/firebaseAssets.config'
import Select, { SingleValue } from 'react-select'

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
        } catch (error) {
            console.error('Error al obtener los clientes:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (formData.length > 0) {
            // Extrae los valores únicos para cada select
            const clientes = [
                ...new Set(formData.map((cliente) => cliente.nombre_cliente)),
            ].map((cliente) => ({ label: cliente, value: cliente }))
            const establecimientos = [
                ...new Set(formData.map((cliente) => cliente.establecimiento)),
            ].map((establecimiento) => ({
                label: establecimiento,
                value: establecimiento,
            }))
            const regiones = [
                ...new Set(formData.map((cliente) => cliente.region)),
            ].map((region) => ({ label: region, value: region }))

            // Asigna esos valores a los selectores
            setClientes(clientes)
            setEstablecimientos(establecimientos)
            setRegiones(regiones)
        }
    }, [formData])

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
    ) => {
        setter(newValue)
    }

    const handleDownload = async (imageUrl: string) => {
        try {
            const response = await fetch(imageUrl)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'imagen-descargada.jpg'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error al descargar la imagen:', error)
        }
    }

    const handleBatchDownload = async (imageUrls: string[]) => {
        const zip = new JSZip()
        try {
            const downloadPromises = imageUrls.map(async (url, index) => {
                const response = await fetch(url)
                const blob = await response.blob()
                zip.file(`imagen-${index + 1}.jpg`, blob)
            })
            await Promise.all(downloadPromises)

            const zipBlob = await zip.generateAsync({ type: 'blob' })
            const zipUrl = URL.createObjectURL(zipBlob)

            const a = document.createElement('a')
            a.href = zipUrl
            a.download = 'imagenes.zip'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(zipUrl)
        } catch (error) {
            console.error('Error al descargar imágenes:', error)
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

        // Actualizar imageUrls inmediatamente después
        const newImageUrls = filtered.flatMap((cliente) =>
            cliente.photos.map((photo: any) => photo.imgUrl),
        )
        setImageUrls(newImageUrls)
    }

    return (
        <div>
            <div className="grid grid-cols-5 gap-4 mb-3">
                <Select
                    value={selectedCliente}
                    onChange={(newValue) =>
                        handleSelectChange(newValue, setSelectedCliente)
                    }
                    options={clientes}
                    placeholder="Seleccionar Cliente"
                />

                <Select
                    value={selectedEstablecimiento}
                    onChange={(newValue) =>
                        handleSelectChange(newValue, setSelectedEstablecimiento)
                    }
                    options={establecimientos}
                    placeholder="Seleccionar Establecimiento"
                />

                <Select
                    value={selectedRegion}
                    onChange={(newValue) =>
                        handleSelectChange(newValue, setSelectedRegion)
                    }
                    options={regiones}
                    placeholder="Seleccionar Región"
                />

                <DatePicker
                    value={selectedFecha}
                    onChange={setSelectedFecha}
                    placeholder="Seleccionar Fecha"
                />
                <Button onClick={filterData}>Buscar</Button>
            </div>

            <div className="mb-4 flex items-center justify-between">
                <h3>Visualización de Fotografías</h3>
                <Button onClick={() => handleBatchDownload(imageUrls)}>
                    Descargar lote filtrado
                </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {filteredClientes.length > 0 ? (
                    filteredClientes.map((cliente) =>
                        cliente.photos.map((photo: any) => (
                            <Card key={photo.imgUrl}>
                                <img
                                    src={photo.imgUrl}
                                    alt={photo.tag}
                                    className="w-full h-[35vh] object-cover"
                                />
                                <div className="pt-4 px-4 w-full h-[15vh]">
                                    <p className="font-black">{photo.tag}</p>
                                    <p>{cliente.nombre_usuario}</p>
                                    <p>
                                        {new Date(
                                            cliente.fecha_llenado.seconds *
                                                1000,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="w-full flex justify-end items-center">
                                    <Button
                                        size="xs"
                                        variant="twoTone"
                                        onClick={() =>
                                            handleDownload(photo.imgUrl)
                                        }
                                    >
                                        Descargar imagen
                                    </Button>
                                </div>
                            </Card>
                        )),
                    )
                ) : (
                    <p>No hay imágenes para mostrar</p>
                )}
            </div>
        </div>
    )
}

export default Photos
