import { Table } from '@/components/ui'
import TBody from '@/components/ui/Table/TBody'
import Td from '@/components/ui/Table/Td'
import Th from '@/components/ui/Table/Th'
import THead from '@/components/ui/Table/THead'
import Tr from '@/components/ui/Table/Tr'
import React from 'react'

const visualizacion = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Visualizacion de Rutas</h1>
            <div className="overflow-x-auto">
                <Table>
                    <THead>
                        <Tr>
                            <Th>Nombre Establecimiento</Th>
                            <Th>Dia</Th>
                            <Th>Direccion</Th>
                            <Th>Mapa</Th>
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

export default visualizacion
