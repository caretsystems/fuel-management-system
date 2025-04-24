
import { useState, useEffect } from "react";
import DepartmentSales from "../Accordions/DepartmentSales"
import SalesAccordion from "../Accordions/SalesAccordion"

import { fetchCustomers } from "~/Hooks/Setup/GlobalRecords/Customer/useCustomers";
import { fetchProductList, fetchPaymentModeList, fetchInventoryCategoryList, fetchDiscountList, fetchEmpChargeDescriptionList } from "~/Hooks/Sales/useGetParams";

const CashierInput = ({
    selectedMode,
    employee,
    cashData,
    setCashData,
    poData,
    setPoData,
    redemptionData,
    setRedemptionData,
    cardData,
    setCardData,
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
    disableAccordion,
    transactionUniqueID,
}) => {

    
    const [productList, setProductList] = useState([])
    const [customerList, setCustomerList] = useState([])
    const [paymentModeList, setPaymentModeList] = useState([])
    const [invCategoryList, setInvCategoryList] = useState([])
    const [discountList, setDiscountList] = useState([])
    const [empChargeDescriptionList, setEmpChargeDescriptionList] = useState([])
    
    const [fuelLubes,setFuelLubes] = useState([])
    
    useEffect(()=>{
        const getProducts = async () => {
            const result = await fetchProductList();
            const formattedProducts = result?.message?.map((prod) => ({
                id: prod.transid,
                description: "("+prod.category+") "+prod.code,
                category: prod.category
            }));
            setProductList(formattedProducts);  



            const formattedLubes = formattedProducts
            .filter(
                (product) =>
                    product.category.includes("lube") //&& // Check if category is "lube"
                    //poData.content.some((po) => po.product === product.id) // Check if product id exists in poData
            )
            .map((product) => ({
                 id: product.id,
                 description: product.description,
                 category: product.category,
            })); 
            setFuelLubes(formattedLubes);  

        };
        getProducts(); 

        
        const getCustomers = async () => {
            const result = await fetchCustomers(); 
            setCustomerList(result);
        };
        getCustomers(); 


        
        const getPaymentMode = async () => {
            const result = await fetchPaymentModeList();
            const formattedPaymentModes = result?.message?.map((pm) => ({
                id: pm.id,
                description: pm.name
            }));
            setPaymentModeList(formattedPaymentModes);
        };
        getPaymentMode();
        
        const getInventoryCategory = async () => {
            const result = await fetchInventoryCategoryList();
            const formattedInvCategory = result?.message?.map((ic) => ({
                id: ic.id,
                description: ic.name
            }));
            setInvCategoryList(formattedInvCategory);
        };
        getInventoryCategory();
        

        const getDiscountList = async () => {
            const result = await fetchDiscountList();
            const formattedDiscounts = result?.message?.map((dl) => ({
                id: dl.id,
                description: dl.code
            }));
            setDiscountList(formattedDiscounts);
        };
        getDiscountList();
        

        const getEmpChargeDescriptionList = async () => {
            const result = await fetchEmpChargeDescriptionList();
            const formattedEmpChargeDescriptions = result?.message?.map((cd) => ({
                id: cd.id,
                description: cd.name
            }));
            setEmpChargeDescriptionList(formattedEmpChargeDescriptions);
        };
        getEmpChargeDescriptionList(); 
    },[])
 

     
//    console.log("CASHIER INPUT","PO INHOUSE ACCORION", "1", poData, productList, " count:", poData?.content?.length)
    return (
        <>
            <div>
                <label className="font-semibold px-2">Sales</label>
                <SalesAccordion 
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
                    productList={productList} 
                    customerList={customerList} 
                    paymentModeList={paymentModeList} 
                    disableAccordion={disableAccordion}
                    transactionUniqueID={transactionUniqueID}
                />
            </div>
            <div>
                <label className="font-semibold px-2">Net Department Sales</label>
                <DepartmentSales 
                    selectedMode={selectedMode}
                    lubricantSalesData={lubricantSalesData}
                    setLubricantSalesData={setLubricantSalesData}
                    fuelData={fuelData}
                    setFuelData={setFuelData}
                    discountData={discountData}
                    setDiscountData={setDiscountData}
                    receivableData={receivableData}
                    setReceivableData={setReceivableData}
                    checkData={checkData}
                    setCheckData={setCheckData}
                    inventoryData={inventoryData}
                    setInventoryData={setInventoryData}
                    employee={employee}
                    invCategoryList={invCategoryList} 
                    fuelLubes={fuelLubes}
                    discountList={discountList}
                    empChargeDescriptionList={empChargeDescriptionList}
                    disableAccordion={disableAccordion}
                />
            </div>
        </>
    )
}

export default CashierInput