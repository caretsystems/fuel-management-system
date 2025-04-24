import { Accordion, AccordionItem } from "@heroui/react";
import LubricantSalesAccordion from "./AccordionItem/LubricantSalesAccordion";
import { FuelSalesAccordion } from "./AccordionItem/FuelSalesAccordion";
import { DiscountAccordion } from "./AccordionItem/DiscountAccordion";
import { RecievableAccordion } from "./AccordionItem/RecievableAccordion";
import { CheckAccordion } from "./AccordionItem/CheckAccordion";
import CurrencyFormatter from "~/Components/Lib/CurrencyFormatter";
import { InventoryAccordion } from "./AccordionItem/InventoryAccordion";

const DepartmentSales = ({
    selectedMode,
    lubricantSalesData,
    setLubricantSalesData,
    fuelData,
    setFuelData,
    discountData,
    setDiscountData,
    receivableData,
    setReceivableData,
    checkData,
    setCheckData,
    inventoryData,
    setInventoryData,
    employee,
    invCategoryList,
    fuelLubes,
    discountList,
    empChargeDescriptionList,
    disableAccordion
}) => {
 
    return (
        <Accordion
            isCompact
            variant="splitted"
            motionProps={{
                variants: {
                    enter: {
                        y: 0,
                        opacity: 1,
                        height: "auto",
                        overflowY: "unset",
                        transition: {
                            height: {
                                type: "spring",
                                stiffness: 300,
                                damping: 70,
                                duration: 2,
                            },
                            opacity: {
                                easings: "ease",
                                duration: 1,
                            },
                        },
                    },
                    exit: {
                        y: -10,
                        opacity: 0,
                        height: 0,
                        overflowY: "hidden",
                        transition: {
                            height: {
                                easings: "ease",
                                duration: 0.25,
                            },
                            opacity: {
                                easings: "ease",
                                duration: 0.3,
                            },
                        },
                    },
                },
            }}
            itemClasses={{
                title: "text-gray-500 font-semibold",
                startContent: "absolute right-10 text-gray-500"
            }}
        >
            {selectedMode == 2 && (

                <AccordionItem
                    className="w-full bg-gray-100 shadow-none overflow-hidden"
                    key={"Inventory Sales"}
                    aria-label={"Inventory Sales"}
                    title={"Category Sales"}
                    isDisabled={disableAccordion}
                >
                    <InventoryAccordion 
                        inventoryData={inventoryData}
                        setInventoryData={setInventoryData}
                        invCategoryList={invCategoryList}
                    />
                </AccordionItem>
            )}
            {selectedMode == 1 && (
                <AccordionItem
                    className="w-full bg-gray-100 shadow-none overflow-hidden relative"
                    key={"Forecourt Lubricant Sales"}
                    aria-label={"Forecourt Lubricant Sales"}
                    title={"Forecourt Lubricant Sales"}
                    startContent={
                        <label className="font-semibold">{CurrencyFormatter(lubricantSalesData?.total)}</label>
                    }
                    isDisabled={disableAccordion}
                >
                    <LubricantSalesAccordion
                        lubricantSalesData={lubricantSalesData}
                        setLubricantSalesData={setLubricantSalesData}
                        fuelLubes={fuelLubes}
                        employeeList={employee}
                    />
                </AccordionItem>
            )}
            {selectedMode == 1 && (
                <AccordionItem
                    className="w-full bg-gray-100 shadow-none overflow-hidden relative"
                    key={"Fuel Sales"}
                    aria-label={"Fuel Sales"}
                    title={"Fuel Sales"}
                    startContent={
                        <label className="font-semibold">{CurrencyFormatter(fuelData?.total)}</label>
                    }
                    isDisabled={disableAccordion}
                >
                    <FuelSalesAccordion
                        fuelData={fuelData}
                        setFuelData={setFuelData}
                    />
                </AccordionItem>
            )}

            <AccordionItem
                className="w-full bg-gray-100 shadow-none overflow-hidden"
                key={"Discounts Charged to Shell"}
                aria-label={"Discounts Charged to Shell"}
                title={"Discounts"}
                isDisabled={disableAccordion}
            >
                <DiscountAccordion
                    discountData={discountData}
                    setDiscountData={setDiscountData}
                    discountList={discountList}
                />
            </AccordionItem>

            {selectedMode == 1 && (
                <AccordionItem
                    className="w-full bg-gray-100 shadow-none overflow-hidden"
                    key={"Receivable"}
                    aria-label={"Receivable"}
                    title={"Employee Receivable"}
                    isDisabled={disableAccordion}
                >
                    <RecievableAccordion
                        receivableData={receivableData}
                        setReceivableData={setReceivableData}
                        employeeList={employee}
                        empChargeDescriptionList={empChargeDescriptionList}
                    />
                </AccordionItem>
            )}
            {selectedMode == 1 && (
                <AccordionItem
                    className="w-full bg-gray-100 shadow-none overflow-hidden"
                    key={"Check Payments"}
                    aria-label={"Check Payments"}
                    title={"Check Payments"}
                    isDisabled={disableAccordion}
                >
                    <CheckAccordion
                        checkData={checkData}
                        setCheckData={setCheckData}
                    />
                </AccordionItem>
            )}
        </Accordion>
    )
}

export default DepartmentSales