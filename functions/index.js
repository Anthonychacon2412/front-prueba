const functions = require('firebase-functions/v2')
const { defineSecret } = require('firebase-functions/params')
const OpenAI = require('openai')
require('dotenv').config() // Carga las variables del archivo .env

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
