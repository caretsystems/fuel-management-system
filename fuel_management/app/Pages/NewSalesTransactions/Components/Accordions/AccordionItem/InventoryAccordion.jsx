import { PlusIcon } from 'lucide-react'
import { useState } from "react"
import { Button, card } from "@heroui/react";
import CurrencyFormatter from "~/Components/Lib/CurrencyFormatter";
import SimpleSelect from '~/Components/SimpleSelect';
import { InventoryRows } from '../Rows/InventoryRows';

export const InventoryAccordion = ({
    inventoryData,
    setInventoryData,
    invCategoryList
}) => {
    const [inHouse, setInhouse] = useState({
        title: "Sales By Category",
        tableHeaders: [
            "Inventory Category",
            "Quantity",
            "Amount"
        ]
    })

    return (
        <div className="bg-white rounded-lg p-4">
            <div className="w-full flex justify-end py-4">
                <Button
                    onPress={() => {
                        let tempArray = inventoryData?.content.concat([
                            {
                                id: inventoryData?.content.length,
                                inventory: '',
                                quantity: 0,
                                amount: 0
                            }
                        ])
                        setInventoryData({
                            ...inventoryData,
                            content: tempArray
                        })
                    }}
                    startContent={
                        <div className="h-6 w-6 flex items-center">
                            <PlusIcon />
                        </div>
                    }
                    color="primary"
                    className="font-semibold rounded-md px-6"
                >
                    Add New
                </Button>
            </div>
            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-900 uppercase dark:text-gray-400">
                        <tr className="">
                            <th scope="col" className="px-6 py-3">
                                No.
                            </th>
                            {inHouse.tableHeaders.map((item, index) => (
                                <th key={item} scope="col" className="px-6 py-3">
                                    {item}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {inventoryData?.content?.map((item, index) => {
                            return (
                                <tr key={index} className="">
                                    <InventoryRows
                                        index={index}
                                        data={item}
                                        inventoryData={inventoryData}
                                        setInventoryData={setInventoryData}
                                        invCategoryList={invCategoryList}
                                    />
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                <div className='flex justify-end mt-12'>
                    <div className='grid min-w-56'>
                        <label className="font-semibold text-gray-500">Total Amount</label>
                        <label className='bg-gray-100 rounded-md mt-1 font-semibold text-right p-2'>
                            {CurrencyFormatter(inventoryData?.total)}
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}