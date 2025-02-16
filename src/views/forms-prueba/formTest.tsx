import { Button, Dialog, FormItem, Select, Spinner } from '@/components/ui'
import { db } from '@/configs/firebaseAssets.config'
import { ColumnDef } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { DataTable } from '@/components/shared'
import { useNavigate } from 'react-router-dom'
import { HiRefresh } from 'react-icons/hi'
import * as XLSX from 'xlsx'
import { getFunctions, httpsCallable } from 'firebase/functions'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const functions = getFunctions()
const getOpenAIResponse = httpsCallable(functions, 'getOpenAIResponse')

const FormularioPrueba = () => {
    const [forms, setForms] = useState<any[]>([])
    const [clients, setClients] = useState<any[]>([])
    const [formularios, setFormularios] = useState<any[]>([])
    const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null)
    const [formularioSeleccionado, setFormularioSeleccionado] =
        useState<any>(null)
    const [resultados, setResultados] = useState<any[]>([])

    const [loading, setLoading] = useState(false)
    const [dialogIsOpen, setIsOpen] = useState(false)

    const openDialog = () => setIsOpen(true)
    const onDialogClose = () => setIsOpen(false)

    const navigate = useNavigate()

    const getFormData = async () => {
        try {
            setLoading(true)

            // Obtener formularios
            const querySnapshot = await getDocs(
                collection(db, 'forms-resp-prueba'),
            )
            const documentos = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))

            // Obtener clientes con sus formularios
            const querySnapshotClients = await getDocs(
                query(collection(db, 'clientes')),
            )
            const opcionesClientes = querySnapshotClients.docs.map((doc) => {
                const data = doc.data()
                return {
                    value: doc.id,
                    label: data.nombre,
                    formularios: (data.formularios || []).map(
                        (formulario: any) => ({
                            value: formulario,
                            label: formulario,
                        }),
                    ),
                }
            })

            setClients(opcionesClientes)
            setForms(documentos)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching documents:', error)
        }
    }

    useEffect(() => {
        getFormData()
    }, [])

    const handleClienteChange = (selectedCliente: any) => {
        setClienteSeleccionado(selectedCliente)
        setFormularios(selectedCliente ? selectedCliente.formularios : [])
    }

    const ActionColumn = ({ row }: { row: any }) => (
        <Button size="sm" onClick={() => navigate(`/forms/${row.original.id}`)}>
            Ver detalle
        </Button>
    )

    const columns: ColumnDef<any>[] = useMemo(
        () => [
            {
                header: 'Usuario',
                accessorKey: 'nombre_usuario',
                cell: (props) => <span>{props.getValue() as string}</span>,
            },
            {
                header: 'Nombre Formulario',
                accessorKey: 'nombre_formulario',
                cell: (props) => <span>{props.getValue() as string}</span>,
            },
            {
                header: 'Establecimiento',
                accessorKey: 'establecimiento',
                cell: (props) => <span>{props.getValue() as string}</span>,
            },
            {
                header: '',
                id: 'action',
                cell: (props) => <ActionColumn row={props.row} />,
            },
        ],
        [],
    )
    const generarExcel = (data: any) => {
        // Mapear datos para estructurar las filas del Excel
        const filas = data?.map((item: any) => ({
            'Cliente UID': item.cliente_uid,
            'Nombre Cliente': item.nombre_cliente,
            Establecimiento: item.establecimiento,
            'Establecimiento ID': item.establecimiento_id,
            'Nombre Usuario': item.nombre_usuario,
            'Nombre Formulario': item.nombre_formulario,
            Región: item.region,
            'Fecha Llenado': new Date(
                item.fecha_llenado.seconds * 1000,
            ).toLocaleString(),
            'Fecha Sincronización': new Date(
                item.fecha_sincronizacion.seconds * 1000,
            ).toLocaleString(),
            'Número de Fotos': item.photos ? item.photos.length : 0,
        }))

        // Crear hoja de trabajo (worksheet)
        const hojaTrabajo = XLSX.utils.json_to_sheet(filas)

        // Crear libro de trabajo (workbook)
        const libroTrabajo = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(libroTrabajo, hojaTrabajo, 'Datos')

        // Generar archivo Excel
        XLSX.writeFile(libroTrabajo, 'datos_exportados.xlsx')
    }

    // Ajusta esta importación según tu proyecto

    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

    const generarPDF = (json) => {
        const { explicacion, data } = json

        if (!data || !data.mejor_promotor || !data.ranking) {
            console.error('Datos insuficientes para generar el PDF')
            setIsGeneratingPDF(false)
            return
        }

        const { mejor_promotor, ranking } = data
        const doc = new jsPDF()

        // Título del documento
        doc.setFontSize(18)
        doc.text('Análisis de Promotores', 10, 20)

        // Explicación con mejor separación
        doc.setFontSize(12)
        doc.text(`Explicación:`, 10, 30)
        doc.setFontSize(10)
        doc.text(explicacion, 10, 40, { maxWidth: 180 })

        let currentY = doc.lastAutoTable?.finalY || 50

        // Espaciado antes de la siguiente sección
        currentY += 10
        doc.setFontSize(14)
        doc.text('Mejor Promotor', 10, currentY)

        doc.setFontSize(12)
        currentY += 10
        doc.text(`Nombre: ${mejor_promotor.nombre_usuario}`, 10, currentY)
        currentY += 10
        doc.text(
            `Tiempo de Respuesta: ${mejor_promotor.tiempo_respuesta} segundos`,
            10,
            currentY,
        )
        currentY += 10
        doc.text(
            `Formularios Completados: ${mejor_promotor.formularios_completados}`,
            10,
            currentY,
        )
        currentY += 10
        doc.text(
            `Fotos Adjuntas: ${mejor_promotor.fotos_adjuntas}`,
            10,
            currentY,
        )

        // Espaciado antes del ranking
        currentY += 15
        doc.setFontSize(14)
        doc.text('Ranking de Promotores', 10, currentY)

        // Generar tabla con margen adecuado
        autoTable(doc, {
            head: [['Nombre', 'Tiempo de Respuesta', 'Formularios', 'Fotos']],
            body: ranking.map((promotor) => [
                promotor.nombre_usuario,
                promotor.tiempo_respuesta,
                promotor.formularios_completados,
                promotor.fotos_adjuntas,
            ]),
            startY: currentY + 10,
            theme: 'striped',
            headStyles: { fillColor: [35, 47, 62], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [240, 240, 240] },
            margin: { top: 10, left: 10, right: 10 },
        })

        // Descargar el PDF
        doc.save('analisis_promotores.pdf')

        setIsGeneratingPDF(false) // Desactivar el estado de carga
        onDialogClose()
    }

    const realizarConsulta = async (datos: any) => {
        const jsonStrcuture = {
            explicacion: 'Aquí pones el análisis detallado...',
            data: {
                mejor_promotor: {
                    nombre_usuario: 'Nombre',
                    tiempo_respuesta: 'Tiempo en segundos',
                    formularios_completados: 'cantidad',
                    fotos_adjuntas: 'cantidad',
                },
                ranking: [
                    {
                        nombre_usuario: 'Nombre',
                        tiempo_respuesta: 'tiempo',
                        formularios_completados: 'cantidad',
                        fotos_adjuntas: 'cantidad',
                    },
                ],
            },
        }

        try {
            console.log('Hice la consulta')

            const conversation = [
                {
                    role: 'system',
                    content:
                        'JSON. Eres un analista de datos que evalúa el rendimiento de promotores basándose en registros JSON.',
                },
                {
                    role: 'user',
                    content: `JSON. Aquí tienes los datos en formato JSON: ${JSON.stringify(
                        datos,
                    )}.`,
                },
                {
                    role: 'user',
                    content: `JSON. Analiza los datos dados anteriormente y dime quién fue el promotor más rápido y efectivo, basado en:
                              - Tiempo entre "fecha_llenado" y "fecha_sincronizacion".
                              - Cantidad de formularios completados.
                              - Número de fotos adjuntas.
                              Devuelve la respuesta en JSON con esta estructura: ${JSON.stringify(
                                  jsonStrcuture,
                              )}.
                              `,
                },
            ]

            console.log(conversation)
            const response = await getOpenAIResponse({ conversation })

            console.log('Respuesta de la IA:', response.data)

            if (!response.data || !response.data.data) {
                throw new Error(
                    'La respuesta de la IA no contiene datos válidos.',
                )
            }

            const json = JSON.parse(response.data.data)

            // Validar que la estructura de datos sea la esperada
            if (
                !json.data ||
                !json.data.mejor_promotor ||
                !json.data.ranking ||
                !Array.isArray(json.data.ranking)
            ) {
                throw new Error(
                    'Estructura de datos incorrecta en la respuesta de la IA.',
                )
            }

            generarPDF(json)
            generarExcel(json)
        } catch (error) {
            console.error('Error al obtener la respuesta:', error)
        }
    }

    const buscarRegistros = async () => {
        if (!clienteSeleccionado || !formularioSeleccionado) {
            alert('Debe seleccionar un cliente y un formulario.')
            return
        }

        try {
            setIsGeneratingPDF(true) // Activar el estado de carga

            const q = query(
                collection(db, 'forms-resp-prueba'),
                where('cliente_uid', '==', clienteSeleccionado.value),
                where('nombre_formulario', '==', formularioSeleccionado.value),
            )

            const querySnapshot = await getDocs(q)
            const datos = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))

            console.log('Datos:', datos)
            realizarConsulta(datos)
        } catch (error) {
            console.error('Error al obtener los datos:', error)
            setIsGeneratingPDF(false) // Desactivar el estado de carga en caso de error
        }
    }

    return (
        <div>
            {loading ? (
                <div className="flex justify-center items-center h-full w-full">
                    <Spinner size={40} />
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h2>Formularios</h2>
                        <div className="flex space-x-2">
                            <Button
                                onClick={getFormData}
                                icon={<HiRefresh />}
                            />
                            <Button
                                variant="solid"
                                color="orange-500"
                                onClick={openDialog}
                            >
                                Reporte
                            </Button>
                        </div>
                    </div>
                    <DataTable columns={columns} data={forms} />
                </>
            )}
            <Dialog isOpen={dialogIsOpen} onClose={onDialogClose}>
                <FormItem label="Seleccione un Cliente">
                    <Select options={clients} onChange={handleClienteChange} />
                </FormItem>
                <FormItem label="Seleccione un Formulario">
                    <Select
                        options={formularios}
                        onChange={(selectedFormulario) =>
                            setFormularioSeleccionado(selectedFormulario)
                        }
                    />
                </FormItem>
                {isGeneratingPDF ? (
                    <div className="flex justify-center items-center my-4">
                        <Spinner size={30} />
                        <p className="ml-2">Generando PDF...</p>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <Button
                            variant="solid"
                            color="orange-500"
                            onClick={buscarRegistros}
                        >
                            Generar reporte
                        </Button>
                    </div>
                )}
            </Dialog>
        </div>
    )
}

export default FormularioPrueba
