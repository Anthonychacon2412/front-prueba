import { Button, Card, DatePicker, Select, toast } from '@/components/ui'
import { db } from '@/configs/firebaseAssets.config'
import { collection, getDocs, query, where } from 'firebase/firestore'
import JSZip from 'jszip'
import { useEffect, useState } from 'react'
import { HiSearch } from 'react-icons/hi'

const Photos = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [clientes, setClientes] = useState<any[]>([])
    const [regiones, setRegiones] = useState<string[]>([])
    const [establecimientos, setEstablecimientos] = useState<any[]>([])
    const [selectedCliente, setSelectedCliente] = useState<string | null>(null)
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
    const [selectedEstablecimiento, setSelectedEstablecimiento] = useState<
        string | null
    >(null)

    // Obtener clientes desde Firebase
    const getDataClientes = async () => {
        try {
            setIsLoading(true)
            const q = query(collection(db, 'clientes'))
            const querySnapshot = await getDocs(q)
            const clientesData: any[] = []

            querySnapshot.forEach((doc) => {
                clientesData.push({ id: doc.id, ...doc.data() })
            })

            setClientes(clientesData)
            console.log('clientesData', clientesData)
        } catch (error) {
            console.error('Error al obtener los clientes:', error)
            toast.push('Error al obtener los clientes')
        } finally {
            setIsLoading(false)
        }
    }

    // Manejar el cambio de cliente seleccionado
    const handleClienteChange = (value: string) => {
        setSelectedCliente(value)
        setSelectedRegion(null) // Resetear la región seleccionada
        setEstablecimientos([]) // Resetear establecimientos seleccionados
        setSelectedEstablecimiento(null)
        console.log('value', value)
        console.log('clientes', clientes)

        const clienteSeleccionado = clientes.find(
            (cliente) => cliente.id === value?.value,
        )

        console.log('clienteSeleccionado', clienteSeleccionado)

        // Verificar si "region" existe y es un array válido
        if (clienteSeleccionado && Array.isArray(clienteSeleccionado.region)) {
            console.log(clienteSeleccionado.region)
            setRegiones(clienteSeleccionado.region)
        } else {
            setRegiones([]) // Si no hay regiones, dejar el array vacío
        }
    }

    // Buscar establecimientos por cliente y región
    const buscarEstablecimientos = async (region: string) => {
        if (!selectedCliente || !region) {
            toast.push('Por favor, selecciona un cliente y una región.')
            return
        }

        console.log('region', region)
        console.log('selectedCliente', selectedCliente)

        const clienteSeleccionado = clientes.find(
            (cliente) => cliente.id === selectedCliente.value,
        )
        const clienteNombre = clienteSeleccionado?.nombre

        try {
            const q = query(
                collection(db, 'establecimientos'),
                where('cliente', 'array-contains', clienteNombre),
                where('region', '==', region.value), // Consulta para regiones dentro de un array
            )

            const querySnapshot = await getDocs(q)
            const establecimientosData: any[] = []

            querySnapshot.forEach((doc) => {
                establecimientosData.push({ id: doc.id, ...doc.data() })
            })

            console.log('Establecimientos encontrados:', establecimientosData)
            setEstablecimientos(establecimientosData)

            if (establecimientosData.length === 0) {
                toast.push(
                    'No se encontraron establecimientos para esta búsqueda.',
                )
            }
        } catch (error) {
            console.error('Error al buscar los establecimientos:', error)
        }
    }

    // Manejar el cambio de región seleccionada
    const handleRegionChange = (value: string) => {
        setSelectedRegion(value)
        setEstablecimientos([]) // Resetear los establecimientos al cambiar la región
        setSelectedEstablecimiento(null)
        buscarEstablecimientos(value) // Realizar la búsqueda al seleccionar la región
    }

    const handleDownload = async (imageUrl: any) => {
        // Reemplaza con la URL de tu imagen
        try {
            const response = await fetch(imageUrl)
            const blob = await response.blob() // Convierte la imagen en un archivo binario
            const url = window.URL.createObjectURL(blob)

            const a = document.createElement('a')
            a.href = url
            a.download = 'imagen-descargada.jpg' // Nombre del archivo
            document.body.appendChild(a)
            a.click()
            // Limpieza
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error al descargar la imagen:', error)
        }
    }

    const handleBatchDownload = async (imageUrls: any) => {
        // const imageUrls = [
        //   "URL_DE_TU_IMAGEN_1",
        //   "URL_DE_TU_IMAGEN_2",
        //   "URL_DE_TU_IMAGEN_3",
        // ]; // Reemplaza con las URLs de Firebase

        const zip = new JSZip()

        try {
            // Descargar cada imagen y agregarla al ZIP
            const downloadPromises = imageUrls.map(async (url, index) => {
                const response = await fetch(url)
                const blob = await response.blob()
                zip.file(`imagen-${index + 1}.jpg`, blob) // Agregar imagen al ZIP
            })

            await Promise.all(downloadPromises) // Esperar que todas las imágenes se descarguen

            // Generar el ZIP en formato Blob
            const zipBlob = await zip.generateAsync({ type: 'blob' })
            const zipUrl = URL.createObjectURL(zipBlob)

            // Crear un enlace <a> y simular el clic para descargar
            const a = document.createElement('a')
            a.href = zipUrl
            a.download = 'imagenes.zip' // Nombre del archivo ZIP
            document.body.appendChild(a)
            a.click()

            // Limpieza
            document.body.removeChild(a)
            URL.revokeObjectURL(zipUrl)
        } catch (error) {
            console.error('Error al descargar imágenes:', error)
        }
    }

    useEffect(() => {
        getDataClientes()
    }, [])

    return (
        <>
            <div className="mb-4 flex items-center justify-between">
                <h3>Visualización de Fotografías</h3>
                <Button onClick={() => handleBatchDownload('')}>
                    Descargar lote completo
                </Button>
            </div>
            <div className="flex justify-between items-center gap-4 mb-6">
                {/* Select para clientes */}
                <Select
                    className="w-[16vw]"
                    placeholder={
                        isLoading
                            ? 'Cargando clientes...'
                            : 'Seleccione un cliente...'
                    }
                    options={clientes.map((cliente) => ({
                        label: cliente.nombre, // Campo "nombre" del cliente
                        value: cliente.id,
                    }))}
                    value={selectedCliente}
                    onChange={(value) => handleClienteChange(value)}
                />

                {/* Select para regiones */}
                <Select
                    className="w-[16vw]"
                    placeholder={
                        selectedCliente
                            ? regiones.length > 0
                                ? 'Seleccione una región...'
                                : 'No hay regiones disponibles'
                            : 'Seleccione un cliente primero'
                    }
                    options={regiones.map((region) => ({
                        label: region, // Los elementos del array "region" son strings
                        value: region,
                    }))}
                    value={selectedRegion}
                    onChange={(value) => handleRegionChange(value)}
                    disabled={!selectedCliente || regiones.length === 0}
                />

                {/* Select para establecimientos */}
                <Select
                    className="w-[20vw]"
                    placeholder={
                        establecimientos.length > 0
                            ? 'Seleccione un establecimiento...'
                            : 'No hay establecimientos disponibles'
                    }
                    options={establecimientos.map((establecimiento) => ({
                        label: establecimiento.nombre, // Campo "nombre" del establecimiento
                        value: establecimiento.id,
                    }))}
                    value={selectedEstablecimiento}
                    onChange={(value) => setSelectedEstablecimiento(value)}
                    disabled={establecimientos.length === 0}
                />

                <DatePicker
                    className="w-[16vw]"
                    placeholder={'Seleccione una fecha...'}
                />

                <Button variant="solid" icon={<HiSearch />} />
            </div>
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <div className="w-full h-[35vh] bg-slate-800"></div>
                    <div className="pt-4 px-4 w-full h-[15vh]">
                        <p className="font-black">Competencia</p>
                        <p className="">Usuario</p>
                        <p className="">Fecha</p>
                    </div>
                    <div className="w-full flex justify-end items-center">
                        <Button
                            size="xs"
                            variant="twoTone"
                            onClick={() => handleDownload('')}
                        >
                            Descargar imagen
                        </Button>
                    </div>
                </Card>
                <Card>
                    <div className="w-full h-[35vh] bg-slate-800"></div>
                    <div className="pt-4 px-4 w-full h-[15vh]">
                        <p className="font-black">Antes</p>
                        <p className="">Usuario</p>
                        <p className="">Fecha</p>
                    </div>
                    <div className="w-full flex justify-end items-center">
                        <Button
                            size="xs"
                            variant="twoTone"
                            onClick={() => handleDownload('')}
                        >
                            Descargar imagen
                        </Button>
                    </div>
                </Card>
                <Card>
                    <div className="w-full h-[35vh] bg-slate-800"></div>
                    <div className="pt-4 px-4 w-full h-[15vh]">
                        <p className="font-black">Despues</p>
                        <p className="">Usuario</p>
                        <p className="">Fecha</p>
                    </div>
                    <div className="w-full flex justify-end items-center">
                        <Button
                            size="xs"
                            variant="twoTone"
                            onClick={() => handleDownload('')}
                        >
                            Descargar imagen
                        </Button>
                    </div>
                </Card>
            </div>
        </>
    )
}

export default Photos
