import { useEffect } from 'react'
import { getSalesDashboardData, useAppSelector } from '../store'
import { useAppDispatch } from '@/store'
import { Card } from '@/components/ui'
import Charts from './Charts'

const SalesDashboardBody = () => {
    const dispatch = useAppDispatch()

    const dashboardData = useAppSelector(
        (state) => state.salesDashboard.data.dashboardData,
    )

    const loading = useAppSelector((state) => state.salesDashboard.data.loading)

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchData = () => {
        dispatch(getSalesDashboardData())
    }

    return (
        <>
            <div className="text-center p-8 bg-white rounded-lg">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    Bienvenidos a Mobility
                </h1>
                <p className="text-gray-600 mb-6">
                    La solución integral para gestionar tu merchandising de
                    manera eficiente y efectiva. ¡Explora nuestras herramientas
                    y optimiza tu estrategia de ventas!
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <Card />
                    <Card>
                        <Charts />
                    </Card>
                </div>
            </div>
        </>
    )
}

export default SalesDashboardBody
