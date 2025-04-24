const express = require("express");
const router = express.Router();
const pool = require("../Config/Connection");
const multer = require('multer');
const path = require("path");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join("Public", "Uploads"))
    },
    filename: (req, file, cb) => {
        // cb(null, Date.now() + path.extname(file.originalname)) for unique filename
        cb(null, file.originalname)
    }
})


const upload = multer({ storage: storage });

router.post("/dailySalesInputForecourt", upload.single("pos"), async (req, res) => {
    const client = await pool.connect();
        const uploadedFile = req.file
        const UniqueID = req.body?.UniqueID
        const uploadedData = { 
            filterData: JSON.parse(req.body?.filterData),
            cashData: JSON.parse(req.body?.cashData),
            poData: JSON.parse(req.body?.poData),
            redemptionData: JSON.parse(req.body?.redemptionData),
            cardData: JSON.parse(req.body?.cardData),
            lubricantSalesData: JSON.parse(req.body?.lubricantSalesData),
            fuelData: JSON.parse(req.body?.fuelData),
            discountData: JSON.parse(req.body?.discountData),
            receivableData: JSON.parse(req.body?.receivableData),
            checkData: JSON.parse(req.body?.checkData),
            salesGrandTotal: req.body?.salesGrandTotal,
            netDepartmentTotal: req.body?.netDepartmentTotal,
            variance: req.body?.variance,
            comment: req.body?.comment
        }
  
        try {

        await client.query("BEGIN");
        //saving main sales input header
        const savedMainId = await dailySalesInputForecourt_Save_header(client,req, res, UniqueID, uploadedData);
        // saving cash input header 
        const savedCashId = await dailySalesInputForecourt_Save_Cash_header(client,req, res, UniqueID, savedMainId, uploadedData)  
        // saving cash Lines & Rows       
        await dailySalesInputForecourt_Save_Cash_Line(client,req, res, UniqueID, savedCashId, uploadedData);

        //saving po input header
        const savedPoId = await dailySalesInputForecourt_Save_POInHouse_header(client,req, res, UniqueID, savedMainId, uploadedData)
        //saving po line items
        await dailySalesInputForecourt_Save_POInHouse_Line(client,req, res, UniqueID, savedPoId, uploadedData)

        //saving redemption input header
        const savedRedemptionId = await dailySalesInputForecourt_Save_Redemption_header(client,req, res, UniqueID, savedMainId, uploadedData)
        //saving redemption line items
        await dailySalesInputForecourt_Save_Redemption_Line(client,req, res, UniqueID, savedRedemptionId, uploadedData)

        //saving card input header
        const savedCardId = await dailySalesInputForecourt_Save_Card_header(client,req, res, UniqueID, savedMainId, uploadedData)
        //saving card line items
        await dailySalesInputForecourt_Save_Card_Line(client,req, res, UniqueID, savedCardId, uploadedData) 

        
        //saving lubricant input header 
        const savedLubricantId = await dailySalesInputForecourt_Save_FCLubricant_header(client,req, res, UniqueID, savedMainId, uploadedData)
        //saving lubricant line items
        await dailySalesInputForecourt_Save_FCLubricant_Line(client,req, res, UniqueID, savedLubricantId, uploadedData)

        //saving fuel input header
        const savedFuelId = await dailySalesInputForecourt_Save_FuelSales_header(client,req, res, UniqueID, savedMainId, uploadedData)
        console.log("savedFuelId", savedFuelId)
        //saving fuel line items
        await dailySalesInputForecourt_Save_FuelSales_Line(client,req, res, UniqueID, savedFuelId, uploadedData)

    
        //saving discount input header
        const savedDiscountId = await dailySalesInputForecourt_Save_Discount_header(client,req, res, UniqueID, savedMainId, uploadedData)
        // //saving discount line items
        await dailySalesInputForecourt_Save_Discount_Line(client,req, res, UniqueID, savedDiscountId, uploadedData)

        
        //saving receivable input header
        const savedReceivableId = await dailySalesInputForecourt_Save_Receivable_header(client,req, res, UniqueID, savedMainId, uploadedData)
        // //saving receivable line items
        await dailySalesInputForecourt_Save_Receivable_Line(client,req, res, UniqueID, savedReceivableId, uploadedData)

        //saving check input header
        const savedCheckId = await dailySalesInputForecourt_Save_Check_header(client,req, res, UniqueID, savedMainId, uploadedData)
        // //saving check line items
        await dailySalesInputForecourt_Save_Check_Line(client,req, res, UniqueID, savedCheckId, uploadedData)

        //saving variance data
        await dailySalesInputForecourt_Save_Variance(client,req, res, UniqueID, savedMainId, uploadedData)


        await client.query("COMMIT");

        console.log("success: " + savedMainId)
        res.status(201).json({ success: true, message: "successfully saved with an id of " + savedMainId });
    }
    catch (err) {
        console.log(err)
        await client.query("ROLLBACK");

        res.status(500).json({ source:"dailySalesInputForecourt",error: "Database query error", params : uploadedData 
         });
    }
    finally {
        client.release();
    }
});

const dailySalesInputForecourt_Save_header=async(client,req, res, UniqueID, uploadedData)=>{
    try{ 

        const qExistID = `
        select "ID" from dailysalesinput_hdr
        where TransId=$1
        `
        let rExistID = await pool.query(qExistID, [UniqueID]);         
        const ExistID = rExistID.rows[0]?.ID !== null ? rExistID.rows[0]?.ID : 0
        if ( ExistID > 0 )
        { 
            const cashHeaderResult = await client.query(
                `UPDATE dailysalesinput_hdr
                            SET
                                comment = $1
                 WHERE "ID"=$2 AND TransId=$3 `,
                [
                    uploadedData?.comment,
                    ExistID,
                    UniqueID
                ]
            );
            return ExistID
        }else{
            const mainHeaderResult = await client.query(
                `INSERT INTO dailysalesinput_hdr
                            (
                                input_mode,
                                station_id,
                                shift_id,
                                employee_id,
                                effectivity_date,
                                comment,
                                TransId
                            )
                VALUES      ($1, $2, $3, $4, $5, $6, $7)
                RETURNING   *`,
                [
                    uploadedData.filterData?.selectedMode,
                    uploadedData.filterData?.selectedStation,
                    uploadedData.filterData?.selectedShift,
                    uploadedData.filterData?.selectedShiftManager[0],
                    uploadedData.filterData?.effectivityDate,
                    uploadedData?.comment,
                    UniqueID
                ]
            );
            return mainHeaderResult.rows[0].ID
        }
    }catch (err) {
        console.log(err)
        await client.query("ROLLBACK");
        res.status(500).json({ source:"dailySalesInputForecourt_Save_header", error: "Database query error" });
    }
    return 0;
}

