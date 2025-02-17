import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import useAuth from '@/utils/hooks/useAuth'
import { useAppSelector } from '@/store'
import { Link, useNavigate } from 'react-router-dom'
import classNames from 'classnames'
import { HiOutlineUser, HiOutlineCog, HiOutlineLogout } from 'react-icons/hi'
import { FiActivity } from 'react-icons/fi'
import type { CommonProps } from '@/@types/common'
import { FaUserCircle } from 'react-icons/fa'
import { APP_PREFIX_PATH } from '@/constants/route.constant'

type DropdownList = {
    label: string
    path: string
    icon: JSX.Element
}

const _UserDropdown = ({ className }: CommonProps) => {
    const { userName, email } = useAppSelector((state) => state.auth.user)
    const navigate = useNavigate()

    const { signOut } = useAuth()

    const UserAvatar = (
        <div className={classNames(className, 'flex items-center gap-2')}>
            <Avatar
                size="md"
                src="/img/logo/logo.png"
                alt="avatar"
                shape="circle"
                className="cursor-pointer bg-[#fff3e0]"
            />
            <div className="hidden md:block">
                <div className="font-bold">{userName}</div>
                <div className="text-xs">{email}</div>
            </div>
        </div>
    )

    console.log(userName)

    return (
        <div>
            <Dropdown
                menuStyle={{ minWidth: 240 }}
                renderTitle={UserAvatar}
                placement="bottom-end"
            >
                <Dropdown.Item
                    onClick={() => navigate(`${APP_PREFIX_PATH}/perfil`)}
                >
                    <div className="py-2 px-3 flex items-center gap-2">
                        <div>
                            <div className="font-bold">Ver perfil</div>
                        </div>
                    </div>
                </Dropdown.Item>
                <Dropdown.Item variant="divider" />
                <Dropdown.Item
                    eventKey="Sign Out"
                    className="gap-2 "
                    onClick={signOut}
                >
                    <span className="text-xl opacity-50 text-amber-700">
                        <HiOutlineLogout />
                    </span>
                    <span className="text-amber-700">Cerrar Sesión</span>
                </Dropdown.Item>
            </Dropdown>
        </div>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
