import { Button, Select } from '@/components/ui'
import { collection, getDocs, query, where } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { db } from '@/configs/firebaseAssets.config'
import { useNavigate } from 'react-router-dom'

interface Cliente {
    value: string
    label: string
}

interface Establecimiento {
    value: string
    label: string
}

interface Pregunta {
    pregunta: string
}

interface Producto {
    producto: string
    Preguntas: Pregunta[]
}

interface Marca {
    marca: string
    productos: Producto[]
}

interface Subcategoria {
    subcategoria: string
    marcas: Marca[]
}

interface Categoria {
    categoria: string
    hijos: Subcategoria[]
}

const Forms = () => {
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>(
        [],
    )
    const [selectedCliente, setSelectedCliente] = useState<string | null>(null)
    const [formData, setFormData] = useState<Categoria[]>([])
    const [dataFormsD, setDataFormsD] = useState<any[]>([])
    const navigate = useNavigate()

    const getClientes = async () => {
        try {
            const q = query(collection(db, 'formularios'))
            const querySnapshot = await getDocs(q)
            const clientesData: Cliente[] = querySnapshot.docs.map((doc) => ({
                value: doc.data().cliente,
                label: doc.data().cliente,
            }))
            setClientes(clientesData)
            console.log('Clientes obtenidos:', clientesData)
        } catch (error) {
            console.error('Error al obtener los clientes:', error)
        }
    }

    const getEstablecimientos = async (cliente: string) => {
        try {
            const q = query(
                collection(db, 'establecimientos'),
                where('clientes', 'array-contains', cliente),
            )
            const querySnapshot = await getDocs(q)
            const establecimientosData: Establecimiento[] =
                querySnapshot.docs.map((doc) => ({
                    value: doc.data().nombre,
                    label: doc.data().nombre,
                }))
            setEstablecimientos(establecimientosData)
            console.log('Establecimientos obtenidos:', establecimientosData)
        } catch (error) {
            console.error('Error al obtener los establecimientos:', error)
        }
    }

    const getForms = async (cliente: any) => {
        try {
            const q = query(
                collection(db, 'formularios'),
                where('cliente', '==', cliente),
            )
            const querySnapshot = await getDocs(q)
            const formData = querySnapshot.docs.map(
                (doc) => doc.data().hijos,
            )[0]

            setFormData(formData)
            console.log('Formulario obtenido:', formData)
        } catch (error) {
            console.error('Error al obtener el formulario:', error)
        }
    }

    const getData = () => {
        console.log(formData)
        if (!formData || !Array.isArray(formData)) {
            console.log('No se encontró formData o no es un array')
            return
        }

        // Procesar la estructura de `formData`
        const products = formData.flatMap(
            (category: Categoria, catIndex: number) =>
                category.hijos.flatMap(
                    (subcategory: Subcategoria, subIndex: number) =>
                        subcategory.marcas.flatMap(
                            (marca: Marca, marcaIndex: number) =>
                                marca.productos.flatMap(
                                    (producto: Producto, prodIndex: number) =>
                                        producto.Preguntas.map(
                                            (
                                                pregunta: Pregunta,
                                                pregIndex: number,
                                            ) => ({
                                                key: `${catIndex}-${subIndex}-${marcaIndex}-${prodIndex}-${pregIndex}`,
                                                categoria: category.categoria,
                                                subcategoria:
                                                    subcategory.subcategoria,
                                                marcas: marca.marca,
                                                producto: producto.producto,
                                                preguntas: pregunta.pregunta,
                                            }),
                                        ),
                                ),
                        ),
                ),
        )

        console.log('Datos procesados:', products)
        setDataFormsD(products)
    }

    useEffect(() => {
        getClientes()
    }, [])

    useEffect(() => {
        if (selectedCliente) {
            getEstablecimientos(selectedCliente)
            getForms(selectedCliente)
        } else {
            setEstablecimientos([])
            setFormData([])
        }
    }, [selectedCliente])

    const handleFundamentalClick = () => {
        if (selectedCliente) {
            navigate(`/formulario-detalle?nombre=${selectedCliente}`)
        }
    }

    return (
        <div className="flex h-screen bg-slate-400">
            <main className="flex-1 p-6 bg-white">
                <h1 className="text-2xl font-semibold">Formularios</h1>
                <div className="grid grid-cols-3 gap-3 bg-white p-10 rounded-lg shadow-md">
                    <div className="grid grid-rows-2 gap-3 p-10">
                        <form>
                            <div>
                                <label
                                    htmlFor="clientes"
                                    className="block text-gray-700"
                                >
                                    Clientes
                                </label>
                                <Select
                                    options={clientes}
                                    onChange={(option) =>
                                        setSelectedCliente(
                                            option?.value || null,
                                        )
                                    }
                                    placeholder="Selecciona un cliente"
                                    className="w-full"
                                />
                            </div>
                        </form>
                        <form>
                            <div>
                                <label
                                    htmlFor="establecimientos"
                                    className="block text-gray-700"
                                >
                                    Establecimientos
                                </label>
                                <Select
                                    options={establecimientos}
                                    placeholder="Selecciona un establecimiento"
                                    className="w-full"
                                />
                            </div>
                        </form>
                    </div>
                    <div className="flex justify-center items-center">
                        <div className="bg-orange-500 w-1 h-60"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-center w-full mb-4">
                            <Button
                                size="md"
                                className="border-orange-400 hover:bg-orange-200 mr-2 h-[20vh] rounded-full"
                                onClick={getData}
                            >
                                Fundamental
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Forms
