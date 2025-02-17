const functions = require('firebase-functions')
const admin = require('firebase-admin')
const fetch = require('node-fetch')
const { OpenAI } = require('openai')
const axios = require('axios')
const cors = require('cors')({ origin: true })
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

exports.downloadImage = functions.https.onRequest(async (req, res) => {
    try {
        // Habilitar CORS
        res.set('Access-Control-Allow-Origin', '*')
        res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
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

        // Obtener la imagen desde la URL
        const response = await fetch(url)

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                error: `Error al obtener la imagen: ${response.status} ${response.statusText}`,
            })
        }

        // Obtener el tipo de contenido
        const contentType = response.headers.get('content-type')

        if (!contentType || !contentType.startsWith('image/')) {
            return res.status(400).json({
                success: false,
                error: 'La URL proporcionada no es una imagen válida',
            })
        }

        // Obtener la imagen como buffer
        const buffer = await response.arrayBuffer()

        // Establecer los encabezados de respuesta
        res.set('Content-Type', contentType)
        res.set('Content-Disposition', 'inline; filename="downloaded-image"')

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

exports.restoreBackup = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const { url } = req.body

        if (!url) {
            return res.status(400).send('URL no proporcionada')
        }

        try {
            const response = await axios.get(url)
            const data = response.data

            if (typeof data !== 'object') {
                return res
                    .status(400)
                    .send('El archivo de copia de seguridad no es válido')
            }

            const db = admin.firestore()

            // Limpiar colecciones existentes antes de restaurar
            for (const collectionId in data) {
                const collectionRef = db.collection(collectionId)
                const snapshot = await collectionRef.get()
                snapshot.forEach(async (doc) => {
                    await doc.ref.delete()
                })
            }

            // Restaurar datos
            for (const collectionId in data) {
                for (const docId in data[collectionId]) {
                    await db
                        .collection(collectionId)
                        .doc(docId)
                        .set(data[collectionId][docId])
                }
            }

            res.status(200).send('Restauración completada')
        } catch (error) {
            console.error('Error al restaurar la copia de seguridad:', error)
            res.status(500).send('Error al restaurar la copia de seguridad')
        }
    })
})
