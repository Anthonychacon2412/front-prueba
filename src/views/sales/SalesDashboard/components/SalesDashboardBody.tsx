import { useEffect } from 'react'
import { getSalesDashboardData, useAppSelector } from '../store'
import { useAppDispatch } from '@/store'

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

    return <></>
}

export default SalesDashboardBody
