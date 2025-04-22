import { useState, useEffect } from "react"
import ActionButtons from "../Components/ActionButtons"
import AdditionalComments from "../Components/AdditionalComments"
import CashierInput from "../Components/InputModes/CashierInput"
import ManagerInput from "../Components/InputModes/ManagerInput"
import TaxTotals from "../Components/TaxTotals"
import VarianceCheck from "../Components/VarianceCheck"
import { useUploadDailySalesInputForecourt } from "~/Hooks/Sales/useUploadDailySalesForecourt"
import { useUploadDailySalesInputSelect } from "~/Hooks/Sales/useUploadDailySalesSelect"
import { Form } from "@heroui/react"
import useGetForecourtInput from "~/Hooks/Sales/useGetForecourtInput"
import useGetSelectInput from "~/Hooks/Sales/useGetSelectInput"
import useGetFuelSales from "~/Hooks/Sales/useGetFuelSales"
import { fetchFuelMasters } from "~/Hooks/Setup/GlobalRecords/FuelMaster/useFuelMasters"
import { useUploadDailySalesInputManager } from "~/Hooks/Sales/useUploadDailySalesManager"
import { fetchStationTanks } from "~/Hooks/Setup/Station/StationTank/useStationTanks"

const DailySalesInput = ({
    editId,
    setOpenAdd,
    selectedMode,
    effectivityDate,
    selectedStation,
    selectedShiftManager,
    selectedShift,
    employee,
    shiftStationManagers
}) => {
    const [cashData, setCashData] = useState({
        content: [],
        lastCash: 0,
        float: 0,
        total: 0
    })
    const [poData, setPoData] = useState({
        content: [],
        total: 0
    })
    const [redemptionData, setRedemptionData] = useState({
        content: [],
        total: 0
    })
    const [cardData, setCardData] = useState({
        content: [],
        total: 0
    })
    const [lubricantSalesData, setLubricantSalesData] = useState({
        content: [],
        total: 0
    })
    const [fuelData, setFuelData] = useState({
        content: [],
        discount: 0,
        taxExemption: 0,
        total: 0
    })
    const [discountData, setDiscountData] = useState({
        content: [],
        total: 0
    })
    const [recievableData, setRecievableData] = useState({
        content: [],
        total: 0
    })
    const [checkData, setCheckData] = useState({
        content: [],
        total: 0
    })
    const [inventoryData, setInventoryData] = useState({
        content: [],
        total: 0
    })
    const [tankTotal, setTankTotal] = useState([])

    const [salesGrandTotal, setSalesGrandTotal] = useState(0)
    const [netDepartmentTotal, setNetDepartmentTotal] = useState(0)
    const [variance, setVariance] = useState(0)
    const [comment, setComment] = useState('')

    const [vatableSales, setVatableSales] = useState(0)
    const [vatAmount, setVatAmount] = useState(0)
    const [vatExemptSales, setVatExemptSales] = useState(0)
    const [vatZeroRatedSales, setVatZeroRatedSales] = useState(0)
    const [managerTotal, setManagerTotal] = useState(0)

    //managerTotal computation
    useEffect(() => {
        const compute = () => {
            let sum = Number(vatableSales) + Number(vatAmount) + Number(vatExemptSales) + Number(vatZeroRatedSales)
            setManagerTotal(sum)
        }
        compute()
    }, [vatableSales, vatAmount, vatExemptSales, vatZeroRatedSales])

    // fetch fuel data for manager input
    useEffect(() => {
        const getData = async () => {
            if (selectedMode == 3 && selectedStation !== '' && selectedShift!=='') {
                const res = await useGetFuelSales(effectivityDate, selectedStation, selectedShift)
                if (res.success == true) {
                    setFuelData(res?.message)
                }
            }
        }
        getData()
    }, [selectedMode, effectivityDate, selectedStation, selectedShift])

    useEffect(() => {
        const getData = async () => {
            if (fuelData.content.length == 0) {
                const res = await fetchFuelMasters()
                let tempArray = []
                for (let item of res) {
                    tempArray.push({
                        fuelId: item.id,
                        fuelName: item.code,
                        color: item?.color,
                        transCt: 0,
                        volume: 0,
                        amount: 0
                    })
                }
                setFuelData({
                    ...fuelData,
                    content: tempArray
                })
            }

            if (selectedStation!='' && selectedStation!==undefined) {
                const res2 = await fetchStationTanks(selectedStation)
                let tempArray2 = []
                for (let i = 0; i < res2.length; i++) {
                    tempArray2.push({
                        tank: i + 1,
                        fuelName: res2[i]?.code,
                        fuelId: res2[i]?.fuelmasterid,
                        color: res2[i]?.color,
                        price: 0,
                        dip: 0,
                        volume: 0
                    })
                }
                setTankTotal(tempArray2)
            }
        }
        getData()
    }, [selectedMode, selectedStation])

    // fetch data for item update
    useEffect(() => {
        const getData = async () => {
            if (editId !== '') {
                if (selectedMode == 1) {
                    const res = await useGetForecourtInput(effectivityDate, selectedStation, editId)
                    if (res.success == true) {
                        console.log(res?.message?.redemptionData)
                        setCashData(res?.message?.cashData)
                        setPoData(res?.message?.poData)
                        setRedemptionData(res?.message?.redemptionData)
                    }
                } else if (selectedMode == 2) {
                    const res = await useGetSelectInput(effectivityDate, selectedStation, editId)

                }
            }
        }
        getData()
    }, [editId])

    useEffect(() => {
        const compute = () => {
            let sum = cashData?.content?.reduce((total, data) => {
                return total = total + data.total
            }, 0)
            let finalAmount = sum + cashData?.lastCash - cashData?.float
            setCashData({ ...cashData, total: finalAmount })
        }
        compute()
    }, [cashData?.content, cashData?.float, cashData?.lastCash])

    useEffect(() => {
        const compute = () => {
            let sum = poData?.content?.reduce((total, data) => {
                let result = data?.poAmount
                return total = total + result
            }, 0)
            setPoData({ ...poData, total: sum })
        }
        compute()
    }, [poData?.content])

    useEffect(() => {
        const compute = () => {
            let sum = redemptionData?.content?.reduce((total, data) => {
                let result = data?.amount
                return total = total + result
            }, 0)
            setRedemptionData({ ...redemptionData, total: sum })
        }
        compute()
    }, [redemptionData?.content])

    useEffect(() => {
        const compute = () => {
            let sum = cardData?.content?.reduce((total, data) => {
                return total = total + data?.amount
            }, 0)
            setCardData({ ...cardData, total: sum })
        }
        compute()
    }, [cardData?.content])

    useEffect(() => {
        const compute = () => {
            let sum = inventoryData?.content?.reduce((total, data) => {
                let result = data?.quantity * data?.amount
                return total = total + result
            }, 0)
            setInventoryData({ ...inventoryData, total: sum })
        }
        compute()
    }, [inventoryData?.content])

    useEffect(() => {
        const compute = () => {
            let sum = lubricantSalesData?.content?.reduce((total, data) => {
                let result = data?.amount
                return total = total + result
            }, 0)
            setLubricantSalesData({ ...lubricantSalesData, total: sum })
        }
        compute()
    }, [lubricantSalesData?.content])

    useEffect(() => {
        const compute = () => {
            let sum = fuelData?.content?.reduce((total, data) => {
                return total = total + data?.amount
            }, 0)
            setFuelData({ ...fuelData, total: sum })
        }
        compute()
    }, [fuelData?.content])

    useEffect(() => {
        const compute = () => {
            let sum = discountData?.content?.reduce((total, data) => {
                let result = data?.amount
                return total = total + result
            }, 0)
            setDiscountData({ ...discountData, total: sum })
        }
        compute()
    }, [discountData?.content])

    useEffect(() => {
        const compute = () => {
            let sum = recievableData?.content?.reduce((total, data) => {
                return total = total + data?.amount
            }, 0)
            setRecievableData({ ...recievableData, total: sum })
        }
        compute()
    }, [recievableData?.content])

    useEffect(() => {
        const compute = () => {
            let sum = checkData?.content?.reduce((total, data) => {
                return total = total + data?.amount
            }, 0)
            setCheckData({ ...checkData, total: sum })
        }
        compute()
    }, [checkData?.content])

    //sales grand total computation
    useEffect(() => {
        const compute = () => {
            let sum = cashData?.total + poData?.total + redemptionData?.total + cardData?.total
            setSalesGrandTotal(sum)
        }
        compute()
    }, [cashData?.total, poData?.total, redemptionData?.total, cardData?.total])

    //net department sales total computation
    useEffect(() => {
        const compute = () => {
            let sum = (lubricantSalesData?.total + fuelData?.total) - (discountData.total + recievableData.total + checkData.total)
            setNetDepartmentTotal(sum)
        }
        compute()
    }, [lubricantSalesData?.total, fuelData?.total, inventoryData?.total, discountData.total, recievableData.total, checkData.total])

    //variance computation
    useEffect(() => {
        const compute = () => {
            let diff = salesGrandTotal - netDepartmentTotal
            setVariance(diff)
        }
        compute()
    }, [salesGrandTotal, netDepartmentTotal])

    const submitHandler = async () => {
        // try {
            if (selectedStation == '') alert("Please select a station!")
            else if (selectedShiftManager == '') alert("Please select an employee!")
            else if (selectedShift == '') alert("Please select a shift!")
            else {
                const data = new FormData()
                const filterData = {
                    selectedMode,
                    effectivityDate,
                    selectedStation,
                    selectedShiftManager,
                    selectedShift
                }
                data.append("filterData", JSON.stringify(filterData))
                if (selectedMode != 3) {
                    data.append("cashData", JSON.stringify(cashData))
                    selectedMode == 1 && data.append("poData", JSON.stringify(poData))
                    data.append("redemptionData", JSON.stringify(redemptionData))
                    data.append("cardData", JSON.stringify(cardData))

                    selectedMode == 1 && data.append("lubricantSalesData", JSON.stringify(lubricantSalesData))
                    selectedMode == 1 && data.append("fuelData", JSON.stringify(fuelData))
                    data.append("discountData", JSON.stringify(discountData))
                    selectedMode == 1 && data.append("recievableData", JSON.stringify(recievableData))
                    selectedMode == 1 && data.append("checkData", JSON.stringify(checkData))
                    selectedMode == 2 && data.append("inventoryData", JSON.stringify(inventoryData))

                    data.append("salesGrandTotal", salesGrandTotal)
                    data.append("netDepartmentTotal", netDepartmentTotal)
                    data.append("variance", variance)
                    data.append("comment", comment)
                } else {
                    data.append("fuelData", JSON.stringify(fuelData))
                    data.append("tankTotal", JSON.stringify(tankTotal))
                    data.append("vatableSales", vatableSales) 
                    data.append("vatAmount", vatAmount) 
                    data.append("vatExemptSales", vatExemptSales) 
                    data.append("vatZeroRatedSales", vatZeroRatedSales) 
                    data.append("managerTotal", managerTotal)
                    data.append("comment", comment)
                }
                if (selectedMode == 1) {
                    const res = await useUploadDailySalesInputForecourt(data)
                    alert("useUploadDailySalesInputForecourt " + res.message)
                    setOpenAdd(false)
                } else if (selectedMode == 2) {
                    const res = await useUploadDailySalesInputSelect(data)
                    alert("useUploadDailySalesInputSelect " + res.message)
                    setOpenAdd(false)
                } else if (selectedMode == 3) {
                    const res = await useUploadDailySalesInputManager(data)
                    alert("useUploadDailySalesInputManager " + res.message)
                    setOpenAdd(false)
                }
            }
        // } catch (err) {
        //     console.log(err)
        //     alert("CATCH ERROR "+err)
        // }
    }

    return (
        <Form className="grid lg:grid-cols-9 gap-8">
            <div className="lg:col-span-6 grid gap-10">
                {selectedMode != 3 ?
                    <CashierInput
                        selectedMode={selectedMode}
                        employee={employee}
                        cashData={cashData}
                        setCashData={setCashData}
                        poData={poData}
                        setPoData={setPoData}
                        redemptionData={redemptionData}
                        setRedemptionData={setRedemptionData}
                        cardData={cardData}
                        setCardData={setCardData}

                        lubricantSalesData={lubricantSalesData}
                        setLubricantSalesData={setLubricantSalesData}
                        fuelData={fuelData}
                        setFuelData={setFuelData}
                        discountData={discountData}
                        setDiscountData={setDiscountData}
                        recievableData={recievableData}
                        setRecievableData={setRecievableData}
                        checkData={checkData}
                        setCheckData={setCheckData}
                        inventoryData={inventoryData}
                        setInventoryData={setInventoryData}
                    />
                    :
                    <ManagerInput
                        fuelData={fuelData}
                        setFuelData={setFuelData}
                        tankTotal={tankTotal}
                        setTankTotal={setTankTotal}
                    />
                }
            </div>
            <div className={`lg:col-span-3 lg:flex-col lg:flex grid grid-cols-2 gap-4 ${selectedMode != 3 ? 'lg:mt-6' : ''}`}>
                {selectedMode != 3 ?
                    <VarianceCheck
                        salesGrandTotal={salesGrandTotal}
                        netDepartmentTotal={netDepartmentTotal}
                        variance={variance}
                    />
                    :
                    <TaxTotals
                        vatableSales={vatableSales}
                        vatAmount={vatAmount}
                        vatExemptSales={vatExemptSales}
                        vatZeroRatedSales={vatZeroRatedSales}
                        managerTotal={managerTotal}
                        setVatableSales={setVatableSales}
                        setVatAmount={setVatAmount}
                        setVatExemptSales={setVatExemptSales}
                        setVatZeroRatedSales={setVatZeroRatedSales}
                    />
                }
                <div className="flex flex-col justify-between">
                    <AdditionalComments
                        comment={comment}
                        setComment={setComment}
                    />
                    <ActionButtons
                        selectedMode={selectedMode}
                        submitHandler={submitHandler}
                        setOpenAdd={setOpenAdd}
                    />
                </div>
            </div>
        </Form>
    )
}

export default DailySalesInput