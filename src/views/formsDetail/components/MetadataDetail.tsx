import { useState } from 'react'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiPencilAlt, HiOutlineTrash } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/store'
import moment from 'moment'

type CustomerInfoFieldProps = {
    title?: string
    value?: string
}

const CustomerInfoField = ({ title, value }: CustomerInfoFieldProps) => {
    return (
        <div>
            <span>{title}</span>
            <p className="text-gray-700 dark:text-gray-200 font-semibold">
                {value}
            </p>
        </div>
    )
}

const CustomerProfileAction = ({ id }: { id?: string }) => {
    const dispatch = useAppDispatch()
    const [dialogOpen, setDialogOpen] = useState(false)

    const navigate = useNavigate()

    const onDialogClose = () => {
        setDialogOpen(false)
    }

    const onDialogOpen = () => {
        setDialogOpen(true)
    }

    const onDelete = () => {
        setDialogOpen(false)
    }

    const onEdit = () => {
        // dispatch(openEditCustomerDetailDialog())
    }

    return (
        <>
            <Button block icon={<HiOutlineTrash />} onClick={onDialogOpen}>
                Delete
            </Button>
            <Button
                block
                icon={<HiPencilAlt />}
                variant="solid"
                onClick={onEdit}
            >
                Edit
            </Button>
            <ConfirmDialog
                isOpen={dialogOpen}
                type="danger"
                title="Delete customer"
                confirmButtonColor="red-600"
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
                onCancel={onDialogClose}
                onConfirm={onDelete}
            >
                <p>
                    Are you sure you want to delete this customer? All record
                    related to this customer will be deleted as well. This
                    action cannot be undone.
                </p>
            </ConfirmDialog>
        </>
    )
}

const ProfileDetail = ({ data = {} }: any) => {
    function getInitials(name: string): string {
        return name.match(/(\b\S)?/g)?.join('') ?? ''
    }

    const initials = data?.nombre_usuario
        ? getInitials(data?.nombre_usuario)
        : ''
    return (
        <Card>
            <div className="flex flex-col xl:justify-between h-full 2xl:min-w-[320px] mx-auto w-[40vh]">
                <div className="flex xl:flex-col items-center gap-4">
                    {/* <Avatar size={90} shape="circle" src={data?.img} /> */}
                    <div
                        className="relative inline-block"
                        style={{
                            width: '90px',
                            height: '90px',
                            padding: '2px',
                            background:
                                'linear-gradient(45deg, #f1c40f, #f39c12, #e67e22, #d35400)',
                            borderRadius: '50%',
                        }}
                    >
                        <div
                            className="w-full h-full rounded-full bg-white flex items-center justify-center"
                            style={{
                                width: 'calc(100% - 4px)',
                                height: 'calc(100% - 4px)',
                                margin: '2px',
                            }}
                        >
                            <span className="text-xl font-bold text-[#af601a]">
                                {initials}
                            </span>
                        </div>
                    </div>
                    <h4 className="font-bold text-center">
                        {data?.nombre_usuario}
                    </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-y-4 gap-x-4 mt-8">
                    <CustomerInfoField
                        title="Cliente"
                        value={data?.nombre_cliente}
                    />
                    <CustomerInfoField
                        title="Establecimiento visitado"
                        value={data?.establecimiento}
                    />
                    <CustomerInfoField
                        title="Formulario Cargado"
                        value={data?.nombre_formulario}
                    />
                    <CustomerInfoField
                        title="Fecha de sincronización"
                        value={moment
                            .unix(data?.fecha_sincronizacion.seconds)
                            .format('DD/MM/YYYY')}
                    />
                    <CustomerInfoField
                        title="Cantidad de fotos cargadas"
                        value={data?.photos?.length}
                    />
                </div>
            </div>
        </Card>
    )
}

export default ProfileDetail
