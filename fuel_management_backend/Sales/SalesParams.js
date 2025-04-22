const express = require("express");
const router = express.Router();
const pool = require("../Config/Connection");

router.get("/ProductList", async (req, res) => {
    try {
         
        let query = `
           select transid, id, code,  name, category from (
	            select concat('fuel','-',id) transid, id, name as code, name, 'fuel' category from fuelmaster f 
	            where status = true
	            UNION ALL
	            select  concat('lube','-',id) transid, id, name as code, name, 'lube' category from fuellubricant l
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
 

module.exports = router;