const express = require("express");
const router = express.Router();
const pool = require("../../Config/Connection");

router.get("/station/:stationId/shifts", async (req, res) => {
  const client = await pool.connect();

  try {
    const { stationId } = req.params;
    
    const stationIdsArray = stationId.split(',').map(id => parseInt(id.trim()));

    await client.query("BEGIN");

    const result = await client.query(`
      SELECT      a.id,
                  a.shiftId,
                  b.name shift,
                  b.startTime,
                  b.endTime,
                  b.details
      FROM        stationShift a
      INNER JOIN  shift b
              ON  a.shiftId = b.id
      WHERE       a.stationId = ANY ($1::int[]) 
    `, [stationIdsArray]);

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



router.get("/station/:stationId/shifts2", async (req, res) => {
  const client = await pool.connect();

  try {
    const { stationId } = req.params;
    
    const stationIdsArray = stationId.split(',').map(id => parseInt(id.trim()));

    await client.query("BEGIN");

    const result = await client.query(`
      SELECT   distinct   
        b.id, 
        b.name, 
        b.details
      FROM        stationShift a
      INNER JOIN  shift b
          ON  a.shiftId = b.id
      WHERE       a.stationId = ANY ($1::int[]) 
      and b.status = true
    `, [stationIdsArray]);

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


router.get("/station/:stationId/:shiftmanagerId/shifts2", async (req, res) => {
  try {
    const { stationId, shiftmanagerId } = req.params;

    const stationIdsArray = stationId.split(',').map(id => parseInt(id.trim()));     
    const shiftmanagerIdsArray = shiftmanagerId.split(',').map(id => parseInt(id.trim())); 


    const result = await pool.query(`
          SELECT DISTINCT 
              a.shiftId AS id,
              b.name shift 	
          FROM stationShift a
          INNER JOIN  shift b
              ON  a.shiftId = b.id 
          INNER JOIN stationShiftCrew crew 
              ON crew.stationshiftid = b.id 
          WHERE   1=1
            AND   a.stationId = ANY ($1::int[]) 
            AND   crew.employeeid = ANY ($2::int[]) 
    `, [stationIdsArray, shiftmanagerIdsArray]); 
    res.status(201).json(result.rows);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query error" });
  }
});





router.get("/station/:stationId/shifts/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    const { stationId, id } = req.params;

    await client.query("BEGIN");

    const result = await client.query(`
      SELECT      a.id,
                  a.shiftId,
                  b.name shift,
                  b.startTime,
                  b.endTime,
                  b.details
      FROM        stationShift a
      INNER JOIN  shift b
              ON  a.shiftId = b.id
      WHERE       a.stationId = $1
                  AND a.id = $2
    `, [stationId, id]);

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

router.post("/station/:stationId/shift", async (req, res) => {
  const client = await pool.connect();

  try {
    const { stationId } = req.params;
    const { shiftId } = req.body;

    await client.query("BEGIN");

    const result = await client.query(`
      INSERT INTO stationShift
                  (
                    stationId,
                    shiftId
                  )
      VALUES      ($1, $2)
      RETURNING   id
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

router.put("/station/:stationId/shift/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    const { stationId, id } = req.params;
    const { shiftId } = req.body;
    
    await client.query("BEGIN")
    
    const result = await client.query(`
      UPDATE      stationShift
      SET         shiftId = $3
      WHERE       stationId = $1
                  AND id = $2
    `, [stationId, id, shiftId]);

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

router.delete("/station/:stationId/shift/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    
    await client.query("BEGIN")
    
    const result = await client.query(`
      DELETE
      FROM        stationShift
      WHERE       id = $1
    `, [id]);

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

module.exports = router;