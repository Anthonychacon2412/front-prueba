import React, { useState, useEffect } from 'react'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import {
    getStorage,
    ref,
    uploadBytes,
    listAll,
    getDownloadURL,
    deleteObject,
} from 'firebase/storage'
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Snackbar,
    IconButton,
    Typography,
    Box,
} from '@mui/material'
import { db, storage } from '@/configs/firebaseAssets.config'
import { FaSave, FaCloudUploadAlt, FaTrash } from 'react-icons/fa' // Importar iconos de React Icons
import { Button } from '@/components/ui'
import Tooltip from '@/components/ui/Tooltip'

const Restore = () => {
    const [backups, setBackups] = useState<{ name: string; url: string }[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false)
    const [snackbarMessage, setSnackbarMessage] = useState<string>('')

    useEffect(() => {
        fetchBackups()
    }, [])

    const fetchBackups = async () => {
        const storageRef = ref(storage, 'backups/')
        const result = await listAll(storageRef)
        const backupsData = await Promise.all(
            result.items.map(async (item) => {
                const url = await getDownloadURL(item)
                return { name: item.name, url }
            }),
        )
        setBackups(backupsData)
    }

    const handleBackup = async () => {
        const data: { [key: string]: any } = {}
        const collections = [
            'Plantilla_rutas',
            'Rutas',
            'activacion',
            'clientes',
            'establecimientos',
            'forms-prueba',
            'forms-resp-prueba',
            'regiones',
            'supervisiones',
            'usuarios',
        ] // Reemplaza con tus nombres de colección

        for (const collectionName of collections) {
            const querySnapshot = await getDocs(collection(db, collectionName))
            data[collectionName] = {}
            querySnapshot.forEach((doc) => {
                data[collectionName][doc.id] = doc.data()
            })
        }

        // Formatear la fecha actual
        const now = new Date()
        const formattedDate = `${now.getFullYear()}-${String(
            now.getMonth() + 1,
        ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(
            now.getHours(),
        ).padStart(2, '0')}-${String(now.getMinutes()).padStart(
            2,
            '0',
        )}-${String(now.getSeconds()).padStart(2, '0')}`
        const fileName = `copia-seguridad-${formattedDate}.json`

        const blob = new Blob([JSON.stringify(data)], {
            type: 'application/json',
        })
        const storageRef = ref(storage, `backups/${fileName}`)
        await uploadBytes(storageRef, blob)
        fetchBackups()
    }

    const handleRestore = async (url: string) => {
        setLoading(true)
        try {
            const response = await fetch(
                'https://restorebackup-ozzehddkba-uc.a.run.app',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url }),
                },
            )

            if (response.ok) {
                setSnackbarMessage('Restauración completada con éxito')
                setSnackbarOpen(true)
            } else {
                setSnackbarMessage('Error al restaurar la copia de seguridad')
                setSnackbarOpen(true)
            }
        } catch (error) {
            console.error('Error al restaurar la copia de seguridad:', error)
            setSnackbarMessage('Error al restaurar la copia de seguridad')
            setSnackbarOpen(true)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (fileName: string) => {
        try {
            const storageRef = ref(storage, `backups/${fileName}`)
            await deleteObject(storageRef)
            setSnackbarMessage('Copia de seguridad eliminada con éxito')
            setSnackbarOpen(true)
            fetchBackups() // Actualizar la lista de backups
        } catch (error) {
            console.error('Error al eliminar la copia de seguridad:', error)
            setSnackbarMessage('Error al eliminar la copia de seguridad')
            setSnackbarOpen(true)
        }
    }

    return (
        <Box sx={{ padding: 3 }}>
            <h2 className="mb-6 mt-6 flex justify-start items-center space-x-4">
                <span className="font-bold dark:text-gray-200 text-gray-800 flex items-center">
                    <FaCloudUploadAlt className="mx-4 text-blue-600" />
                    Copia de seguridad / Restauración
                </span>
            </h2>

            <div className="flex mt-6 justify-end">
                <Button
                    color="sky"
                    style={{ backgroundColor: '#3B82F6' }}
                    className="mb-4 text-white hover:opacity-80 flex items-center justify-center"
                    onClick={handleBackup}
                >
                    <FaSave className="w-5 h-5 mr-4" />
                    Guardar copia de seguridad
                </Button>
            </div>

            {/* Tabla de backups */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow className="bg-gray-200 dark:bg-gray-800 p-4">
                            <TableCell>Archivo</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {backups.map((backup, index) => (
                            <TableRow key={index}>
                                <TableCell>{backup.name}</TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Restaurar">
                                        <IconButton
                                            color="secondary"
                                            onClick={() =>
                                                handleRestore(backup.url)
                                            }
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <CircularProgress size={24} />
                                            ) : (
                                                <FaCloudUploadAlt className="text-blue-400" />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Eliminar">
                                        <IconButton
                                            color="error"
                                            onClick={() =>
                                                handleDelete(backup.name)
                                            }
                                        >
                                            <FaTrash className="h-5 w-5" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Snackbar para mensajes */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </Box>
    )
}

export default Restore
