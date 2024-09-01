import { Table } from '@/components/ui'
import TBody from '@/components/ui/Table/TBody'
import Td from '@/components/ui/Table/Td'
import Th from '@/components/ui/Table/Th'
import THead from '@/components/ui/Table/THead'
import Tr from '@/components/ui/Table/Tr'
import React from 'react'

const supervisiones = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Supervisiones</h1>
            <div className="overflow-x-auto">
                <Table>
                    <THead>
                        <Tr>
                            <Th>Supervisores</Th>
                            <Th>Cliente</Th>
                            <Th>Establecimiento</Th>
                            <Th>Promotor</Th>
                            <Th>Fecha</Th>
                            <Th>Ver Respuestas</Th>
                            <Th>Ver Fotos</Th>
                        </Tr>
                    </THead>
                    <TBody>
                        <Tr>
                            <Td></Td>
                        </Tr>
                    </TBody>
                </Table>{' '}
            </div>
        </div>
    )
}

export default supervisiones
