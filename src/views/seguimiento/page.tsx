import { Button, DatePicker, Select, Table } from '@/components/ui'
import TBody from '@/components/ui/Table/TBody'
import Td from '@/components/ui/Table/Td'
import Th from '@/components/ui/Table/Th'
import THead from '@/components/ui/Table/THead'
import Tr from '@/components/ui/Table/Tr'
import React from 'react'
import { HiOutlineSearch } from 'react-icons/hi'

const seguimiento = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Seguimiento</h1>
            <div className="flex justify-between">
                <Select className="w-48" placeholder="Clientes"></Select>
                <Select className="w-48" placeholder="Region"></Select>
                <Select className="w-48" placeholder="Usuario"></Select>
                <DatePicker className="w-48" placeholder="Fecha"></DatePicker>
                <Button variant="solid">
                    <HiOutlineSearch />
                </Button>
            </div>
        </div>
    )
}

export default seguimiento
