
import { useState, useEffect } from "react";
import DepartmentSales from "../Accordions/DepartmentSales"
import SalesAccordion from "../Accordions/SalesAccordion"

import { fetchCustomers } from "~/Hooks/Setup/GlobalRecords/Customer/useCustomers";
import { fetchProductList, fetchPaymentModeList, fetchInventoryCategoryList } from "~/Hooks/Sales/useGetParams";

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
    recievableData,
    setRecievableData,
    checkData,
    setCheckData,
    inventoryData,
    setInventoryData
}) => {

    
    const [productList, setProductList] = useState([])
    const [customerList, setCustomerList] = useState([])
    const [paymentModeList, setPaymentModeList] = useState([])
    const [invCategoryList, setInvCategoryList] = useState([])

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
        
        
    },[])

    
    useEffect(()=>{
        if(poData?.content?.length>0)
        { 
            const formattedLubes = productList
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
        }
    },[poData])


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
                    recievableData={recievableData}
                    setRecievableData={setRecievableData}
                    checkData={checkData}
                    setCheckData={setCheckData}
                    inventoryData={inventoryData}
                    setInventoryData={setInventoryData}
                    employee={employee}
                    invCategoryList={invCategoryList} 
                    fuelLubes={fuelLubes}
                />
            </div>
        </>
    )
}

export default CashierInput