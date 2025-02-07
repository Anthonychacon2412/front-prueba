const functions = require('firebase-functions/v2')
const { defineSecret } = require('firebase-functions/params')
const OpenAI = require('openai')
require('dotenv').config() // Carga las variables del archivo .env
const JSZip = require('jszip')

const apiKey = process.env.OPENAI_API_KEY || functions.config().openai?.api_key

console.log(
    'Clave de OpenAI:',
    apiKey ? 'Cargada correctamente' : 'No encontrada',
)

const openai = new OpenAI({
    apiKey: apiKey, // Usa la clave desde el entorno local o de Firebase
})

exports.getOpenAIResponse = functions.https.onCall(async (data, context) => {
    console.log('Datos recibidos en Firebase:', JSON.stringify(data, null, 2)) // 📌 Debug

    if (!data || !data.conversation || !Array.isArray(data.conversation)) {
        console.error(
            "Error: El parámetro 'conversation' no fue enviado correctamente.",
            data,
        )
        return {
            success: false,
            error: "El parámetro 'conversation' no fue enviado correctamente.",
        }
    }

    try {
        // 🚀 Aquí se hace la llamada a OpenAI
        console.log('Enviando datos a OpenAI:', data.conversation)
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: data.conversation,
        })

        console.log('Respuesta de OpenAI recibida:', response)
        return { success: true, response: response }
    } catch (error) {
        console.error('Error al llamar OpenAI:', error)
        return { success: false, error: 'Error interno en OpenAI.' }
    }
})

exports.downloadImages = functions.https.onCall(async (res, req) => {
    // Permitir CORS
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        return res.status(204).send('')
    }

    try {
        const { imageUrls } = req.body

        if (!imageUrls || !Array.isArray(imageUrls)) {
            return res
                .status(400)
                .send(
                    'Debes proporcionar un array de URLs en el cuerpo de la solicitud.',
                )
        }

        const zip = new JSZip()

        // Descargar las imágenes y añadirlas al ZIP
        const downloadPromises = imageUrls.map(async (url, index) => {
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`Error al descargar la imagen desde: ${url}`)
            }
            const buffer = await response.buffer()
            zip.file(`imagen-${index + 1}.jpg`, buffer)
        })

        await Promise.all(downloadPromises)

        // Generar el archivo ZIP
        const zipContent = await zip.generateAsync({ type: 'nodebuffer' })

        // Enviar el archivo ZIP como respuesta
        res.set('Content-Type', 'application/zip')
        res.set('Content-Disposition', 'attachment; filename=imagenes.zip')
        res.status(200).send(zipContent)
    } catch (error) {
        console.error('Error al procesar las imágenes:', error)
        res.status(500).send('Ocurrió un error al procesar las imágenes.')
    }
})
