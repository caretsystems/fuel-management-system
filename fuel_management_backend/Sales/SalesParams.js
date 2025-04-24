const express = require("express");
const router = express.Router();
const pool = require("../Config/Connection");

router.get("/ProductList", async (req, res) => {
    try {
         
        let query = `
           select transid, id, code,  name, category from (
	            select concat(id) transid, id, name as code, name, 'fuel' category from fuelmaster f 
	            where status = true
	            UNION ALL
	            select  concat(id) transid, id, name as code, name, 'lube' category from fuellubricant l
	            where status = true
            ) as product
        ` 
         
        const result = await pool.query(query);
        res.status(201).json({ success: true, message: result.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database query error " });
    }
});

router.get("/PaymentModeList", async (req, res) => {
    try {
         
        let query = `           
            select id, code, name 
            from paymentmode
            where status=true     
        ` 
         
        const result = await pool.query(query);
        res.status(201).json({ success: true, message: result.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database query error " });
    }
});

router.get("/InventoryCategoryList", async (req, res) => {
    try {
         
        let query = `           
            select dd.id, dd.name from dropdown dd
            join dropdowntype dt
            on dt.id = dd.dropdowntypeid
            where dt."name" ='Inventory Category'
            and dd.status = true        
        `          
        const result = await pool.query(query);
        res.status(201).json({ success: true, message: result.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database query error " });
    }
});




router.get("/DiscountList", async (req, res) => {
    try {
         
        let query = `           
            select 
                id
                , code 
                , name
            from public.discounthdr
            where status = true      
        `          
        const result = await pool.query(query);
        res.status(201).json({ success: true, message: result.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database query error " });
    }
});



router.get("/EmpChargeDescriptionList", async (req, res) => {
    try {
         
        let query = `           
            select dd.id, dd.name from dropdown dd
            join dropdowntype dt
            on dt.id = dd.dropdowntypeid
            where dt."name" ='Employee Charge Description'
            and dd.status = true      
        `          
        const result = await pool.query(query);
        res.status(201).json({ success: true, message: result.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database query error " });
    }
});



router.get("/getcustomerplateno/:customerId", async (req, res) => {
    try {
        
        const { customerId } = req.params;

        let query = `           
            select id, plateno
            from public.customervehicle
            where customerid = $1
        `          
        const result = await pool.query(query,[customerId]);
        res.status(201).json({ success: true, message: result.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database query error " });
    }
});

router.get("/getpoamountbasedonproduct/:productid/:category", async (req, res) => {
    try {
        
        const { productid, category  } = req.params;

        let query = `
                select transid, id, code,  name, price, category from (
                    select concat(id) transid, id, name as code, name, coalesce(p.Price,0) "price" , 'fuel' category from fuelmaster f 
                    left join(
                        select fuelmasterid, sum(transct) as Price from (
                        select 
                        row_number() over(partition by a.effectivity_date
                                                    ,a.station_id
                                                    ,a.shift_id 
                                                    order by a.effectivity_date desc ) RN, 
                        flin.fuelmasterid,
                        flin.transct
                        from public.dailysalesinput_hdr a
                        inner join public.dailysalesinput_fuelhdr fhdr
                        on fhdr.dailysalesinputid = a."ID"
                        inner join public.dailysalesinput_fuellin flin 
                        on fhdr.id = flin.dailysalesinputfuelhdrid
                        where a.input_mode IN (1,2)	
                        )  trans  where trans.RN=1
                        group by trans.fuelmasterid
                    ) p on p.fuelmasterid = f.id                    
                    where status = true

                    UNION ALL
                    
                    select  concat(id) transid, id, name as code, name, coalesce(selling,0) "price", 'lube' category from fuellubricant l
                    where status = true
                ) as product
                where transid=$1 and category=$2
        `          
        const result = await pool.query(query,[productid, category]);
        res.status(201).json({ success: true, message: result.rows });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database query error " });
    }
});
 
 

module.exports = router;