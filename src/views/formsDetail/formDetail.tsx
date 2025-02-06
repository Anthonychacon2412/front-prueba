import { db } from '@/configs/firebaseAssets.config'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'

const FormDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [openCategories, setOpenCategories] = useState<{
        [key: string]: boolean
    }>({})
    const [openSubcategories, setOpenSubcategories] = useState<{
        [key: string]: boolean
    }>({})
    const [openBrands, setOpenBrands] = useState<{ [key: string]: boolean }>({})
    const [openProducts, setOpenProducts] = useState<{
        [key: string]: boolean
    }>({})

    useEffect(() => {
        const fetchData = async () => {
            try {
                const docRef = doc(db, 'forms-resp-prueba', `${id}`)
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    setData(docSnap.data())
                } else {
                    console.log('No such document!')
                    setData(null)
                }
            } catch (error) {
                console.error('Error fetching document:', error)
                setData(null)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    const toggleDropdown = (
        id: string,
        stateUpdater: Function,
        currentState: { [key: string]: boolean },
    ) => {
        stateUpdater({ ...currentState, [id]: !currentState[id] })
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Botón de Volver */}
            <button
                onClick={() => navigate(-1)}
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
                ← Volver
            </button>

            <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
                Formulario de Productos
            </h1>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600"></div>
                </div>
            ) : data?.form_structure?.categories ? (
                <div className="max-w-4xl mx-auto space-y-4">
                    {Object.entries(data.form_structure.categories).map(
                        ([catId, category]) => (
                            <div
                                key={catId}
                                className="bg-white shadow-md rounded-lg p-4"
                            >
                                <button
                                    onClick={() =>
                                        toggleDropdown(
                                            catId,
                                            setOpenCategories,
                                            openCategories,
                                        )
                                    }
                                    className="w-full text-left flex justify-between items-center text-xl font-semibold text-gray-700"
                                >
                                    {category.name}
                                    <span>
                                        {openCategories[catId] ? '−' : '+'}
                                    </span>
                                </button>

                                {openCategories[catId] &&
                                    category.subcategories && (
                                        <div className="ml-4 mt-3 space-y-2">
                                            {Object.entries(
                                                category.subcategories,
                                            ).map(([subId, subcategory]) => (
                                                <div
                                                    key={subId}
                                                    className="bg-gray-50 p-3 rounded-lg"
                                                >
                                                    <button
                                                        onClick={() =>
                                                            toggleDropdown(
                                                                subId,
                                                                setOpenSubcategories,
                                                                openSubcategories,
                                                            )
                                                        }
                                                        className="w-full text-left flex justify-between items-center text-lg font-medium text-gray-800"
                                                    >
                                                        {subcategory.name}
                                                        <span>
                                                            {openSubcategories[
                                                                subId
                                                            ]
                                                                ? '−'
                                                                : '+'}
                                                        </span>
                                                    </button>

                                                    {openSubcategories[subId] &&
                                                        subcategory.brands && (
                                                            <div className="ml-4 mt-2 space-y-2">
                                                                {Object.entries(
                                                                    subcategory.brands,
                                                                ).map(
                                                                    ([
                                                                        brandId,
                                                                        brand,
                                                                    ]) => (
                                                                        <div
                                                                            key={
                                                                                brandId
                                                                            }
                                                                            className="bg-white p-3 rounded-lg shadow"
                                                                        >
                                                                            <button
                                                                                onClick={() =>
                                                                                    toggleDropdown(
                                                                                        brandId,
                                                                                        setOpenBrands,
                                                                                        openBrands,
                                                                                    )
                                                                                }
                                                                                className="w-full text-left flex justify-between items-center text-blue-600 font-semibold"
                                                                            >
                                                                                {
                                                                                    brand.name
                                                                                }
                                                                                <span>
                                                                                    {openBrands[
                                                                                        brandId
                                                                                    ]
                                                                                        ? '−'
                                                                                        : '+'}
                                                                                </span>
                                                                            </button>

                                                                            {openBrands[
                                                                                brandId
                                                                            ] &&
                                                                                brand.products && (
                                                                                    <div className="ml-4 mt-2 space-y-2">
                                                                                        {Object.entries(
                                                                                            brand.products,
                                                                                        ).map(
                                                                                            ([
                                                                                                prodId,
                                                                                                product,
                                                                                            ]) => (
                                                                                                <div
                                                                                                    key={
                                                                                                        prodId
                                                                                                    }
                                                                                                    className="bg-gray-100 p-3 rounded-md"
                                                                                                >
                                                                                                    <button
                                                                                                        onClick={() =>
                                                                                                            toggleDropdown(
                                                                                                                prodId,
                                                                                                                setOpenProducts,
                                                                                                                openProducts,
                                                                                                            )
                                                                                                        }
                                                                                                        className="w-full text-left flex justify-between items-center text-gray-900 font-medium"
                                                                                                    >
                                                                                                        {
                                                                                                            product.name
                                                                                                        }
                                                                                                        <span>
                                                                                                            {openProducts[
                                                                                                                prodId
                                                                                                            ]
                                                                                                                ? '−'
                                                                                                                : '+'}
                                                                                                        </span>
                                                                                                    </button>

                                                                                                    {openProducts[
                                                                                                        prodId
                                                                                                    ] &&
                                                                                                        product.questions && (
                                                                                                            <ul className="list-disc pl-5 mt-2 text-gray-700">
                                                                                                                {Object.entries(
                                                                                                                    product.questions,
                                                                                                                ).map(
                                                                                                                    ([
                                                                                                                        qId,
                                                                                                                        qValue,
                                                                                                                    ]) => (
                                                                                                                        <li
                                                                                                                            key={
                                                                                                                                qId
                                                                                                                            }
                                                                                                                        >
                                                                                                                            <span className="font-semibold">
                                                                                                                                Pregunta{' '}
                                                                                                                                {
                                                                                                                                    qId
                                                                                                                                }
                                                                                                                                :
                                                                                                                            </span>{' '}
                                                                                                                            {
                                                                                                                                qValue.question
                                                                                                                            }{' '}
                                                                                                                            -{' '}
                                                                                                                            <span className="text-blue-500">
                                                                                                                                {
                                                                                                                                    qValue.answer
                                                                                                                                }
                                                                                                                            </span>
                                                                                                                        </li>
                                                                                                                    ),
                                                                                                                )}
                                                                                                            </ul>
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
                                            ))}
                                        </div>
                                    )}
                            </div>
                        ),
                    )}
                </div>
            ) : (
                <p className="text-center text-gray-600">
                    No hay datos disponibles.
                </p>
            )}
        </div>
    )
}

export default FormDetail
