const functions = require('firebase-functions')
const { defineSecret } = require('firebase-functions/params')
const OpenAI = require('openai')
require('dotenv').config() // Carga las variables del archivo .env

const apiKey = process.env.OPENAI_API_KEY || functions.config().openai?.api_key

const openai = new OpenAI({
    apiKey: apiKey, // Usa la clave desde el entorno local o de Firebase
})

exports.getOpenAIResponse = functions.https.onCall(async (data, context) => {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: data.conversation,
            temperature: 0.5,
            top_p: 0.5,
        })

        return { success: true, data: response.data }
    } catch (error) {
        console.error('Error al obtener respuesta de OpenAI:', error)
        return { success: false, error: error.message }
    }
})
