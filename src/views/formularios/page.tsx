import { useState, useEffect } from 'react'
import { collection, getDocs, query, doc, setDoc } from 'firebase/firestore'
import { db } from '@/configs/firebaseAssets.config'

// Define types for your data structures
interface Question {
    pregunta: string
}

interface Product {
    nombre?: string
    Preguntas?: Question[]
}

interface Brand {
    nombre?: string
    productos?: Product[]
}

interface Subcategory {
    nombre?: string
    marcas?: Brand[]
}

interface Category {
    categoria?: string
    hijos?: Subcategory[]
}

// Define the type for expanded state
type ExpandedState = Record<string, boolean>

const Formularios = () => {
    const [categories, setCategories] = useState<Category[]>([])
    const [expanded, setExpanded] = useState<ExpandedState>({})
    const [responses, setResponses] = useState<Record<string, string>>({})

    // Function to fetch data from Firebase
    const fetchData = async () => {
        try {
            const q = query(collection(db, 'formularios'))
            const querySnapshot = await getDocs(q)
            const fetchedCategories: Category[] = []

            querySnapshot.forEach((doc) => {
                const data = doc.data()
                console.log('Fetched Data:', data) // Debugging log
                if (data.preguntas && Array.isArray(data.preguntas)) {
                    fetchedCategories.push(...data.preguntas)
                }
            })

            setCategories(fetchedCategories)
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Function to toggle expansion state
    const toggleExpand = (id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
    }

    const handleResponseChange = (id: string, value: string) => {
        setResponses((prev) => ({ ...prev, [id]: value }))
    }

    // Function to save responses to Firebase
    const saveResponsesToFirebase = async () => {
        try {
            const docRef = doc(collection(db, 'formularios'), 'respuesta')
            await setDoc(docRef, { respuestas: responses })
            alert('Respuestas guardadas exitosamente')
        } catch (error) {
            console.error('Error saving responses:', error)
            alert('Hubo un error al guardar las respuestas')
        }
    }

    return (
        <div className="flex min-h-screen">
            <main className="flex-1 p-10">
                <div className="flex items-center justify-between mb-5">
                    <div className="mr-5">
                        <h1 className="text-3xl font-bold">Fundamental</h1>
                        <p className="text-gray-600">Versión: 1.0.0</p>
                    </div>
                    <div className="grid grid-cols-7 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Fecha de Carga
                            </label>
                            <input
                                type="date"
                                className="block w-full rounded-md p-3 border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Moneda
                            </label>
                            <select className="mt-1 block w-full rounded-md p-3 border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                                <option>$</option>
                                <option>€</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Tasa
                            </label>
                            <input
                                type="number"
                                className="mt-1 block w-full rounded-md p-3 border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                        </div>
                        <div className="flex space-x-4">
                            <button className="bg-orange-500 text-white py-1 px-9 rounded">
                                Cargar Fotos
                            </button>
                            <button
                                className="bg-orange-500 text-white py-2 px-4 rounded"
                                onClick={saveResponsesToFirebase}
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>

                <div className=" gap-4">
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-orange-500">
                            Categorías
                        </h2>
                        {/* Display categories list */}
                        {categories.length > 0 ? (
                            categories.map((category, index) => (
                                <div key={index} className="mb-4">
                                    <button
                                        className="font-semibold w-36 text-left p-2 rounded bg-white text-black border border-gray-300"
                                        onClick={() =>
                                            toggleExpand(`category-${index}`)
                                        }
                                    >
                                        {category.categoria || 'Sin Nombre'}
                                    </button>
                                    {expanded[`category-${index}`] && (
                                        <div className="ml-5 mt-2 space-y-2">
                                            {category.hijos?.map(
                                                (subcat, subIndex) => (
                                                    <div key={subIndex}>
                                                        <button
                                                            className="w-36 text-left p-2 rounded bg-white text-black border border-gray-300"
                                                            onClick={() =>
                                                                toggleExpand(
                                                                    `category-${index}-subcat-${subIndex}`,
                                                                )
                                                            }
                                                        >
                                                            {subcat.nombre ||
                                                                'Subcategoría'}
                                                        </button>
                                                        {expanded[
                                                            `category-${index}-subcat-${subIndex}`
                                                        ] && (
                                                            <div className="ml-5 mt-2 space-y-2">
                                                                {subcat.marcas?.map(
                                                                    (
                                                                        brand,
                                                                        brandIndex,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                brandIndex
                                                                            }
                                                                        >
                                                                            <button
                                                                                className="w-36 text-left p-2 rounded bg-white text-black border border-gray-300"
                                                                                onClick={() =>
                                                                                    toggleExpand(
                                                                                        `category-${index}-subcat-${subIndex}-brand-${brandIndex}`,
                                                                                    )
                                                                                }
                                                                            >
                                                                                {brand.nombre ||
                                                                                    'Marca'}
                                                                            </button>
                                                                            {expanded[
                                                                                `category-${index}-subcat-${subIndex}-brand-${brandIndex}`
                                                                            ] && (
                                                                                <div className="ml-5 mt-2 space-y-2">
                                                                                    {brand.productos?.map(
                                                                                        (
                                                                                            product,
                                                                                            productIndex,
                                                                                        ) => (
                                                                                            <div
                                                                                                key={
                                                                                                    productIndex
                                                                                                }
                                                                                                className="bg-white text-black border border-gray-300 p-2 rounded mb-2"
                                                                                            >
                                                                                                <button
                                                                                                    className="w-auto text-left p-2 rounded bg-white text-black border border-gray-300"
                                                                                                    onClick={() =>
                                                                                                        toggleExpand(
                                                                                                            `category-${index}-subcat-${subIndex}-brand-${brandIndex}-product-${productIndex}`,
                                                                                                        )
                                                                                                    }
                                                                                                >
                                                                                                    {product.nombre ||
                                                                                                        'Producto'}
                                                                                                </button>
                                                                                                {expanded[
                                                                                                    `category-${index}-subcat-${subIndex}-brand-${brandIndex}-product-${productIndex}`
                                                                                                ] && (
                                                                                                    <div className="ml-5 mt-2 space-y-2">
                                                                                                        {product.Preguntas?.map(
                                                                                                            (
                                                                                                                question,
                                                                                                                questionIndex,
                                                                                                            ) => (
                                                                                                                <div
                                                                                                                    key={
                                                                                                                        questionIndex
                                                                                                                    }
                                                                                                                    className="flex items-center mb-2"
                                                                                                                >
                                                                                                                    <p className="w-1/3 bg-gray-100 text-black p-2 rounded mr-2">
                                                                                                                        {question.pregunta ||
                                                                                                                            'Pregunta'}
                                                                                                                    </p>
                                                                                                                    <input
                                                                                                                        type="text"
                                                                                                                        value={
                                                                                                                            responses[
                                                                                                                                `category-${index}-subcat-${subIndex}-brand-${brandIndex}-product-${productIndex}-question-${questionIndex}`
                                                                                                                            ] ||
                                                                                                                            ''
                                                                                                                        }
                                                                                                                        onChange={(
                                                                                                                            e,
                                                                                                                        ) =>
                                                                                                                            handleResponseChange(
                                                                                                                                `category-${index}-subcat-${subIndex}-brand-${brandIndex}-product-${productIndex}-question-${questionIndex}`,
                                                                                                                                e
                                                                                                                                    .target
                                                                                                                                    .value,
                                                                                                                            )
                                                                                                                        }
                                                                                                                        className="w-2/3 bg-white text-black p-2 rounded border border-gray-300"
                                                                                                                    />
                                                                                                                </div>
                                                                                                            ),
                                                                                                        )}
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        ),
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No se encontraron categorías</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Formularios
