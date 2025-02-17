import { ColumnDef, DataTable } from '@/components/shared'
import { Button, Dialog, Spinner, Tooltip } from '@/components/ui'
import { useAppDispatch } from '@/store'
import { collection, getDocs, query } from 'firebase/firestore'
import React, { useEffect, useMemo, useState } from 'react'
import { HiOutlineEye, HiOutlinePhotograph } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import { db } from '@/configs/firebaseAssets.config'
import { MdOutlineSupervisedUserCircle } from 'react-icons/md'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { Navigation, Pagination } from 'swiper/modules'

interface SupervisionEntry {
    pregunta: string
    respuesta: boolean | string
}

interface FotosEntry {
    foto: string // URL de la foto
}

interface Supervisiones {
    supervisor: string
    cliente: string
    establecimiento: string
    promotor: string
    fecha: string
    supervision: SupervisionEntry[]
    fotos: FotosEntry[] // Array de fotos
}

const Supervisiones = () => {
    const [data, setData] = useState<Supervisiones[]>([])
    const [dialogIsOpen, setIsOpen] = useState<{ [key: string]: boolean }>({
        respuestas: false,
        fotos: false,
    })
    const [selectedRow, setSelectedRow] = useState<Supervisiones | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    const getData = async () => {
        try {
            setLoading(true)
            const q = query(collection(db, 'supervisiones'))
            const querySnapshot = await getDocs(q)
            const dataDocs: Supervisiones[] = []

            querySnapshot.forEach((doc) => {
                dataDocs.push(doc.data() as Supervisiones)
            })

            setData(dataDocs)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getData()
    }, [])

    const openDialog = (type: string, row: Supervisiones) => {
        setSelectedRow(row)
        setIsOpen((prev) => ({ ...prev, [type]: true }))
    }

    const onDialogClose = (type: string) => {
        setIsOpen((prev) => ({ ...prev, [type]: false }))
        setSelectedRow(null)
    }

    const formatRespuesta = (respuesta: boolean | string) => {
        if (typeof respuesta === 'boolean') {
            return respuesta ? 'Sí' : 'No'
        }
        return respuesta
    }

    const ActionColumn = ({ row }: { row: Supervisiones }) => {
        const navigate = useNavigate()

        return (
            <div className="flex justify-end text-lg">
                <Tooltip title="Ver respuestas">
                    <span
                        className="cursor-pointer p-2 hover:text-orange-500"
                        onClick={() => openDialog('respuestas', row)}
                    >
                        {loading ? <Spinner /> : <HiOutlineEye />}
                    </span>
                </Tooltip>
                <Tooltip title="Ver fotos">
                    <span
                        className="cursor-pointer p-2 hover:text-orange-500"
                        onClick={() => openDialog('fotos', row)}
                    >
                        {loading ? <Spinner /> : <HiOutlinePhotograph />}
                    </span>
                </Tooltip>
            </div>
        )
    }

    const columns: ColumnDef<Supervisiones>[] = useMemo(
        () => [
            {
                header: 'Supervisor',
                accessorKey: 'supervisor',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Cliente',
                accessorKey: 'cliente',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Establecimiento',
                accessorKey: 'establecimiento',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Promotor',
                accessorKey: 'promotor',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Fecha',
                accessorKey: 'fecha',
                cell: (props: any) => <span>{props.getValue()}</span>,
            },
            {
                header: 'Acciones',
                id: 'action',
                cell: (props) => <ActionColumn row={props.row.original} />,
            },
        ],
        [],
    )

    const handleFullScreen = (imageUrl: string) => {
        const elem = document.createElement('img')
        elem.src = imageUrl
        elem.style.position = 'fixed'
        elem.style.top = '0'
        elem.style.left = '0'
        elem.style.width = '100vw'
        elem.style.height = '100vh'
        elem.style.objectFit = 'contain'
        elem.style.zIndex = '9999'
        elem.style.cursor = 'pointer'
        elem.onclick = () => {
            document.body.removeChild(elem)
        }
        document.body.appendChild(elem)
    }

    return (
        <div className="ml-3 p-2">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <MdOutlineSupervisedUserCircle
                        size={40}
                        className="text-amber-600 mr-4"
                    />
                    <div>
                        <h1 className="mb-0 pb-0 text-3xl">Supervisiones</h1>
                        <span className="text-xs">
                            Supervisa y gestiona actividades y desempeño de los
                            promotores.
                        </span>
                    </div>
                </div>
            </div>
            <DataTable columns={columns} data={data} />

            {/* Modal para Ver Fotos como Carrusel */}
            <Dialog
                isOpen={dialogIsOpen.fotos}
                onClose={() => onDialogClose('fotos')}
                onRequestClose={() => onDialogClose('fotos')}
            >
                <h5 className="mb-4">Fotos para {selectedRow?.cliente}</h5>
                {selectedRow?.fotos.length ? (
                    <Swiper
                        spaceBetween={10}
                        navigation
                        pagination={{ clickable: true }}
                        modules={[Navigation, Pagination]}
                        className="mySwiper"
                    >
                        {selectedRow.fotos.map((entry, index) => (
                            <SwiperSlide key={index}>
                                <div
                                    className="relative group cursor-pointer"
                                    onClick={() => handleFullScreen(entry.foto)} // Llamada para mostrar la imagen en pantalla completa
                                >
                                    <img
                                        src={entry.foto}
                                        alt={`Foto ${index}`}
                                        className="transition-transform duration-200 transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <span className="text-xl font-bold">
                                            Ver en pantalla completa
                                        </span>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : (
                    <p>No hay fotos disponibles.</p>
                )}
            </Dialog>
        </div>
    )
}

export default Supervisiones
