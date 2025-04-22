import SimpleInput from "~/Components/SimpleInput"
import { useEffect, useState } from "react"
import { Button } from "@heroui/react";
import SimpleSelect from "~/Components/SimpleSelect";
import CurrencyFormatter from "~/Components/Lib/CurrencyFormatter"; 



export const InventoryRows = ({ index, data, inventoryData, setInventoryData, invCategoryList }) => {
    const [inventory, setInventory] = useState(data?.inventory)
    const [quantity, setQuantity] = useState(data?.quantity)
    const [amount, setAmount] = useState(data?.amount)

    useEffect(() => {
        const updateData = () => {
            let tempArray = inventoryData?.content.map((item) => {
                if (item.id == index) {
                    return {
                        ...item,
                        inventory: inventory,
                        amount: Number(amount),
                        quantity: Number(quantity)
                    }
                }
                return item
            })
            setInventoryData({
                ...inventoryData,
                content: tempArray
            })
        }
        updateData()
    }, [inventory, quantity, amount])

    return (
        <>
            <td className="px-6 py-1">
                {data?.id + 1}
            </td>
            <td className="px-1">
                <div className="min-w-32">
                    <SimpleSelect
                        label={""}
                        items={invCategoryList}
                        passedValue={inventory}
                        toUpdate={setInventory}
                    />
                </div>
            </td>
            <td className="px-4">
                <input
                    type={"number"}
                    className={`rounded-md py-2.5 px-2 text-center font-semibold bg-gray-200 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    placeholder={"type here"}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                />
            </td>
            <td className="px-4">
                <input
                    type={"number"}
                    className={`rounded-md py-2.5 px-2 text-center font-semibold bg-gray-200 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    placeholder={"type here"}
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </td>
        </>
    )
}