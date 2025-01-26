import { db } from '@/configs/firebaseAssets.config'
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface Product {
    cod: string
    cod_barras: string
    product_name: string
    id: string
}

const FormularioPrueba = () => {
    const [data, setData] = useState<any>(null)
    const [dataClient, setDataClient] = useState<any>(null)

    const fetchAndDisplayProducts = async () => {
        try {
            // Paso 1: Obtener los productos de la subcolección
            const dataCollection = collection(
                db,
                'forms-prueba',
                '[cod-client]',
            ) // Cambia 'products' por el nombre de tu subcolección

            const productsCollection = query(dataCollection, 'product')
            const querySnapshot = await getDocs(productsCollection)

            const products = querySnapshot.docs.map((doc) => {
                const data = doc.data() as Product // Extraemos los datos
                return { ...data, id: doc.id } // Agregamos `id` sin duplicados
            })

            // Paso 2: Definir los datos base
            const data = {
                brands: [
                    { br_cod: 'b01', br_name: 'Brand #1' },
                    { br_cod: 'b02', br_name: 'Brand #2' },
                ],
                categories: [
                    { cat_cod: 'c01', cat_name: 'Category #1' },
                    { cat_cod: 'c02', cat_name: 'Category #2' },
                    { cat_cod: 'c03', cat_name: 'Category #3' },
                ],
                subcategories: [
                    { sub_cod: 's01', sub_name: 'Subcategory #1' },
                    { sub_cod: 's02', sub_name: 'Subcategory #2' },
                    { sub_cod: 's03', sub_name: 'Subcategory #3' },
                ],
            }

            // Paso 3: Procesar los productos
            const processedProducts = products.map((product) => {
                const { cod, product_name } = product

                // Extraer los códigos a partir de "cod"
                const categoryCode = cod.slice(0, 3) // Primeros 3 caracteres
                const subcategoryCode = cod.slice(3, 6) // Siguientes 3 caracteres
                const brandCode = cod.slice(6) // Resto del código

                // Buscar los nombres correspondientes
                const category =
                    data.categories.find((cat) => cat.cat_cod === categoryCode)
                        ?.cat_name || 'Desconocido'
                const subcategory =
                    data.subcategories.find(
                        (sub) => sub.sub_cod === subcategoryCode,
                    )?.sub_name || 'Desconocido'
                const brand =
                    data.brands.find((br) => br.br_cod === brandCode)
                        ?.br_name || 'Desconocido'

                return {
                    category,
                    subcategory,
                    brand,
                    product_name,
                }
            })

            // Paso 4: Mostrar los resultados
            processedProducts.forEach((item) => {
                console.log(`Categoría: ${item.category}`)
                console.log(`Subcategoría: ${item.subcategory}`)
                console.log(`Marca: ${item.brand}`)
                console.log(`Producto: ${item.product_name}`)
                console.log('-----------------------------')
            })
        } catch (error) {
            console.error('Error al obtener y procesar los productos:', error)
            toast.error('Error al obtener y procesar los productos.')
        }
    }

    useEffect(() => {
        fetchAndDisplayProducts()
    }, [])

    return <div>hoak</div>
}

export default FormularioPrueba
