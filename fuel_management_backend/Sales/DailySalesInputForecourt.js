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
        const uploadedData = {
            cashData: JSON.parse(req.body?.cashData),
            poData: JSON.parse(req.body?.poData),
            redemptionData: JSON.parse(req.body?.redemptionData),
            cardData: JSON.parse(req.body?.cardData),
            lubricantSalesData: JSON.parse(req.body?.lubricantSalesData),
            fuelData: JSON.parse(req.body?.fuelData),
            discountData: JSON.parse(req.body?.discountData),
            recievableData: JSON.parse(req.body?.recievableData),
            checkData: JSON.parse(req.body?.checkData),
            filterData: JSON.parse(req.body?.filterData),
            salesGrandTotal: req.body?.salesGrandTotal,
            netDepartmentTotal: req.body?.netDepartmentTotal,
            variance: req.body?.variance,
            comment: req.body?.comment
        }
 

        try {

        await client.query("BEGIN");
        //saving main sales input header
        const mainHeaderResult = await client.query(
            `INSERT INTO dailysalesinput_hdr
                        (
                            input_mode,
                            station_id,
                            shift_id,
                            employee_id,
                            effectivity_date,
                            comment
                        )
            VALUES      ($1, $2, $3, $4, $5, $6)
            RETURNING   *`,
            [
                uploadedData.filterData?.selectedMode,
                uploadedData.filterData?.selectedStation,
                uploadedData.filterData?.selectedShift,
                uploadedData.filterData?.selectedShiftManager[0],
                uploadedData.filterData?.effectivityDate,
                uploadedData?.comment
            ]
        );
        let savedMainId = mainHeaderResult.rows[0].ID

        
        // saving cash input header
        const cashHeaderResult = await client.query(
            `INSERT INTO dailysalesinput_cashhdr
                        (
                            input_id,
                            total,
                            last_cash,
                            float
                        )
            VALUES      ($1, $2, $3, $4)
            RETURNING   *`,
            [
                savedMainId,
                uploadedData.cashData?.total,
                uploadedData.cashData?.lastCash,
                uploadedData.cashData?.float
            ]
        );
        let savedCashId = cashHeaderResult.rows[0].ID

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
                            savedCashId,
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

        //saving po input header
        const poHeaderResult = await client.query(
            `INSERT INTO dailysalesinput_pohdr
                                (
                                    total,
                                    input_id
                                )
                    VALUES      ($1, $2)
                    RETURNING   *`,
            [
                uploadedData.poData?.total,
                savedMainId
            ]
        );
        let savedPoId = poHeaderResult.rows[0].ID
        //saving po line items
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
                                        amount
                                    )
                        VALUES      ($1, $2, $3, $4, $5, $6, $7)`,
                        [
                            savedPoId,
                            item?.invoiceNo,
                            item?.customerName,
                            item?.taxCode,
                            item?.product,
                            item?.quantity,
                            item?.poAmount
                        ]
                    );
                    return resolve(true)
                })
            })
        )

        //saving redemption input header
        const redemptionHeaderResult = await client.query(
            `INSERT INTO dailysalesinput_redemptionhdr
                                        (
                                            total,
                                            input_id
                                        )
                            VALUES      ($1, $2)
                            RETURNING   *`,
            [
                uploadedData.redemptionData?.total,
                savedMainId
            ]
        );
        let savedRedemptionId = redemptionHeaderResult.rows[0].ID
        //saving redemption line items
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
                            savedRedemptionId,
                            item?.payment,
                            item?.quantity,
                            item?.amount
                        ]
                    );
                    return resolve(true)
                })
            })
        )

        //saving card input header
        const cardHeaderResult = await client.query(
            `INSERT INTO dailysalesinput_cardhdr
                                        (
                                            total,
                                            input_id
                                        )
                            VALUES      ($1, $2)
                            RETURNING   *`,
            [
                uploadedData.cardData?.total,
                savedMainId
            ]
        );
        let savedCardId = cardHeaderResult.rows[0].ID
        //saving card line items
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
                            savedCardId,
                            item?.payment,
                            item?.amount,
                            item?.details
                        ]
                    );
                    return resolve(true)
                })
            })
        )

        //saving lubricant input header
        const lubricantHeaderResult = await client.query(
            `INSERT INTO dailysalesinput_lubricanthdr
                                                (
                                                    total,
                                                    input_id
                                                )
                                    VALUES      ($1, $2)
                                    RETURNING   *`,
            [
                uploadedData.lubricantSalesData?.total,
                savedMainId
            ]
        );
        let savedLubricantId = lubricantHeaderResult.rows[0].ID
        //saving lubricant line items
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
                            savedLubricantId,
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

        //saving fuel input header
        const fuelHeaderResult = await client.query(
            `INSERT INTO dailysalesinput_fuelhdr
                                                (
                                                    dailysalesinputid,
                                                    fueldiscount,
                                                    fueltaxexemption
                                                )
                                    VALUES      ($1, $2, $3)
                                    RETURNING   *`,
            [
                savedMainId,
                uploadedData.fuelData?.discount,
                uploadedData.fuelData?.taxExemption
            ]
        );
        let savedFuelId = fuelHeaderResult.rows[0].id

        //saving fuel line items
        await Promise.all(
            uploadedData.fuelData?.content?.map((item) => {
                return new Promise(async (resolve, reject) => {
                    await client.query(
                        `INSERT INTO dailysalesinput_fuellin
                                                    (
                                                        dailysalesinputfuelhdrid,
                                                        fuelmasterid,
                                                        transct,
                                                        volume,
                                                        amount
                                                    )
                                        VALUES      ($1, $2, $3, $4, $5)`,
                        [
                            savedFuelId,
                            item?.fuelId,
                            item?.transCt,
                            item?.volume,
                            item?.amount
                        ]
                    );
                    return resolve(true)
                })
            })
        )

        //saving discount input header
        const discountHeaderResult = await client.query(
            `INSERT INTO dailysalesinput_discounthdr
                                                        (
                                                            total,
                                                            input_id
                                                        )
                                            VALUES      ($1, $2)
                                            RETURNING   *`,
            [
                uploadedData.discountData?.total,
                savedMainId
            ]
        );
        let savedDiscountId = discountHeaderResult.rows[0].ID
        //saving discount line items
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
                            savedDiscountId,
                            item?.discount,
                            item?.quantity,
                            item?.amount
                        ]
                    );
                    return resolve(true)
                })
            })
        )

        //saving receivable input header
        const receivableHeaderResult = await client.query(
            `INSERT INTO dailysalesinput_receivablehdr
                            (
                                total,
                                input_id
                            )
                VALUES      ($1, $2)
                RETURNING   *`,
            [
                uploadedData.recievableData?.total,
                savedMainId
            ]
        );
        let savedReceivableId = receivableHeaderResult.rows[0].ID
        //saving receivable line items
        await Promise.all(
            uploadedData.recievableData?.content?.map((item) => {
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
                            savedReceivableId,
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

        //saving check input header
        const checkHeaderResult = await client.query(
            `INSERT INTO dailysalesinput_checkhdr
                        (
                            total,
                            input_id
                        )
            VALUES      ($1, $2)
            RETURNING   *`,
            [
                uploadedData.checkData?.total,
                savedMainId
            ]
        );
        let savedCheckId = checkHeaderResult.rows[0].ID
        //saving card line items
        await Promise.all(
            uploadedData.checkData?.content?.map((item) => {
                return new Promise(async (resolve, reject) => {
                    await client.query(
                        `INSERT INTO dailysalesinput_checklin
                                                    (
                                                        check_hdr,
                                                        payment_form,
                                                        amount,
                                                        details
                                                    )
                                        VALUES      ($1, $2, $3, $4)`,
                        [
                            savedCheckId,
                            item?.paymentForm,
                            item?.amount,
                            item?.details
                        ]
                    );
                    return resolve(true)
                })
            })
        )

        //saving variance data
        await client.query(
            `INSERT INTO dailysalesinput_variance
                (
                    input_id,
                    grand_total,
                    department_total,
                    variance
                )
            VALUES      ($1, $2, $3, $4)
            RETURNING   *`,
            [
                savedMainId,
                uploadedData.salesGrandTotal,
                uploadedData.netDepartmentTotal,
                uploadedData.variance
            ]
        );
 

        await client.query("COMMIT");

        console.log("success: " + savedMainId)
        res.status(201).json({ success: true, message: "successfully saved with an id of " + savedMainId });
    }
    catch (err) {
        console.log(err)
        await client.query("ROLLBACK");

        res.status(500).json({ error: "Database query error"
            , params :
            [
                uploadedData
            ]
         });
    }
    finally {
        client.release();
    }
});

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