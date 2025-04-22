const express = require("express");
const router = express.Router();
const pool = require("../Config/Connection");
const fs = require('node:fs');
const { XMLParser } = require("fast-xml-parser");
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

router.post("/posUpload", upload.single("pos"), async (req, res) => {
    const client = await pool.connect();
    const uploadedFile = req.file

    fs.readFile(uploadedFile?.path, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        const parser = new XMLParser();
        let parsedXml = parser.parse(data);

        for (let item of parsedXml.ArrayOfTransaction.Transaction) {
            console.log(item)
            lin = [...lin, item.TransactionItem]
        }
        // console.log(lin)
    });
    res.status(201).json({ message: "Success" })
});

router.get("/getDailySalesInput", async (req, res) => {

    const { effectivityDate, selectedStation } = req.query;

    try {
        
             

            let query = `
            SELECT      "ID",
                        station_id,
                        shift_id,
                        employee_id,
                        input_mode,
                        TO_DATE(effectivity_date::text, 'YYYY-MM-DD') effectivity_date
            FROM        public.dailysalesinput_hdr AS a
            WHERE       a."effectivity_date"::date <=  ($1::date)
        `
        if (selectedStation != '') {
            query += `
                AND     a."station_id" = ANY ($2::int[])
            `
        }
        
        let bindData = [effectivityDate]
        if (selectedStation != '') bindData.push(selectedStation)

        const result = await pool.query(query, bindData);
        res.status(201).json({ success: true, message: result.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database query error ", param1:effectivityDate, param2:selectedStation });
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
                        ...item,
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

        returnData = {
            header: result.rows[0],
            cashData: {
                content: cashResult,
                lastCash: cashHeaderResult.rows[0]?.last_cash,
                float: cashHeaderResult.rows[0]?.float,
                total: cashHeaderResult.rows[0]?.total
            },
            poData: {
                content: poResult.rows,
                total: poHeaderResult.rows[0]?.total !== null ? poHeaderResult.rows[0]?.total : 0
            },
            redemptionData: {
                content: redemptionResult.rows,
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

router.get("/getCashierFuelData", async (req, res) => {
    try {
        const { effectivityDate, selectedStation, selectedShift } = req.query;

        let query = `
            SELECT 		b.*,  
                        c.code, 
                        c.color
            FROM 		public.dailysalesinput_fuelhdr AS a
            LEFt JOIN	public.dailysalesinput_fuellin AS b
            ON			b.dailysalesinputfuelhdrid = a.id
            LEFT JOIN	public.fuelmaster AS c
            ON			b.fuelmasterid = c.id
            WHERE		b.dailysalesinputfuelhdrid IN (
                            SELECT 		b.id
                            FROM 		public.dailysalesinput_hdr AS a
                            LEFt JOIN	public.dailysalesinput_fuelhdr AS b
                            ON			b.dailysalesinputid = a."ID"
                            WHERE		a.effectivity_date='${effectivityDate}'
                            AND			a.station_id=${selectedStation}
                            AND			a.shift_id=${selectedShift}
                            AND			a.input_mode IN (1,2)
			            )
        `
        let result = await pool.query(query);
        let data = result.rows
        let fuelRef = new Map()

        for (let i = 0; i < data.length; i++) {
            if (fuelRef.has(data[i].fuelmasterid)) {
                fuelRef.set(data[i].fuelmasterid, {
                    fuelId: Number(data[i].fuelmasterid),
                    fuelName: data[i].code,
                    color: data[i].color,
                    transCSt: Number(fuelRef.get(data[i].fuelmasterid).transct) + Number(data[i].transct),
                    volume: Number(fuelRef.get(data[i].fuelmasterid).volume) + Number(data[i].volume),
                    amount: Number(fuelRef.get(data[i].fuelmasterid).amount) + Number(data[i].amount)
                })
            } else {
                fuelRef.set(data[i].fuelmasterid, {
                    fuelId: Number(data[i].fuelmasterid),
                    fuelName: data[i].code,
                    color: data[i].color,
                    transCt: Number(data[i].transct),
                    volume: Number(data[i].volume),
                    amount: Number(data[i].amount)
                })
            }
        }
        if (fuelRef.size > 0) {
            query = `
                SELECT 		b.fueldiscount, b.fueltaxexemption
                FROM 		public.dailysalesinput_hdr AS a
                LEFt JOIN	public.dailysalesinput_fuelhdr AS b
                ON			b.dailysalesinputid = a."ID"
                WHERE		a.effectivity_date='${effectivityDate}'
                AND			a.station_id=${selectedStation}
                AND			a.shift_id=${selectedShift}
                AND			a.input_mode IN (1,2)           
            `
            result = await pool.query(query);
        }
        const returnData = {
            content: [...fuelRef.values()],
            discount: fuelRef.size > 0 ? Number(result.rows[0].fueldiscount) : 0,
            taxExemption: fuelRef.size > 0 ? Number(result.rows[0].fueltaxexemption) : 0,
            total: 0
        }
        res.status(201).json({ success: true, message: returnData });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database query error" });
    }
});

module.exports = router;