import SimpleInput from "~/Components/SimpleInput"
import { FuelInputRows } from "./Accordions/Rows/FuelInputRows"
import CurrencyFormatter from "~/Components/Lib/CurrencyFormatter";

const FuelSalesInput = ({fuelSales, setFuelSales}) => {
    const tableHeader = ["Fuel", "Price", "Trans Ct", "Volume", "Amount"]

    const handleDiscount = (input) => {
        setFuelSales({
            ...fuelSales,
            discount: Number(input)
        })
    }

    const handleTax = (input) => {
        setFuelSales({
            ...fuelSales,
            taxExemption: Number(input)
        })
    }
    
    return (
        <div className="h-min w-full border-[1px]">
            <div className="bg-blue-100 p-3 text-gray-500 font-semibold">
                Fuel Sales Info (Total Deliveries)
            </div>

            <div className="py-6 px-3">
                <table className="border-[1px] h-full w-full">
                    <thead>
                        <tr className="border-b-[1px]">
                            {tableHeader.map((label, index) => {
                                return <td className="py-4 text-gray-600 text-center font-semibold" key={index}>{label}</td>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {fuelSales?.content?.map((item, index) => {
                            return (
                                <tr key={index} className="border-b-[1px]">
                                    <FuelInputRows
                                        fuelData={item}
                                        fuelSales={fuelSales}
                                        setFuelSales={setFuelSales}
                                    />
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                <div className="grid grid-cols-2 gap-6 my-4 px-4">
                    <div className="grid gap-1">
                        <SimpleInput
                            version={3}
                            label={"Fuel Discount"}
                            placeholder={""}
                            icon={''}
                            type={"number"}
                            textAlign={"right"}
                            initialValue={fuelSales?.discount}
                            setInitialValue={handleDiscount}
                        />
                    </div>
                    <div className="grid gap-1">
                        <SimpleInput
                            version={3}
                            label={"Fuel Tax Exemption"}
                            placeholder={""}
                            icon={''}
                            type={"number"}
                            textAlign={"right"}
                            initialValue={fuelSales?.taxExemption}
                            setInitialValue={handleTax}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FuelSalesInput