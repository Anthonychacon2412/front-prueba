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
            {
                key: 'pages.visualizacion',
                path: `${APP_PREFIX_PATH}/visualizacion-rutas`,
                title: 'Visualizacion de Rutas',
                translateKey: 'nav.pages.visualizacion-rutas',
                icon: 'eye',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                subMenu: [],
            },
            {
                key: 'pages.plantilla-rutas',
                path: `${APP_PREFIX_PATH}/plantilla-rutas`,
                title: 'Plantilla Rutas',
                translateKey: 'nav.pages.plantilla-rutas',
                icon: 'ruta',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                subMenu: [],
            },
            {
                key: 'pages.asignacion_promotor',
                path: `${APP_PREFIX_PATH}/asignacion_promotor`,
                title: 'Asignacion ruta promotores',
                translateKey: 'nav.pages.asignacion_promotor',
                icon: 'ruta',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                subMenu: [],
            },
            {
                key: 'pages.establecimientos',
                path: `${APP_PREFIX_PATH}/establecimientos`,
                title: 'Establecimientos',
                translateKey: 'nav.pages.establecimientos',
                icon: 'ruta',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                subMenu: [],
            },
        ],
    },
]

export default pagesNavigationConfig
