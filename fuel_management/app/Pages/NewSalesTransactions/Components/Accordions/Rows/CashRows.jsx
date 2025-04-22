import SimpleInput from "~/Components/SimpleInput"
import { useEffect, useState } from "react"
import { Button } from "@heroui/react";
import SimpleSelect from "~/Components/SimpleSelect";
import CurrencyFormatter from "~/Components/Lib/CurrencyFormatter";
import { Bills } from "~/Constants/Labels";

export const CashRows = ({ index, data, content, setContent }) => {
    const [amount, setAmount] = useState(data?.amount)
    const [bill, setBill] = useState(data?.bill)
    const [quantity, setQuantity] = useState(data?.quantity)

    useEffect(() => {
        const updateData = () => {
            let tempArray = content.map((item) => {
                if (item.id == index) {
                    return {
                        ...item,
                        amount: Number(bill*quantity ),
                        bill: bill,
                        quantity: Number(quantity)
                    }
                }

                return item
            })
            setContent(tempArray) 

            console.log(tempArray)
        }
        updateData()
    }, [bill, quantity])

    return (
        <>
            <td className="px-1">
                <div className="min-w-32">
                    <SimpleSelect
                        label={"no-label"}
                        items={Bills}
                        passedValue={bill}
                        toUpdate={setBill}
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
            <td className="px-1 min-w-36">
                <p className="w-full text-right bg-gray-100 p-2 font-semibold rounded-md">{CurrencyFormatter(Number(bill)*Number(quantity))}</p>
            </td>
        </>
    )
}