const dailySalesInputForecourt_Save_Cash_header=async(client,req, res, UniqueID, MainHeaderID, uploadedData)=>{
    try{ 
        // CHECK IF UNIQUEID EXISTS
        
        const qExistID = `
            select "ID" from dailysalesinput_cashhdr
            where TransId=$1
        `
        let rExistID = await pool.query(qExistID, [UniqueID]); 
        
        const ExistID = rExistID.rows[0]?.ID !== null ? rExistID.rows[0]?.ID : 0
        if ( ExistID > 0 )
        { 
            const cashHeaderResult = await client.query(
                `UPDATE dailysalesinput_cashhdr
                            SET
                                input_id = $1,
                                total = $2,
                                last_cash = $3,
                                float = $4
                 WHERE "ID"=$5 AND TransId=$6 `,
                [
                    MainHeaderID,
                    uploadedData.cashData?.total,
                    uploadedData.cashData?.lastCash,
                    uploadedData.cashData?.float,
                    ExistID,
                    UniqueID
                ]
            );
            return ExistID
        }else{
            const cashHeaderResult = await client.query(
                `INSERT INTO dailysalesinput_cashhdr
                            (
                                input_id,
                                total,
                                last_cash,
                                float,
                                TransId
                            )
                VALUES      ($1, $2, $3, $4, $5)
                RETURNING   *`,
                [
                    MainHeaderID,
                    uploadedData.cashData?.total,
                    uploadedData.cashData?.lastCash,
                    uploadedData.cashData?.float,
                    UniqueID
                ]
            );
            return cashHeaderResult.rows[0].ID
        }
    }catch (err) {
        console.log(err)
        await client.query("ROLLBACK");
        res.status(500).json({ source:"dailySalesInputForecourt_Save_Cash_header", error: "Database query error", param: uploadedData.cashData });
    }
    return 0;
}

const dailySalesInputForecourt_Save_Cash_Line=async(client,req, res, UniqueID, HeaderID, uploadedData)=>{
    try{ 
        // CHECK IF UNIQUEID EXISTS
        
        const qExistID = `
            select "ID" from dailysalesinput_cashlin
            where cash_hdr=$1
        `
        let rExistID = await pool.query(qExistID, [HeaderID]); 
        
        const ExistID = rExistID.rows[0]?.ID !== null ? rExistID.rows[0]?.ID : 0
        if ( ExistID > 0 )
        { 
            // DELETE LINE
            await pool.query(`DELETE from dailysalesinput_cashlin WHERE cash_hdr=$1`, [HeaderID]); 
            console.log("DELETE", "Save Cash Line", HeaderID)
            // DELETE ROWS
            await pool.query(`DELETE from dailysalesinput_cashlin_rows WHERE cashlin_id 
                            in (select "ID" from public.dailysalesinput_cashlin  where cash_hdr = $1)`, [HeaderID]); 
            console.log("DELETE", "Save Cash Rows", HeaderID)
        }
        const queryResults = await Promise.all(
            uploadedData.cashData?.content.map((item) => {
                return new Promise(async (resolve, reject) => {
                    //saving cash input rows
                    const cashLinResult = await client.query(
                        `INSERT INTO dailysalesinput_cashlin
                                    (
                                        cash_hdr,
                                        total,
                                        time,
                                        recieved_id
                                    )
                        VALUES      ($1, $2, CAST($3 AS TIME), $4)
                        RETURNING   *`,
                        [
                            HeaderID,
                            item?.total,
                            item?.time,
                            item?.recievedBy
                        ]
                    );
                    let savedCashLinId = cashLinResult.rows[0].ID
                    //saving bills input rows
                    const queryResults2 = await Promise.all(
                        item.bills?.map((item) => {
                            return new Promise(async (resolve, reject) => {
                                await client.query(
                                    `INSERT INTO dailysalesinput_cashlin_rows
                                                (
                                                    bill,
                                                    quantity,
                                                    total,
                                                    cashlin_id
                                                )
                                    VALUES      ($1, $2, $3, $4)`,
                                    [
                                        item?.bill,
                                        item?.quantity,
                                        item?.amount,
                                        savedCashLinId
                                    ]
                                );
                                //resolve 2nd promise
                                return resolve(true)
                            })
                        })
                    )
                    //resolve first promise
                    return resolve(true)
                })
            })
        )

    }catch (err) {
        console.log(err)
        await client.query("ROLLBACK");
        res.status(500).json({ source:"dailySalesInputForecourt_Save_Cash_Line", error: "Database query error", param: uploadedData.cashData });
    }
    return 0;
}

const dailySalesInputForecourt_Save_POInHouse_header=async(client,req, res, UniqueID, MainHeaderID, uploadedData)=>{
    try{ 

        const qExistID = `
        select "ID" from dailysalesinput_pohdr
        where TransId=$1
        `
        let rExistID = await pool.query(qExistID, [UniqueID]);         
        const ExistID = rExistID.rows[0]?.ID !== null ? rExistID.rows[0]?.ID : 0
        if ( ExistID > 0 )
        { 
            const cashHeaderResult = await client.query(
                `UPDATE dailysalesinput_pohdr
                            SET
                                total = $1,
                                input_id = $2
                 WHERE "ID"=$3 AND TransId=$4 `,
                [
                    uploadedData.poData?.total,
                    MainHeaderID,
                    ExistID,
                    UniqueID
                ]
            );
            return ExistID
        }else{
            const poHeaderResult = await client.query(
                `INSERT INTO dailysalesinput_pohdr
                                    (
                                        total,
                                        input_id,
                                        TransId
                                    )
                        VALUES      ($1, $2, $3)
                        RETURNING   *`,
                [
                    uploadedData.poData?.total,
                    MainHeaderID,
                    UniqueID
                ]
            );
            return poHeaderResult.rows[0].ID
        }
    }catch (err) {
        console.log(err)
        await client.query("ROLLBACK");
        res.status(500).json({ source:"dailySalesInputForecourt_Save_POInHouse_header", error: "Database query error", param: uploadedData.poData });
    }
    return 0;
}

