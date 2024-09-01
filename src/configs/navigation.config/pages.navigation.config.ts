import { APP_PREFIX_PATH, PAGES_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const pagesNavigationConfig: NavigationTree[] = [
    {
        key: 'pages',
        path: '',
        title: 'PAGES',
        translateKey: 'nav.pages.pages',
        icon: 'pages',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, USER],
        subMenu: [
            {
                key: 'pages.supervisiones',
                path: `${APP_PREFIX_PATH}/supervisiones`,
                title: 'Supervisiones',
                translateKey: 'nav.pages.supervisiones',
                icon: 'crm',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                subMenu: [],
            },
            {
                key: 'pages.form',
                path: `${APP_PREFIX_PATH}/form`,
                title: 'Formulario',
                translateKey: 'nav.pages.form',
                icon: 'forms',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                subMenu: [],
            },
            {
                key: 'pages.seguimiento',
                path: `${APP_PREFIX_PATH}/seguimiento`,
                title: 'Seguimiento',
                translateKey: 'nav.pages.seguimiento',
                icon: 'maptime',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                subMenu: [],
            },
            
        
        ],
    },
]

export default pagesNavigationConfig
