import { APP_PREFIX_PATH, PAGES_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const pagesNavigationConfig: NavigationTree[] = [
    {
        key: '',
        path: '',
        title: '',
        translateKey: '',
        icon: '',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, USER],
        subMenu: [
            {
                key: 'Gestion de rutas y Clientes',
                path: '',
                title: 'Gestion de rutas y Clientes',
                translateKey: '',
                icon: 'rutas',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [
                    {
                        key: 'pages.clientes',
                        path: `${APP_PREFIX_PATH}/clientes`,
                        title: 'Clientes',
                        translateKey: 'nav.pages.clientes',
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
                        icon: 'business',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        subMenu: [],
                    },
                    {
                        key: 'pages.plantilla-rutas',
                        path: `${APP_PREFIX_PATH}/plantilla-rutas`,
                        title: 'Visualización Rutas',
                        translateKey: 'nav.pages.plantilla-rutas',
                        icon: 'newroute',
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
                ],
            },
            {
                key: 'Monitoreo',
                path: '',
                title: 'Monitoreo',
                translateKey: '',
                icon: 'monitor',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [
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
                        key: 'pages.appPhotos',
                        path: `${APP_PREFIX_PATH}/visualizacion-fotografias`,
                        title: 'Visualizacion de Fotos',
                        translateKey: 'nav.pages.clientes',
                        icon: 'ruta',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        subMenu: [],
                    },
                ],
            },

            {
                key: 'Evaluacion',
                path: '',
                title: 'Evaluacion',
                translateKey: '',
                icon: 'report',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
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
                ],
            },
            {
                key: 'Resultados',
                path: '',
                title: 'Resultados',
                translateKey: '',
                icon: 'statistic',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [
                    {
                        key: 'pages.appformprueba',
                        path: `${APP_PREFIX_PATH}/pruebaForm`,
                        title: 'Formularios',
                        translateKey: 'nav.pages.appformprueba',
                        icon: 'eye',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        subMenu: [],
                    },
                ],
            },
        ],
    },
]

export default pagesNavigationConfig