const dailySalesInputForecourt_Save_POInHouse_Line=async(client,req, res, UniqueID, HeaderID, uploadedData)=>{
    try{ 
        // CHECK IF UNIQUEID EXISTS
        
        const qExistID = `
            select "ID" from dailysalesinput_polin
            where po_hdr=$1
        `
        let rExistID = await pool.query(qExistID, [HeaderID]); 
        
        const ExistID = rExistID.rows[0]?.ID !== null ? rExistID.rows[0]?.ID : 0
        if ( ExistID > 0 )
        { 
            // DELETE LINE
            await pool.query(`DELETE from dailysalesinput_polin WHERE po_hdr=$1`, [HeaderID]);
            console.log("DELETE", "Save PO Inhouse Line", HeaderID)
        }


        
        await Promise.all(
            uploadedData.poData?.content?.map((item) => {
                return new Promise(async (resolve, reject) => {
                    await client.query(
                        `INSERT INTO dailysalesinput_polin
                                    (
                                        po_hdr,
                                        invoice_no,
                                        customer_id,
                                        tax_code,
                                        product_id,
                                        quantity,
                                        amount,
                                        plateno,
                                        cuspono,
                                        discountedamount
                                    )
                        VALUES      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                        [
                            HeaderID,
                            item?.invoiceNo,
                            item?.customerName,
                            item?.taxCode,
                            item?.product,
                            item?.quantity,
                            item?.poAmount,
                            item?.plateNo,
                            item?.custPONumber,
                            item?.discountedPOAmount
                        ]
                    );
                    return resolve(true)
                })
            })
        ) 
    }catch (err) {
        console.log(err)
        await client.query("ROLLBACK");
        res.status(500).json({ source:"dailySalesInputForecourt_Save_POInHouse_Line", error: "Database query error", param: uploadedData.poData });
    }
    return 0;
}

const dailySalesInputForecourt_Save_Redemption_header=async(client,req, res, UniqueID, MainHeaderID, uploadedData)=>{
    try{ 

        const qExistID = `
        select "ID" from dailysalesinput_redemptionhdr
        where TransId=$1
        `
        let rExistID = await pool.query(qExistID, [UniqueID]);         
        const ExistID = rExistID.rows[0]?.ID !== null ? rExistID.rows[0]?.ID : 0
        if ( ExistID > 0 )
        { 
            const cashHeaderResult = await client.query(
                `UPDATE dailysalesinput_redemptionhdr
                            SET
                                total = $1,
                                input_id = $2
                 WHERE "ID"=$3 AND TransId=$4 `,
                [
                    uploadedData.redemptionData?.total,
                    MainHeaderID,
                    ExistID,
                    UniqueID
                ]
            );
            return ExistID
        }else{
            const redemptionHeaderResult = await client.query(
                `INSERT INTO dailysalesinput_redemptionhdr
                                            (
                                                total,
                                                input_id,
                                                TransId
                                            )
                                VALUES      ($1, $2, $3)
                                RETURNING   *`,
                [
                    uploadedData.redemptionData?.total,
                    MainHeaderID,
                    UniqueID
                ]
            );
            return redemptionHeaderResult.rows[0].ID
        }
    }catch (err) {
        console.log(err)
        await client.query("ROLLBACK");
        res.status(500).json({ source:"dailySalesInputForecourt_Save_Redemption_header", error: "Database query error", param: uploadedData.redemptionData });
    }
    return 0;
}

const dailySalesInputForecourt_Save_Redemption_Line=async(client,req, res, UniqueID, HeaderID, uploadedData)=>{
    try{ 
        // CHECK IF UNIQUEID EXISTS        
        const qExistID = `
            select "ID" from dailysalesinput_redemptionlin
            where redemption_hdr=$1
        `
        let rExistID = await pool.query(qExistID, [HeaderID]); 
        
        const ExistID = rExistID.rows[0]?.ID !== null ? rExistID.rows[0]?.ID : 0
        if ( ExistID > 0 )
        { 
            // DELETE LINE
            await pool.query(`DELETE from dailysalesinput_redemptionlin WHERE redemption_hdr=$1`, [HeaderID]);
            console.log("DELETE", "Save Redemption Line", HeaderID)
        }

        await Promise.all(
            uploadedData.redemptionData?.content?.map((item) => {
                return new Promise(async (resolve, reject) => {
                    await client.query(
                        `INSERT INTO dailysalesinput_redemptionlin
                                            (
                                                redemption_hdr,
                                                payment_mode_id,
                                                quantity,
                                                amount
                                            )
                                VALUES      ($1, $2, $3, $4)`,
                        [
                            HeaderID,
                            item?.payment,
                            item?.quantity,
                            item?.amount
                        ]
                    );
                    return resolve(true)
                })
            })
        )
        

    }catch (err) {
        console.log(err)
        await client.query("ROLLBACK");
        res.status(500).json({ source:"dailySalesInputForecourt_Save_Redemption_Line", error: "Database query error", param: uploadedData.redemptionData });
    }
    return 0;
}

const dailySalesInputForecourt_Save_Card_header = async (client, req, res, UniqueID, MainHeaderID, uploadedData) => {
    try{ 

        const qExistID = `
        select "ID" from dailysalesinput_cardhdr
        where TransId=$1
        `
        let rExistID = await pool.query(qExistID, [UniqueID]);         
        const ExistID = rExistID.rows[0]?.ID !== null ? rExistID.rows[0]?.ID : 0
        if ( ExistID > 0 )
        { 
            const cashHeaderResult = await client.query(
                `UPDATE dailysalesinput_cardhdr
                            SET
                                total = $1,
                                input_id = $2
                 WHERE "ID"=$3 AND TransId=$4 `,
                [
                    uploadedData.cardData?.total,
                    MainHeaderID,
                    ExistID,
                    UniqueID
                ]
            );
            return ExistID
        }else{
            
            const cardHeaderResult = await client.query(
                `INSERT INTO dailysalesinput_cardhdr
                                            (
                                                total,
                                                input_id,
                                                TransId
                                            )
                                VALUES      ($1, $2, $3)
                                RETURNING   *`,
                [
                    uploadedData.cardData?.total,
                    MainHeaderID,
                    UniqueID
                ]
            );
            return cardHeaderResult.rows[0].ID
        }
    }catch (err) {
        console.log(err)
        await client.query("ROLLBACK");
        res.status(500).json({ source:"dailySalesInputForecourt_Save_Card_header", error: "Database query error", param: uploadedData.cardData });
    }
    return 0;
}

const dailySalesInputForecourt_Save_Card_Line = async (client, req, res, UniqueID, HeaderID, uploadedData) => {
    try{ 
        // CHECK IF UNIQUEID EXISTS        
        const qExistID = `
            select "ID" from dailysalesinput_cardlin
            where card_id=$1
        `
        let rExistID = await pool.query(qExistID, [HeaderID]); 
        
        const ExistID = rExistID.rows[0]?.ID !== null ? rExistID.rows[0]?.ID : 0
        if ( ExistID > 0 )
        { 
            // DELETE LINE
            await pool.query(`DELETE from dailysalesinput_cardlin WHERE card_id=$1`, [HeaderID]);
            console.log("DELETE", "Save Card Settlement Line", HeaderID)
        }

        await Promise.all(
            uploadedData.cardData?.content?.map((item) => {
                return new Promise(async (resolve, reject) => {
                    await client.query(
                        `INSERT INTO dailysalesinput_cardlin
                                            (
                                                card_id,
                                                payment_mode_id,
                                                amount,
                                                details
                                            )
                                VALUES      ($1, $2, $3, $4)`,
                        [
                            HeaderID,
                            item?.payment,
                            item?.amount,
                            item?.details
                        ]
                    );
                    return resolve(true)
                })
            })
        )        

    }catch (err) {
        console.log(err)
        await client.query("ROLLBACK");
        res.status(500).json({ source:"dailySalesInputForecourt_Save_Card_line", error: "Database query error", param: uploadedData.cardData });
    }
    return 0;
}

const dailySalesInputForecourt_Save_FCLubricant_header = async (client, req, res, UniqueID, MainHeaderID, uploadedData) => {
    try{ 

        const qExistID = `
        select "ID" from dailysalesinput_lubricanthdr
        where TransId=$1
        `
        let rExistID = await pool.query(qExistID, [UniqueID]);         
        const ExistID = rExistID.rows[0]?.ID !== null ? rExistID.rows[0]?.ID : 0
        if ( ExistID > 0 )
        { 
            const cashHeaderResult = await client.query(
                `UPDATE dailysalesinput_lubricanthdr
                            SET
                                total = $1,
                                input_id = $2
                 WHERE "ID"=$3 AND TransId=$4 `,
                [
                    uploadedData.lubricantSalesData?.total,
                    MainHeaderID,
                    ExistID,
                    UniqueID
                ]
            );
            return ExistID
        }else{
            
            const lubricantHeaderResult = await client.query(
                `INSERT INTO dailysalesinput_lubricanthdr
                                                    (
                                                        total,
                                                        input_id,
                                                        TransId
                                                    )
                                        VALUES      ($1, $2, $3)
                                        RETURNING   *`,
                [
                    uploadedData.lubricantSalesData?.total,
                    MainHeaderID,
                    UniqueID
                ]
            );
            return lubricantHeaderResult.rows[0].ID
        }
    }catch (err) {
        console.log(err)
        await client.query("ROLLBACK");
        res.status(500).json({ source:"dailySalesInputForecourt_Save_FCLubricant_header", error: "Database query error", param: uploadedData.lubricantSalesData });
    }
    return 0;
}

const dailySalesInputForecourt_Save_FCLubricant_Line = async (client, req, res, UniqueID, HeaderID, uploadedData) => {
    try{ 
        // CHECK IF UNIQUEID EXISTS        
        const qExistID = `
            select "ID" from dailysalesinput_lubricantlin
            where lubricant_hdr=$1
        `
        let rExistID = await pool.query(qExistID, [HeaderID]); 
        
        const ExistID = rExistID.rows[0]?.ID !== null ? rExistID.rows[0]?.ID : 0
        if ( ExistID > 0 )
        { 
            // DELETE LINE
            await pool.query(`DELETE from dailysalesinput_lubricantlin WHERE lubricant_hdr=$1`, [HeaderID]);
            console.log("DELETE", "Save FC Lubricant Line", HeaderID)
        }

        await Promise.all(
            uploadedData.lubricantSalesData?.content?.map((item) => {
                return new Promise(async (resolve, reject) => {
                    await client.query(
                        `INSERT INTO dailysalesinput_lubricantlin
                                                    (
                                                        lubricant_hdr,
                                                        lubricant_id,
                                                        quantity,
                                                        amount,
                                                        discount,
                                                        sold_by_id
                                                    )
                                        VALUES      ($1, $2, $3, $4, $5, $6)`,
                        [
                            HeaderID,
                            item?.lubricant,
                            item?.quantity,
                            item?.amount,
                            item?.discount,
                            item?.soldBy
                        ]
                    );
                    return resolve(true)
                })
            })
        )    

    }catch (err) {
        console.log(err)
        await client.query("ROLLBACK");
        res.status(500).json({ source:"dailySalesInputForecourt_Save_FCLubricant_Line", error: "Database query error", param: uploadedData.lubricantSalesData });
    }
    return 0;
}

const dailySalesInputForecourt_Save_FuelSales_header = async (client, req, res, UniqueID, MainHeaderID, uploadedData) => {
    try{ 

        const qExistID = `
        select "id" from dailysalesinput_fuelhdr
        where transid=$1
        `
        let rExistID = await pool.query(qExistID, [UniqueID]);         
        const ExistID = rExistID.rows[0]?.id !== null ? rExistID.rows[0]?.id : 0
        if ( ExistID > 0 )
        { 
            const cashHeaderResult = await client.query(
                `UPDATE dailysalesinput_fuelhdr
                            SET
                                dailysalesinputid=$1,
                                fueldiscount=$2,
                                fueltaxexemption=$3
                 WHERE "id"=$4 AND transid=$5 `,
                [
                    MainHeaderID,
                    uploadedData.fuelData?.discount,
                    uploadedData.fuelData?.taxExemption, 
                    ExistID,
                    UniqueID
                ]
            );
            return ExistID
        }else{
            const fuelHeaderResult = await client.query(
                `INSERT INTO dailysalesinput_fuelhdr
                                                    (
                                                        dailysalesinputid,
                                                        fueldiscount,
                                                        fueltaxexemption,
                                                        transid
                                                    )
                                        VALUES      ($1, $2, $3, $4)
                                        RETURNING   *`,
                [
                    MainHeaderID,
                    uploadedData.fuelData?.discount,
                    uploadedData.fuelData?.taxExemption,
                    UniqueID
                ]
            );
            return fuelHeaderResult.rows[0].id
        }
    }catch (err) {
        console.log(err)
        await client.query("ROLLBACK");
        res.status(500).json({ source:"dailySalesInputForecourt_Save_FuelSales_header", error: "Database query error", param: uploadedData.fuelData });
    }
    return 0;
}

const dailySalesInputForecourt_Save_FuelSales_Line = async (client, req, res, UniqueID, HeaderID, uploadedData) => {
    try{ 
        // CHECK IF UNIQUEID EXISTS        
        const qExistID = `
            select "id" from dailysalesinput_fuellin
            where dailysalesinputfuelhdrid=$1
        `
        let rExistID = await pool.query(qExistID, [HeaderID]); 
        
        const ExistID = rExistID.rows[0]?.id !== null ? rExistID.rows[0]?.id : 0
        if ( ExistID > 0 )
        { 
            // DELETE LINE
            await pool.query(`DELETE from dailysalesinput_fuellin WHERE dailysalesinputfuelhdrid=$1`, [HeaderID]);
            console.log("DELETE", "Save FuelSales Line", HeaderID)
        }

        await Promise.all(
            uploadedData.fuelData?.content?.map((item) => {
                return new Promise(async (resolve, reject) => {

                    if ( item?.transCt==0 && item?.volume == 0 && item?.amount == 0 )
                    {
                        // skip this items
                    }else{
                        await client.query(
                            `INSERT INTO dailysalesinput_fuellin
                                                        (
                                                            dailysalesinputfuelhdrid,
                                                            fuelmasterid,
                                                            transct,
                                                            volume,
                                                            amount,
                                                            price
                                                        )
                                            VALUES      ($1, $2, $3, $4, $5, $6)`,
                            [
                                HeaderID,
                                item?.fuelId,
                                item?.transCt,
                                item?.volume,
                                item?.amount,
                                item?.price
                            ]
                        );
                    }    
                    return resolve(true)
                })
            })
        )

    }catch (err) {
        console.log(err)
        await client.query("ROLLBACK");
        res.status(500).json({ source:"dailySalesInputForecourt_Save_FuelSales_Line", error: "Database query error", param: uploadedData.fuelData });
    }
    return 0;
}

const dailySalesInputForecourt_Save_Discount_header = async (client, req, res, UniqueID, MainHeaderID, uploadedData) => {
    try{ 

        const qExistID = `
        select "ID" from dailysalesinput_discounthdr
        where TransId=$1
        `
        let rExistID = await pool.query(qExistID, [UniqueID]);         
        const ExistID = rExistID.rows[0]?.ID !== null ? rExistID.rows[0]?.ID : 0
        if ( ExistID > 0 )
        { 
            const cashHeaderResult = await client.query(
                `UPDATE dailysalesinput_discounthdr
                            SET
                                total=$1,
                                input_id=$2
                 WHERE "ID"=$3 AND TransId=$4 `,
                [
                    uploadedData.discountData?.total,
                    MainHeaderID, 
                    ExistID,
                    UniqueID
                ]
            );
            return ExistID
        }else{ 
            const discountHeaderResult = await client.query(
                `INSERT INTO dailysalesinput_discounthdr
                                                            (
                                                                total,
                                                                input_id,
                                                                TransId
                                                            )
                                                VALUES      ($1, $2, $3)
                                                RETURNING   *`,
                [
                    uploadedData.discountData?.total,
                    MainHeaderID,
                    UniqueID
                ]
            );
            return discountHeaderResult.rows[0].ID
        }
    }catch (err) {
        console.log(err)
        await client.query("ROLLBACK");
        res.status(500).json({ source:"dailySalesInputForecourt_Save_Discount_header", error: "Database query error", param: uploadedData.discountData });
    }
    return 0;
}

const dailySalesInputForecourt_Save_Discount_Line = async (client, req, res, UniqueID, HeaderID, uploadedData) => {
    try{ 
        // CHECK IF UNIQUEID EXISTS        
        const qExistID = `
            select "ID" from dailysalesinput_discountlin
            where discount_hdr=$1
        `
        let rExistID = await pool.query(qExistID, [HeaderID]); 
        
        const ExistID = rExistID.rows[0]?.ID !== null ? rExistID.rows[0]?.ID : 0
        if ( ExistID > 0 )
        { 
            // DELETE LINE
            await pool.query(`DELETE from dailysalesinput_discountlin WHERE discount_hdr=$1`, [HeaderID]);
            console.log("DELETE", "Save Discount Line", HeaderID)
        }
        await Promise.all(
            uploadedData.discountData?.content?.map((item) => {
                return new Promise(async (resolve, reject) => {
                    await client.query(
                        `INSERT INTO dailysalesinput_discountlin
                                                            (
                                                                discount_hdr,
                                                                discount_id,
                                                                quantity,
                                                                amount
                                                            )
                                                VALUES      ($1, $2, $3, $4)`,
                        [
                            HeaderID,
                            item?.discount,
                            item?.quantity,
                            item?.amount
                        ]
                    );
                    return resolve(true)
                })
            })
        )


    }catch (err) {
        console.log(err)
        await client.query("ROLLBACK");
        res.status(500).json({ source:"dailySalesInputForecourt_Save_Discount_Line", error: "Database query error", param: uploadedData.discountData });
    }
    return 0;
}

const dailySalesInputForecourt_Save_Receivable_header = async (client, req, res, UniqueID, MainHeaderID, uploadedData) => {
    try{ 

        const qExistID = `
        select "ID" from dailysalesinput_receivablehdr
        where TransId=$1
        `
        let rExistID = await pool.query(qExistID, [UniqueID]);         
        const ExistID = rExistID.rows[0]?.ID !== null ? rExistID.rows[0]?.ID : 0
        if ( ExistID > 0 )
        { 
            const cashHeaderResult = await client.query(
                `UPDATE dailysalesinput_receivablehdr
                            SET
                                total=$1,
                                input_id=$2
                 WHERE "ID"=$3 AND TransId=$4 `,
                [
                    uploadedData.receivableData?.total,
                    MainHeaderID, 
                    ExistID,
                    UniqueID
                ]
            );
            return ExistID
        }else{ 
            const receivableHeaderResult = await client.query(
                `INSERT INTO dailysalesinput_receivablehdr
                                (
                                    total,
                                    input_id,
                                    TransId
                                )
                    VALUES      ($1, $2, $3)
                    RETURNING   *`,
                [
                    uploadedData.receivableData?.total,
                    MainHeaderID,
                    UniqueID
                ]
            );
            return receivableHeaderResult.rows[0].ID
        }
    }catch (err) {
        console.log(err)
        await client.query("ROLLBACK");
        res.status(500).json({ source:"dailySalesInputForecourt_Save_Receivable_header", error: "Database query error", param: uploadedData.receivableData });
    }
    return 0;
}

const dailySalesInputForecourt_Save_Receivable_Line = async (client, req, res, UniqueID, HeaderID, uploadedData) => {
    try{ 
        // CHECK IF UNIQUEID EXISTS        
        const qExistID = `
            select "ID" from dailysalesinput_receivablelin
            where receivable_hdr=$1
        `
        let rExistID = await pool.query(qExistID, [HeaderID]); 
        
        const ExistID = rExistID.rows[0]?.ID !== null ? rExistID.rows[0]?.ID : 0
        if ( ExistID > 0 )
        { 
            // DELETE LINE
            await pool.query(`DELETE from dailysalesinput_receivablelin WHERE receivable_hdr=$1`, [HeaderID]);
            console.log("DELETE", "Save Receivable Line", HeaderID)
        }
        await Promise.all(
            uploadedData.receivableData?.content?.map((item) => {
                return new Promise(async (resolve, reject) => {
                    await client.query(
                        `INSERT INTO dailysalesinput_receivablelin
                                        (
                                            receivable_hdr,
                                            employee_id,
                                            amount,
                                            charge_id,
                                            details
                                        )
                            VALUES      ($1, $2, $3, $4, $5)`,
                        [
                            HeaderID,
                            item?.employee,
                            item?.amount,
                            item?.description,
                            item?.details
                        ]
                    );
                    return resolve(true)
                })
            })
        )

    }catch (err) {
        console.log(err)
        await client.query("ROLLBACK");
        res.status(500).json({ source:"dailySalesInputForecourt_Save_Receivable_Line", error: "Database query error", param: uploadedData.receivableData });
    }
    return 0;
}

const dailySalesInputForecourt_Save_Check_header = async (client, req, res, UniqueID, MainHeaderID, uploadedData) => {
    try{ 

        const qExistID = `
        select "ID" from dailysalesinput_checkhdr
        where TransId=$1
        `
        let rExistID = await pool.query(qExistID, [UniqueID]);         
        const ExistID = rExistID.rows[0]?.ID !== null ? rExistID.rows[0]?.ID : 0
        if ( ExistID > 0 )
        { 
            const cashHeaderResult = await client.query(
                `UPDATE dailysalesinput_checkhdr
                            SET
                                total=$1,
                                input_id=$2
                 WHERE "ID"=$3 AND TransId=$4 `,
                [
                    uploadedData.checkData?.total,
                    MainHeaderID, 
                    ExistID,
                    UniqueID
                ]
            );
            return ExistID
        }else{ 
            const checkHeaderResult = await client.query(
                `INSERT INTO dailysalesinput_checkhdr
                            (
                                total,
                                input_id,
                                TransId
                            )
                VALUES      ($1, $2, $3)
                RETURNING   *`,
                [
                    uploadedData.checkData?.total,
                    MainHeaderID,
                    UniqueID
                ]
            );
            return checkHeaderResult.rows[0].ID
        }
    }catch (err) {
        console.log(err)
        await client.query("ROLLBACK");
        res.status(500).json({ source:"dailySalesInputForecourt_Save_Check_header", error: "Database query error", param: uploadedData.checkData });
    }
    return 0;
}

const dailySalesInputForecourt_Save_Check_Line = async (client, req, res, UniqueID, HeaderID, uploadedData) => {
    try{ 
        // CHECK IF UNIQUEID EXISTS        
        const qExistID = `
            select "ID" from dailysalesinput_checklin
            where check_hdr=$1
        `
        let rExistID = await pool.query(qExistID, [HeaderID]); 
        
        const ExistID = rExistID.rows[0]?.ID !== null ? rExistID.rows[0]?.ID : 0
        if ( ExistID > 0 )
        { 
            // DELETE LINE
            await pool.query(`DELETE from dailysalesinput_checklin WHERE check_hdr=$1`, [HeaderID]);
            console.log("DELETE", "Save Check Line", HeaderID)
        }
        await Promise.all(
            uploadedData.checkData?.content?.map((item) => {
                return new Promise(async (resolve, reject) => {
                    await client.query(
                        `INSERT INTO dailysalesinput_checklin
                                                    (
                                                        check_hdr,
                                                        payment_form,
                                                        amount,
                                                        details,
                                                        bankno,
                                                        checkno
                                                    )
                                        VALUES      ($1, $2, $3, $4, $5, $6)`,
                        [
                            HeaderID,
                            item?.paymentForm,
                            item?.amount,
                            item?.details,
                            item?.bankno,
                            item?.checkno,
                        ]
                    );
                    return resolve(true)
                })
            })
        )
    }catch (err) {
        console.log(err)
        await client.query("ROLLBACK");
        res.status(500).json({ source:"dailySalesInputForecourt_Save_Check_Line", error: "Database query error", param: uploadedData.checkData });
    }
    return 0;
}

const dailySalesInputForecourt_Save_Variance = async (client, req, res, UniqueID, MainHeaderID, uploadedData) => {
    try{ 

        const qExistID = `
        select "ID" from dailysalesinput_variance
        where TransId=$1
        `
        let rExistID = await pool.query(qExistID, [UniqueID]);         
        const ExistID = rExistID.rows[0]?.ID !== null ? rExistID.rows[0]?.ID : 0
        if ( ExistID > 0 )
        { 
            const cashHeaderResult = await client.query(
                `UPDATE dailysalesinput_variance
                    SET
                        input_id=$1,
                        grand_total=$2,
                        department_total=$3,
                        variance=$4
                 WHERE "ID"=$5 AND TransId=$6 `,
                [
                    MainHeaderID, 
                    uploadedData.salesGrandTotal,
                    uploadedData.netDepartmentTotal,
                    uploadedData.variance,
                    ExistID,
                    UniqueID
                ]
            );
            return ExistID
        }else{ 
            await client.query(
                `INSERT INTO dailysalesinput_variance
                    (
                        input_id,
                        grand_total,
                        department_total,
                        variance,
                        TransId
                    )
                VALUES      ($1, $2, $3, $4, $5)
                RETURNING   *`,
                [
                    MainHeaderID,
                    uploadedData.salesGrandTotal,
                    uploadedData.netDepartmentTotal,
                    uploadedData.variance,
                    UniqueID
                ]
            ); 
            return 0;
        }
    }catch (err) {
        console.log(err)
        await client.query("ROLLBACK");
        res.status(500).json({ source:"dailySalesInputForecourt_Save_Variance", error: "Database query error", param: uploadedData });
    }
    return 0;
}





 






router.get("/getDailySalesForecourtData", async (req, res) => {
    try {
        const { effectivityDate, selectedStation, inputId } = req.query;
        let returnData
        let query = `
            SELECT      
                        a.input_mode,
                        a.station_id,
                        a.shift_id,
                        a.employee_id,
                        a.effectivity_date,
                        a.comment,
                        b.grand_total,
                        b.department_total,
                        b.variance
            FROM        public.dailysalesinput_hdr AS a
            LEFT JOIN   public.dailysalesinput_variance AS b
                ON      a."ID" = b."input_id"
            WHERE       a."uploaded_at" =  $1
                AND     a."ID" = $2
        `
        if (selectedStation != '') {
            query += `
                AND     a."station_id" = $3
            `
        }
        let bindData = [effectivityDate, inputId]
        if (selectedStation != '') bindData.push(selectedStation)
        const result = await pool.query(query, bindData);

        //get cash data
        query = `
            SELECT      b.*
            FROM        public.dailysalesinput_hdr AS a
            LEFT JOIN   public.dailysalesinput_cashhdr AS b
                ON      a."ID" = b."input_id"
            WHERE       a."ID" = $1
        `
        let cashHeaderResult = await pool.query(query, [inputId]);
        query = `
            SELECT      b.*
            FROM        public.dailysalesinput_cashhdr AS a
            LEFT JOIN   public.dailysalesinput_cashlin AS b
                ON      a."ID" = b."cash_hdr"
            WHERE       a."input_id" = $1
        `
        let cashResult = await pool.query(query, [inputId]);
        cashResult = await Promise.all(
            cashResult.rows?.map((item) => {
                return new Promise(async (resolve, reject) => {
                    var input = item?.time;
                    var parts = input.split(':');
                    var minutes = parts[0] * 60 + parts[1];
                    var inputDate = new Date(minutes * 60 * 1000);
                    const billsQuery = await pool.query(
                        `   
                            SELECT      b.*
                            FROM        public.dailysalesinput_cashlin AS a
                            LEFT JOIN   public.dailysalesinput_cashlin_rows AS b
                                ON      a."ID" = b."cashlin_id"
                            WHERE       a."ID" = ${item?.ID}
                        `
                    );
                    let res = {
                        recievedBy: item?.recieved_id,
                        total: item?.total,
                        time: inputDate,
                        bills: billsQuery.rows
                    }
                    return resolve(res)
                })
            })
        )

        //get po data
        query = `
            SELECT      b.*
            FROM        public.dailysalesinput_hdr AS a
            LEFT JOIN   public.dailysalesinput_pohdr AS b
                ON      a."ID" = b."input_id"
            WHERE       a."ID" = $1
        `
        let poHeaderResult = await pool.query(query, [inputId]);
        query = `
            SELECT      b.*
            FROM        public.dailysalesinput_pohdr AS a
            LEFT JOIN   public.dailysalesinput_polin AS b
                ON      a."ID" = b."po_hdr"
            WHERE       a."input_id" = $1
        `
        let poResult = await pool.query(query, [inputId]);

        //get redemption data
        query = `
                SELECT      b.*
                FROM        public.dailysalesinput_hdr AS a
                LEFT JOIN   public.dailysalesinput_redemptionhdr AS b
                    ON      a."ID" = b."input_id"
                WHERE       a."ID" = $1
            `
        let redemptionHeaderResult = await pool.query(query, [inputId]);
        query = `
                SELECT      b.*
                FROM        public.dailysalesinput_redemptionhdr AS a
                LEFT JOIN   public.dailysalesinput_redemptionlin AS b
                    ON      a."ID" = b."redemption_hdr"
                WHERE       a."input_id" = $1
            `
        let redemptionResult = await pool.query(query, [inputId]);

        //get card data
        query = `
                SELECT      b.*
                FROM        public.dailysalesinput_hdr AS a
                LEFT JOIN   public.dailysalesinput_cardhdr AS b
                    ON      a."ID" = b."input_id"
                WHERE       a."ID" = $1
            `
        let cardHeaderResult = await pool.query(query, [inputId]);
        query = `
                SELECT      b.*
                FROM        public.dailysalesinput_cardhdr AS a
                LEFT JOIN   public.dailysalesinput_cardlin AS b
                    ON      a."ID" = b."card_id"
                WHERE       a."input_id" = $1
            `
        let cardResult = await pool.query(query, [inputId]);

        //get lubricant data
        query = `
                SELECT      b.*
                FROM        public.dailysalesinput_hdr AS a
                LEFT JOIN   public.dailysalesinput_lubricanthdr AS b
                    ON      a."ID" = b."input_id"
                WHERE       a."ID" = $1
            `
        let lubricantHeaderResult = await pool.query(query, [inputId]);
        query = `
                SELECT      b.*
                FROM        public.dailysalesinput_lubricanthdr AS a
                LEFT JOIN   public.dailysalesinput_lubricantlin AS b
                    ON      a."ID" = b."lubricant_hdr"
                WHERE       a."input_id" = $1
            `
        let lubricantResult = await pool.query(query, [inputId]);

        //get fuel data
        query = `
                SELECT      b.*
                FROM        public.dailysalesinput_hdr AS a
                LEFT JOIN   public.dailysalesinput_fuelhdr AS b
                    ON      a."ID" = b."dailysalesinputid"
                WHERE       a."ID" = $1
            `

        let fuelHeaderResult = await pool.query(query, [inputId]);
        query = `
                SELECT      b.*
                FROM        public.dailysalesinput_fuelhdr AS a
                LEFT JOIN   public.dailysalesinput_fuellin AS b
                    ON      a."id" = b."dailysalesinputfuelhdrid"
                WHERE       a."dailysalesinputid" = $1
            `
        let fuelResult = await pool.query(query, [inputId]);

        //get discount data
        query = `
                SELECT      b.*
                FROM        public.dailysalesinput_hdr AS a
                LEFT JOIN   public.dailysalesinput_discounthdr AS b
                    ON      a."ID" = b."input_id"
                WHERE       a."ID" = $1
            `
        let discountHeaderResult = await pool.query(query, [inputId]);
        query = `
                SELECT      b.*
                FROM        public.dailysalesinput_discounthdr AS a
                LEFT JOIN   public.dailysalesinput_discountlin AS b
                    ON      a."ID" = b."discount_hdr"
                WHERE       a."input_id" = $1
            `
        let discountResult = await pool.query(query, [inputId]);

        //get receivable data
        query = `
                SELECT      b.*
                FROM        public.dailysalesinput_hdr AS a
                LEFT JOIN   public.dailysalesinput_receivablehdr AS b
                    ON      a."ID" = b."input_id"
                WHERE       a."ID" = $1
            `
        let receivableHeaderResult = await pool.query(query, [inputId]);
        query = `
                SELECT      b.*
                FROM        public.dailysalesinput_receivablehdr AS a
                LEFT JOIN   public.dailysalesinput_receivablelin AS b
                    ON      a."ID" = b."receivable_hdr"
                WHERE       a."input_id" = $1
            `
        let receivableResult = await pool.query(query, [inputId]);

        //get check data
        query = `
                SELECT      b.*
                FROM        public.dailysalesinput_hdr AS a
                LEFT JOIN   public.dailysalesinput_checkhdr AS b
                    ON      a."ID" = b."input_id"
                WHERE       a."ID" = $1
            `
        let checkHeaderResult = await pool.query(query, [inputId]);
        query = `
                SELECT      b.*
                FROM        public.dailysalesinput_checkhdr AS a
                LEFT JOIN   public.dailysalesinput_checklin AS b
                    ON      a."ID" = b."check_hdr"
                WHERE       a."input_id" = $1
            `
        let checkResult = await pool.query(query, [inputId]);
        console.log(redemptionResult.rows)
        returnData = {
            header: result.rows[0],
            cashData: {
                content: cashResult,
                lastCash: cashHeaderResult.rows[0]?.last_cash,
                float: cashHeaderResult.rows[0]?.float,
                total: cashHeaderResult.rows[0]?.total
            },
            poData: {
                content: poResult.rows.map((item)=> {
                    return {
                        id: item?.ID,
                        invoiceNo: item?.invoice_no,
                        customerName: item?.customer_id,
                        product: item?.product_id,
                        quantity: item?.quantity,
                        poAmount: item?.amount
                    }
                }),
                total: poHeaderResult.rows[0]?.total !== null ? poHeaderResult.rows[0]?.total : 0
            },
            redemptionData: {
                content: redemptionResult.rows.map((item)=> {
                    return {
                        id: item?.ID,
                        payment: item?.payment_mode_id,
                        quantity: item?.quantity,
                        amount: item?.amount
                    }
                }),
                total: redemptionHeaderResult.rows[0]?.total !== null ? redemptionHeaderResult.rows[0]?.total : 0
            },
            cardData: {
                content: cardResult.rows,
                total: cardHeaderResult.rows[0]?.total !== null ? cardHeaderResult.rows[0]?.total : 0
            },
            lubricantData: {
                content: lubricantResult.rows,
                total: lubricantHeaderResult.rows[0]?.total !== null ? lubricantHeaderResult.rows[0]?.total : 0
            },
            fuelData: {
                content: fuelResult.rows,
                discount: fuelHeaderResult.rows[0]?.fueldiscount !== null ? fuelHeaderResult.rows[0]?.fueldiscount : 0,
                taxExemption: fuelHeaderResult.rows[0]?.fueltaxexemption !== null ? fuelHeaderResult.rows[0]?.fueltaxexemption : 0,
                //total: fuelHeaderResult.rows[0]?.total !== null ? fuelHeaderResult.rows[0]?.total : 0
            },
            discountData: {
                content: discountResult.rows,
                total: discountHeaderResult.rows[0]?.total !== null ? discountHeaderResult.rows[0]?.total : 0
            },
            receivableData: {
                content: receivableResult.rows,
                total: receivableHeaderResult.rows[0]?.total !== null ? receivableHeaderResult.rows[0]?.total : 0
            },
            checkData: {
                content: checkResult.rows,
                total: checkHeaderResult.rows[0]?.total !== null ? checkHeaderResult.rows[0]?.total : 0
            },
        }

        res.status(201).json({ success: true, message: returnData });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database query error" });
    }
});

module.exports = router;