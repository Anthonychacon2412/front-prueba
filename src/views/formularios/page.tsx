'use client'

import { useState } from 'react'

interface Product {
    name: string
}

interface Brand {
    name: string
    products: string[]
}

interface Subcategory {
    name: string
    brands: Brand[]
}

interface Category {
    name: string
    subcategories: Subcategory[]
}

const formularios = () => {
    const [expandedSubcat, setExpandedSubcat] = useState<string | null>(null)
    const [selectedSubcat, setSelectedSubcat] = useState<Subcategory | null>(
        null,
    )
    const [expandedMarca, setExpandedMarca] = useState<string | null>(null)

    const categories: Category[] = [
        {
            name: 'Cat. #1',
            subcategories: [
                {
                    name: 'Subcat. #1',
                    brands: [
                        {
                            name: 'Marca. #1',
                            products: [
                                'Producto #1',
                                'Producto #2',
                                'Producto #3',
                            ],
                        },
                        {
                            name: 'Marca. #2',
                            products: [
                                'Producto #1',
                                'Producto #2',
                                'Producto #3',
                            ],
                        },
                    ],
                },
                {
                    name: 'Subcat. #2',
                    brands: [],
                },
                {
                    name: 'Subcat. #3',
                    brands: [],
                },
            ],
        },
        {
            name: 'Cat. #2',
            subcategories: [],
        },
        {
            name: 'Cat. #3',
            subcategories: [],
        },
        {
            name: 'Cat. #4',
            subcategories: [],
        },
    ]

    const toggleSubcat = (category: Category, subcat: string) => {
        setExpandedSubcat(expandedSubcat === subcat ? null : subcat)
        const selected = category.subcategories.find((sc) => sc.name === subcat)
        setSelectedSubcat(selectedSubcat === selected ? null : selected || null)
        setExpandedMarca(null)
    }

    const toggleMarca = (marca: string) => {
        setExpandedMarca(expandedMarca === marca ? null : marca)
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
                            <button className="bg-orange-500 text-white py-2 px-4 rounded">
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-orange-500">
                            Categorías
                        </h2>
                        {categories.map((category, index) => (
                            <div key={index} className="mb-4">
                                <button
                                    className="font-semibold w-full text-left p-2 rounded bg-gray-200"
                                    onClick={() =>
                                        toggleSubcat(category, category.name)
                                    }
                                >
                                    {category.name}
                                </button>
                                {expandedSubcat === category.name && (
                                    <div className="ml-5 mt-2 space-y-2">
                                        {category.subcategories.map(
                                            (subcat, subIndex) => (
                                                <button
                                                    key={subIndex}
                                                    className="w-full text-left p-2 rounded bg-gray-300 flex flex-col"
                                                    onClick={() =>
                                                        toggleSubcat(
                                                            category,
                                                            subcat.name,
                                                        )
                                                    }
                                                >
                                                    {subcat.name}
                                                </button>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div>
                        {selectedSubcat && (
                            <>
                                <h2 className="text-xl font-bold mb-4 text-orange-500">
                                    {selectedSubcat.name}
                                </h2>
                                {selectedSubcat.brands &&
                                    selectedSubcat.brands.map(
                                        (brand, index) => (
                                            <div key={index} className="mb-4">
                                                <button
                                                    className="font-semibold w-full text-left p-2 rounded bg-gray-200"
                                                    onClick={() =>
                                                        toggleMarca(brand.name)
                                                    }
                                                >
                                                    {brand.name}
                                                </button>
                                                {expandedMarca ===
                                                    brand.name && (
                                                    <div className="ml-5 mt-2 space-y-2">
                                                        {brand.products.map(
                                                            (
                                                                product,
                                                                productIndex,
                                                            ) => (
                                                                <input
                                                                    key={
                                                                        productIndex
                                                                    }
                                                                    type="text"
                                                                    placeholder={
                                                                        product
                                                                    }
                                                                    className="block w-full rounded-md border-orange-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                                                                />
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ),
                                    )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default formularios
