import { Button, Select } from '@/components/ui'
import React from 'react'

const Forms = () => {
    return (
        <div className="flex h-screen bg-slate-400">
            <main className="flex-1 p-6 bg-white">
                <h1 className="text-2xl font-semibold">Formularios</h1>
                <div className="grid grid-cols-3 gap-3 bg-white p-10 rounded-lg shadow-md">
                    <div className="grid grid-rows-2 gap-3 p-10">
                        <form>
                            <div>
                                <label
                                    htmlFor="clientes"
                                    className="block text-gray-700"
                                >
                                    Clientes
                                </label>
                                <Select></Select>
                            </div>
                        </form>
                        <form>
                            <div>
                                <label
                                    htmlFor="establecimientos"
                                    className="block text-gray-700"
                                >
                                    Establecimientos
                                </label>
                                <Select></Select>
                            </div>
                        </form>
                    </div>
                    <div className="flex justify-center items-center">
                        <div className="bg-orange-500 w-1 h-60"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-center w-full mb-4">
                            <Button
                                size="md"
                                className="border-orange-400 hover:bg-orange-200 mr-2 h-[20vh] rounded-full"
                            >
                                Fundamental
                            </Button>
                            <Button className="border-orange-400 hover:bg-orange-200 ml-2 h-[20vh]">
                                Competencia
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Forms
