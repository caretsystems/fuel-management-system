const express = require("express");
const router = express.Router();
const pool = require("../../Config/Connection");

router.get("/Station/:stationId/:shiftId/Employees", async (req, res) => {
    const client = await pool.connect();

    try {
        const { stationId, shiftId } = req.params;

        await client.query("BEGIN");

        const result = await client.query(`
            SELECT 		c.id, CONCAT(c.firstname, ' ', c.lastname) AS description
            FROM 		public.stationshift AS a
            LEFT JOIN	public.stationshiftcrew AS b
            ON			a.shiftid = b.stationshiftid
            LEFT JOIN	public.employee AS c
            ON			b.employeeid = c.id
            WHERE		a.stationid = $1
            AND			a.shiftid = $2

        `, [stationId, shiftId]);

        await client.query("COMMIT");

        res.status(201).json(result.rows);
    }
    catch (err) {
        await client.query("ROLLBACK");

        res.status(500).json({ error: "Database query error" });
    }
    finally {
        client.release();
    }
});


router.get("/Station/:stationId/ShiftManager", async (req, res) => {
    const { stationId } = req.params;
    const stationIdsArray = stationId.split(',').map(id => parseInt(id.trim())); 
    try {
        const result = await pool.query(`
            SELECT 	DISTINCT	
                    emp.id,
                    fn_getEmployeeName( cast( emp.id as integer) )  AS description
            FROM 	public.stationshift AS a
            JOIN	public.stationshiftcrew AS b
                ON		a.shiftid = b.stationshiftid
            JOIN	public.employee AS emp
                ON		b.employeeid = emp.id
            JOIN    public.dropdown dd 
                ON emp.designationid = dd.id 
            WHERE 1=1
            AND	dd.name = 'Shift Manager'
            AND a.stationid = ANY ($1::int[])  
        `, [stationIdsArray]);
        res.status(201).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database query error", StationId: stationIdsArray });
    }
});


router.get("/Station/:stationId/:shiftId/StationManager", async (req, res) => {
    try {
        const { stationId, shiftId  } = req.params;
        const stationIdsArray = stationId.split(',').map(id => parseInt(id.trim())); 
        const shiftIdsArray = shiftId.split(',').map(id => parseInt(id.trim())); 
        
        const result = await pool.query(`
            SELECT 	DISTINCT	
                    emp.id,
                    fn_getEmployeeName( cast( emp.id as integer) )  AS description 
            FROM 	public.stationshift AS a
            JOIN	public.stationshiftcrew AS b
                ON		a.shiftid = b.stationshiftid
            JOIN	public.employee AS emp
                ON		b.employeeid = emp.id
            JOIN    public.dropdown dd 
                ON emp.designationid = dd.id 
            WHERE 1=1
            AND	dd.name in ('Station Manager')
            AND a.stationid = ANY ($1::int[])
            AND a.shiftid = ANY ($2::int[]) 
      `, [stationIdsArray, shiftIdsArray]); 
      res.status(201).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database query error"});
    }
});




module.exports = router;