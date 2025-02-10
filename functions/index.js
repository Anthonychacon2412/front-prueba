const functions = require('firebase-functions')
const admin = require('firebase-admin')
const fetch = require('node-fetch')
const { OpenAI } = require('openai')
require('dotenv').config()

admin.initializeApp()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

exports.getOpenAIResponse = functions.https.onCall(async (data) => {
    try {
        console.log('Datos recibidos en Firebase:', data.data)

        // Validar la estructura de la conversación
        if (!data.data.conversation || !Array.isArray(data.data.conversation)) {
            throw new Error(
                "El parámetro 'conversation' no es válido. Datos recibidos: " +
                    JSON.stringify(data.data),
            )
        }

        console.log('Llamando a la API de OpenAI con:', data.data.conversation)

        // Llamada a la API de OpenAI
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: data.data.conversation,
            response_format: { type: 'json_object' },
            temperature: 0.5,
            top_p: 0.5,
        })

        // Extraer solo los datos necesarios
        const messageContent =
            (response &&
                response.choices &&
                response.choices[0] &&
                response.choices[0].message &&
                response.choices[0].message.content) ||
            'Sin respuesta de OpenAI'

        console.log('Respuesta de OpenAI:', messageContent)

        return {
            success: true,
            data: messageContent,
        }
    } catch (error) {
        console.error('Error en OpenAI:', error)

        let errorMessage = 'Error desconocido'
        try {
            errorMessage = error.message || JSON.stringify(error)
        } catch (serializationError) {
            console.error(
                'Error al serializar el mensaje de error:',
                serializationError,
            )
        }

        return {
            success: false,
            error: errorMessage,
        }
    }
})

exports.downloadImages = functions.https.onRequest(async (req, res) => {
    try {
        // Habilitar CORS
        res.set('Access-Control-Allow-Origin', '*')
        res.set('Access-Control-Allow-Methods', 'GET')
        res.set('Access-Control-Allow-Headers', 'Content-Type')

        // Manejar solicitudes preflight OPTIONS
        if (req.method === 'OPTIONS') {
            return res.status(204).send()
        }

        const { url } = req.query

        if (!url || typeof url !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'El parámetro "url" es requerido y debe ser una cadena válida',
            })
        }

        console.log('Descargando imagen desde:', url)

        // Usar fetch nativo de Node.js 18
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(
                `Error al obtener la imagen: ${response.status} ${response.statusText}`,
            )
        }

        // Obtener la imagen como un buffer
        const buffer = await response.arrayBuffer()

        // Establecer el tipo de contenido de la respuesta
        res.setHeader(
            'Content-Type',
            response.headers.get('content-type') || 'image/jpeg',
        )

        // Enviar la imagen como respuesta
        res.status(200).send(Buffer.from(buffer))
    } catch (error) {
        console.error('Error al descargar imagen:', error)

        res.status(500).json({
            success: false,
            error: error.message || 'Error desconocido',
        })
    }
})
