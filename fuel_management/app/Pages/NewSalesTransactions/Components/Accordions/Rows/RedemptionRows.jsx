import { Button } from "@heroui/react";
import CurrencyFormatter from "~/Components/Lib/CurrencyFormatter"; 

export const RedemptionRows = ({ currentData, content, setContent, setPurpose, setOpenAdd, setEditData, paymentModeList }) => {
    return (
        <>
            <td className="px-6 py-1">
                {currentData?.id + 1}
            </td>
            <td className="px-6 py-1">
                {paymentModeList.filter((item)=>item.id==currentData?.payment)[0]?.description }
            </td>
            <td className="px-6 py-1">
                {currentData?.quantity}
            </td>
            <td className="px-6 py-1">
                {CurrencyFormatter(currentData?.amount)}
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