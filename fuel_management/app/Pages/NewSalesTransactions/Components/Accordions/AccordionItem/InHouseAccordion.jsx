import { PlusIcon } from 'lucide-react'
import { useState } from "react"
import { Button } from "@heroui/react";
import { InHouseRows } from '../Rows/InHouseRows';
import AddPo from '../../Modals/AddPo';
import CurrencyFormatter from "~/Components/Lib/CurrencyFormatter";

export const InHouseAccordion = ({
    poData,
    setPoData,
    productList,
    customerList
}) => {
    const [inHouse, setInhouse] = useState({
        title: "P.O. Inhouse Account",
        tableHeaders: [
            "Invoice No.",
            "Account Name",
            "Product",
            "Quantity",
            "PO Amount",
        ]
    })
    const [openAdd, setOpenAdd] = useState(false);
    const [purpose, setPurpose] = useState('add');
    const [editData, setEditData] = useState(undefined);

    return (
        <div className="bg-white rounded-lg p-4">
            <AddPo
                openModal={openAdd}
                setOpenModal={setOpenAdd}
                content={poData}
                setContent={setPoData}
                title={purpose === "add" ? "Add new" : "Edit"}
                purpose={purpose}
                editData={editData}
                setEditData={setEditData}
                productList={productList}
                customerList={customerList}
            />

            <div className="w-full flex justify-end py-4">
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
                                <th key={item} scope="col" className="px-2 py-3">
                                    {item}
                                </th>
                            ))}
                            <th scope="col" className="px-6 py-3">
                                Edit
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {poData?.content?.map((item, index) => {
                            return (
                                <tr key={index} className="border-b-1">
                                    <InHouseRows
                                        currentData={item}
                                        content={poData?.content}
                                        setContent={setPoData}
                                        setPurpose={setPurpose}
                                        setOpenAdd={setOpenAdd}
                                        setEditData={setEditData}
                                        productList={productList}
                                        customerList={customerList}
                                    />
                                </tr>
                            )
                        })}
                        <tr className="border-b-1">
                            <th className="px-6 py-2 text-base text-gray-900">Total</th>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td className="px-6 py-2 text-base text-gray-900 font-semibold">{CurrencyFormatter(poData?.total)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}