import { db } from '@/configs/firebaseAssets.config'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { Button, Card } from '@/components/ui'
import { ChevronRightIcon } from 'lucide-react'

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
        <div>
            {/* Botón de Volver */}
            <div className="flex mb-6">
                <Button
                    variant="solid"
                    size="sm"
                    color="orange-500"
                    onClick={() => navigate(-1)}
                >
                    ← Volver
                </Button>

                <h2 className="ml-4">Formulario de Productos</h2>
            </div>

            {loading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <div className="w-8 h-8 border-4  rounded-full animate-spin"></div>
                </div>
            ) : data?.form_structure?.categories ? (
                <Card>
                    <ul className="border-l-2  pl-4">
                        {Object.entries(data.form_structure.categories).map(
                            ([catId, category]) => (
                                <li key={catId} className="mb-2">
                                    <button
                                        onClick={() =>
                                            toggleDropdown(
                                                catId,
                                                setOpenCategories,
                                                openCategories,
                                            )
                                        }
                                        className="flex items-center gap-2 text-lg font-semibold  hover:text-orange-500 transition"
                                    >
                                        <ChevronRightIcon
                                            className={`transform ${
                                                openCategories[catId]
                                                    ? 'rotate-90'
                                                    : ''
                                            }`}
                                        />

                                        {category.name}
                                    </button>

                                    {openCategories[catId] &&
                                        category.subcategories && (
                                            <ul className="pl-6 mt-2 border-l-2 ">
                                                {Object.entries(
                                                    category.subcategories,
                                                ).map(
                                                    ([subId, subcategory]) => (
                                                        <li
                                                            key={subId}
                                                            className="mb-1"
                                                        >
                                                            <button
                                                                onClick={() =>
                                                                    toggleDropdown(
                                                                        subId,
                                                                        setOpenSubcategories,
                                                                        openSubcategories,
                                                                    )
                                                                }
                                                                className="flex items-center gap-2  hover:text-orange-500 transition"
                                                            >
                                                                <ChevronRightIcon
                                                                    className={`transform ${
                                                                        openSubcategories[
                                                                            subId
                                                                        ]
                                                                            ? 'rotate-90'
                                                                            : ''
                                                                    }`}
                                                                />

                                                                {
                                                                    subcategory.name
                                                                }
                                                            </button>

                                                            {openSubcategories[
                                                                subId
                                                            ] &&
                                                                subcategory.brands && (
                                                                    <ul className="pl-6 mt-1 border-l-2">
                                                                        {Object.entries(
                                                                            subcategory.brands,
                                                                        ).map(
                                                                            ([
                                                                                brandId,
                                                                                brand,
                                                                            ]) => (
                                                                                <li
                                                                                    key={
                                                                                        brandId
                                                                                    }
                                                                                >
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            toggleDropdown(
                                                                                                brandId,
                                                                                                setOpenBrands,
                                                                                                openBrands,
                                                                                            )
                                                                                        }
                                                                                        className="flex items-center gap-2 hover:text-orange-500 transition focus:outline-none bg-transparent p-0"
                                                                                    >
                                                                                        <ChevronRightIcon
                                                                                            className={`w-5 h-5 transform ${
                                                                                                openBrands[
                                                                                                    brandId
                                                                                                ]
                                                                                                    ? 'rotate-90'
                                                                                                    : ''
                                                                                            } `}
                                                                                        />
                                                                                        {
                                                                                            brand.name
                                                                                        }
                                                                                    </button>

                                                                                    {openBrands[
                                                                                        brandId
                                                                                    ] &&
                                                                                        brand.products && (
                                                                                            <ul className="pl-6 mt-1 border-l-2 ">
                                                                                                {Object.entries(
                                                                                                    brand.products,
                                                                                                ).map(
                                                                                                    ([
                                                                                                        prodId,
                                                                                                        product,
                                                                                                    ]) => (
                                                                                                        <li
                                                                                                            key={
                                                                                                                prodId
                                                                                                            }
                                                                                                        >
                                                                                                            <button
                                                                                                                onClick={() =>
                                                                                                                    toggleDropdown(
                                                                                                                        prodId,
                                                                                                                        setOpenProducts,
                                                                                                                        openProducts,
                                                                                                                    )
                                                                                                                }
                                                                                                                className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition"
                                                                                                            >
                                                                                                                <ChevronRightIcon
                                                                                                                    className={`transform ${
                                                                                                                        openProducts[
                                                                                                                            prodId
                                                                                                                        ]
                                                                                                                            ? 'rotate-90'
                                                                                                                            : ''
                                                                                                                    }`}
                                                                                                                />

                                                                                                                {
                                                                                                                    product.name
                                                                                                                }
                                                                                                            </button>

                                                                                                            {openProducts[
                                                                                                                prodId
                                                                                                            ] &&
                                                                                                                product.questions && (
                                                                                                                    <ul className="pl-6 text-gray-500 text-sm mt-1">
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
                                                                                                                                    className="mt-1"
                                                                                                                                >
                                                                                                                                    <span className="font-semibold">
                                                                                                                                        Pregunta{' '}
                                                                                                                                        {
                                                                                                                                            qId
                                                                                                                                        }

                                                                                                                                        :{' '}
                                                                                                                                    </span>
                                                                                                                                    {
                                                                                                                                        qValue.question
                                                                                                                                    }
                                                                                                                                    <span className="text-orange-500">
                                                                                                                                        {' '}
                                                                                                                                        -{' '}
                                                                                                                                        {
                                                                                                                                            qValue.answer
                                                                                                                                        }
                                                                                                                                    </span>
                                                                                                                                </li>
                                                                                                                            ),
                                                                                                                        )}
                                                                                                                    </ul>
                                                                                                                )}
                                                                                                        </li>
                                                                                                    ),
                                                                                                )}
                                                                                            </ul>
                                                                                        )}
                                                                                </li>
                                                                            ),
                                                                        )}
                                                                    </ul>
                                                                )}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        )}
                                </li>
                            ),
                        )}
                    </ul>
                </Card>
            ) : (
                <p className="text-center text-gray-600 text-lg">
                    No hay datos disponibles.
                </p>
            )}
        </div>
    )
}

export default FormDetail
