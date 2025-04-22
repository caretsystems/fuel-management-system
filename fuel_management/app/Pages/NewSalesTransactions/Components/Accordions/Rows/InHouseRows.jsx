import { Button } from "@heroui/react";
import CurrencyFormatter from "~/Components/Lib/CurrencyFormatter";
import { PurchaseOrder, SampleEmployeeName } from "~/Constants/Labels";

export const InHouseRows = ({ currentData, content, setContent, setPurpose, setOpenAdd, setEditData, productList, customerList }) => {

    return (
        <>
            <td className="px-6 py-1">
                {currentData?.id + 1}
            </td>
            <td className="px-6 py-1">
                {currentData?.invoiceNo}
            </td>
            <td className="px-6 py-1">
                {customerList.filter((item)=>item.id==currentData?.customerName)[0]?.name}
            </td>
            <td className="px-6 py-1">
                {productList.filter((item)=>item.id==currentData?.product)[0]?.description}
            </td>
            <td className="px-6 py-1">
                {currentData?.quantity}
            </td>
            <td className="px-6 py-1">
                {CurrencyFormatter(currentData?.poAmount)}
            </td>
            <td className="py-1">
                <Button
                    className="rounded-md font-semibold text-base"
                    color="primary"
                    variant="flat"
                    size="sm"
                    onPress={() => {
                        setEditData(currentData)
                        setPurpose('edit')
                        setOpenAdd(true)
                    }}
                >
                    Edit
                </Button>
            </td>
        </>
    )
}