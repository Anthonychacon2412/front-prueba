import React, { useState, useEffect, useMemo } from 'react'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import {
    getStorage,
    ref,
    uploadBytes,
    listAll,
    getDownloadURL,
    deleteObject,
} from 'firebase/storage'

import { db, storage } from '@/configs/firebaseAssets.config'

import { Button, Notification, toast } from '@/components/ui'
import Tooltip from '@/components/ui/Tooltip'
import { LucideTrash2, LucideUploadCloud } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared'

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
                toast.push(
                    <Notification
                        title="Restauración completada con éxito"
                        type="success"
                    />,
                )
            } else {
                toast.push(
                    <Notification
                        title="Error al restaurar la copia de seguridad"
                        type="danger"
                    />,
                )
            }
        } catch (error) {
            console.error('Error al restaurar la copia de seguridad:', error)
            toast.push(
                <Notification
                    title="Error al restaurar la copia de seguridad"
                    type="danger"
                />,
            )
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (fileName: string) => {
        try {
            const storageRef = ref(storage, `backups/${fileName}`)
            await deleteObject(storageRef)
            toast.push(
                <Notification
                    title="Copia de seguridad eliminada con éxito"
                    type="success"
                />,
            )

            fetchBackups() // Actualizar la lista de backups
        } catch (error) {
            console.error('Error al eliminar la copia de seguridad:', error)
            toast.push(
                <Notification
                    title="Error al eliminar la copia de seguridad"
                    type="danger"
                />,
            )
        }
    }

    const ActionColumn = ({ row }: { row: any }) => {
        return (
            <div className="flex justify-center text-lg space-x-2">
                <Tooltip title={'Restaurar copia de seguridad'}>
                    <span
                        className="cursor-pointer p-2 hover:text-orange-500"
                        onClick={() => handleRestore(row.original.url)}
                    >
                        <LucideUploadCloud />
                    </span>
                </Tooltip>
                <Tooltip title={'Eliminar copia de seguridad'}>
                    <span
                        className="cursor-pointer p-2 hover:text-orange-500"
                        onClick={() => handleDelete(row.original.name)}
                    >
                        <LucideTrash2 />
                    </span>
                </Tooltip>
            </div>
        )
    }

    const columns: ColumnDef<any>[] = useMemo(
        () => [
            {
                header: 'Nombre',
                accessorKey: 'name',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },

            {
                header: '',
                id: 'action',
                cell: (props) => <ActionColumn row={props.row} />,
            },
        ],
        [],
    )

    return (
        <div className="ml-3 p-2">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <LucideUploadCloud
                        size={40}
                        className="text-amber-600 mr-4"
                    />
                    <div>
                        <h1 className="mb-0 pb-0 text-3xl">
                            Copia de Seguridad y Restauración
                        </h1>
                        <span className="text-xs">
                            Genera copias de seguridad y restaura la información
                            almacenada en la base de datos.
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        // className="ml-4 bg-orange-400 text-white rounded-md shadow-md hover:bg-orange-500 active:bg-orange-600 transition duration-200 hover:opacity-80"
                        onClick={handleBackup}
                        variant="solid"
                    >
                        Guardar copia de seguridad
                    </Button>
                </div>
            </div>

            <DataTable data={backups} columns={columns} />
        </div>
    )
}

export default Restore
