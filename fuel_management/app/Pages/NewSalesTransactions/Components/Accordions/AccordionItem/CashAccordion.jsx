import { PlusIcon } from 'lucide-react'
import { useState, useEffect } from "react"
import { Button } from "@heroui/react";
import { DiscountRows } from '../Rows/DiscountRows';
import { CashRows } from '../Rows/CashRows';
import AddCash from '../../Modals/AddCash';
import SimpleInput from '~/Components/SimpleInput';
import { CashRows2 } from '../Rows/CashRows2';
import CurrencyFormatter from '~/Components/Lib/CurrencyFormatter';

export const CashAccordion = ({
    employee,
    cashData,
    setCashData
}) => {
    const [inHouse, setInhouse] = useState({
        title: "Cash",
        tableHeaders: [
            "Amount",
            "Time",
            "Received by"
        ]
    })
    const [totalAmount, setTotalAmount] = useState(0);
    const [openAdd, setOpenAdd] = useState(false);
    const [purpose, setPurpose] = useState('add');
    const [editData, setEditData] = useState(undefined);

    useEffect(() => {
        const compute = () => {
            let sum = cashData?.content?.reduce((total, data) => {
                return total = total + data.total
            }, 0)
            setTotalAmount(sum)
        }
        compute()
    }, [cashData?.content])

    const handleUpdate1 = (input) => {
        setCashData({
            ...cashData,
            lastCash: Number(input)
        })
    }

    const handleUpdate2 = (input) => {
        setCashData({
            ...cashData,
            float: Number(input)
        })
    }

    return (
        <div className="bg-white rounded-lg p-4">
            <AddCash
                openModal={openAdd}
                setOpenModal={setOpenAdd}
                content={cashData}
                setContent={setCashData}
                title={purpose === "add" ? "Add new" : "Edit"}
                purpose={purpose}
                editData={editData}
                setEditData={setEditData}
                employee={employee}
            />

            <div className="w-full flex justify-between items-baseline py-4">
                <label className='text-gray-500'>Safedrops</label>
                <Button
                    onPress={() => {
                        setPurpose('add')
                        setOpenAdd(true)
                        setEditData(undefined)
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
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 border-1">
                    <thead className="text-xs text-gray-900 uppercase dark:text-gray-400">
                        <tr className="border-b-1">
                            <th scope="col" className="px-6 py-3">
                                No.
                            </th>
                            {inHouse.tableHeaders.map((item, index) => (
                                <th key={item} scope="col" className="px-6 py-3">
                                    {item}
                                </th>
                            ))}
                            <th scope="col" className="px-6 py-3">
                                Edit
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {cashData?.content?.map((item, index) => {
                            return (
                                <tr key={index} className="border-b-1">
                                    <CashRows2
                                        currentData={item}
                                        content={cashData?.content}
                                        setContent={setCashData}
                                        setPurpose={setPurpose}
                                        setOpenAdd={setOpenAdd}
                                        setEditData={setEditData}
                                        employee={employee}

                                    />
                                </tr>
                            )
                        })}
                        <tr className="border-b-1">
                            <th className="px-6 py-1 h-8"></th>
                        </tr>
                        <tr className="border-b-1">
                            <th className="px-6 py-2 text-base text-gray-900">Total</th>
                            <td className="px-6 py-2 text-base text-gray-900 font-semibold">{CurrencyFormatter(totalAmount)}</td>
                        </tr>
                    </tbody>
                </table>

                <div className='my-8 grid grid-cols-3 gap-4'>
                    <SimpleInput
                        version={3}
                        label={"Last Cash"}
                        textAlign={"right"}
                        type={"number"}
                        initialValue={cashData?.lastCash}
                        setInitialValue={handleUpdate1}
                    />
                    <SimpleInput
                        version={3}
                        label={"Float"}
                        textAlign={"right"}
                        type={"number"}
                        initialValue={cashData?.float}
                        setInitialValue={handleUpdate2}
                    />
                    <div className='grid'>
                        <label className="font-semibold text-gray-500">Total Cash Sales</label>
                        <label className='bg-gray-100 rounded-md mt-1 font-semibold text-right p-2'>
                            {CurrencyFormatter(cashData?.total)}
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}