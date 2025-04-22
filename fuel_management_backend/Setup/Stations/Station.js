const express = require("express");
const router = express.Router();
const pool = require("../../Config/Connection");
const StationSchema = require("./Params/StationSchema");

/**
 * Only get the station table 
 *
 */
router.get('/', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(`
      SELECT 
          id,
          code,
          name
      FROM station
    `)

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Successfully fetch stations.",
      body: result.rows,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
  finally {
    client.release();
  }
})

router.get("/stations", async (req, res) => {
  const client = await pool.connect(); 
  try { 
    await client.query("BEGIN");

    const result = await client.query(`
      SELECT      a.id,
                  a.code,
                  a.name,
                  a.details,
                  a.address,
                  a.provinceId,
                  a.province,
                  a.cityId,
                  a.city,
                  a.barangayId,
                  a.barangay barangay,
                  a.openingTime,
                  a.closingTime,
                  a.pumps,
                  a.nozzles,
                  a.fillingPosition,
                  a.posStation,
                  a.shipToNumber
      FROM        station a
    `);

    await client.query("COMMIT");

    return res.status(201).json({
      success: true, 
      message: "Successfully fetched stations", 
      body: result.rows 
    });
  }
  catch (err) {
    await client.query("ROLLBACK");

    return res.status(500).json({ 
      success: false, 
      message: "Database query error",  });
    // res.status(500).json({ error: "Database query error" });
  }
  finally {
    client.release();
  }
});

router.get("/stations/:userId/user", async (req, res) => {
  const client = await pool.connect(); 
  try { 
    await client.query("BEGIN");
    
    const { userId } = req.params;

    const result = await client.query(`
      SELECT      a.id,
                  a.code,
                  a.name,
                  a.details,
                  a.address,
                  a.provinceId,
                  a.province,
                  a.cityId,
                  a.city,
                  a.barangayId,
                  a.barangay barangay,
                  a.openingTime,
                  a.closingTime,
                  a.pumps,
                  a.nozzles,
                  a.fillingPosition,
                  a.posStation,
                  a.shipToNumber
      FROM        station a
      JOIN        userstationassignments b
      ON a.id=b.stationid
      where b.userid= $1
    `,[userId]);

    await client.query("COMMIT");

    return res.status(201).json({
      success: true, 
      message: "Successfully fetched stations", 
      body: result.rows 
    });
  }
  catch (err) {
    await client.query("ROLLBACK");

    return res.status(500).json({ 
      success: false, 
      message: "Database query error",  });
    // res.status(500).json({ error: "Database query error" });
  }
  finally {
    client.release();
  }
});
 
router.get("/stations/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN");

    const result = await client.query(`
      SELECT      a.id,
                  a.code,
                  a.name,
                  a.details,
                  a.address,
                  a.provinceId,
                  a.province,
                  a.cityId,
                  a.city,
                  a.barangayId,
                  a.barangay,
                  a.openingTime,
                  a.closingTime,
                  a.pumps,
                  a.nozzles,
                  a.fillingPosition,
                  a.posStation,
                  a.shipToNumber
      FROM        station a
      WHERE       a.id = $1
    `, [id]);

    await client.query("COMMIT");

    return res.status(200).json({ success: true, message: "Successfully fetch stations", body: result.rows });
  }
  catch (err) {
    await client.query("ROLLBACK");
    
    return res.status(500).json({ success: false, message: "Database query error" });
  }
  finally {
    client.release();
  }
});

router.get("/stations/dropdown", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(`
      SELECT      a.id,
                  a.code,
                  a.name,
                  a.details,
                  a.address,
                  a.provinceId,
                  b.name province,
                  a.cityId,
                  c.name city,
                  a.barangayId,
                  d.name barangay,
                  a.openingTime,
                  a.closingTime,
                  a.pumps,
                  a.nozzles,
                  a.fillingPosition,
                  a.posStation,
                  a.shipToNumber
      FROM        station a
      INNER JOIN  dropdown b
              ON  a.provinceId = b.id
                  AND b.dropdownTypeId = 14
      INNER JOIN  dropdown c
              ON  a.cityId = c.id
                  and c.dropdownTypeId = 15
      INNER JOIN  dropdown d
              ON  a.barangayId = d.id
                  AND d.dropdownTypeId = 16
    `);

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Successfully fetched stations",
      body: result.rows,
    });
  }
  catch (err) {
    await client.query("ROLLBACK");

    return res.status(500).json({ success: false, message: "Database query error" });
    // res.status(500).json({ error: "Database query error" });
  }
  finally {
    client.release();
  }
});

router.get("/stations/dropdown/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN");

    const result = await client.query(`
      SELECT      a.id,
                  a.code,
                  a.name,
                  a.details,
                  a.address,
                  a.provinceId,
                  b.name province,
                  a.cityId,
                  c.name city,
                  a.barangayId,
                  d.name barangay,
                  a.openingTime,
                  a.closingTime,
                  a.pumps,
                  a.nozzles,
                  a.fillingPosition,
                  a.posStation,
                  a.shipToNumber
      FROM        station a
      INNER JOIN  dropdown b
              ON  a.provinceId = b.id
                  AND b.dropdownTypeId = 14
      INNER JOIN  dropdown c
              ON  a.cityId = c.id
                  and c.dropdownTypeId = 15
      INNER JOIN  dropdown d
              ON  a.barangayId = d.id
                  AND d.dropdownTypeId = 16
      WHERE       a.id = $1
    `, [id]);

    await client.query("COMMIT");

    res.status(201).json({ success: true, message: "Successfully fetch stations", body: result.rows });
  }
  catch (err) {
    await client.query("ROLLBACK");

    res.status(500).json({ success: false, message: "Database query error" });
  }
  finally {
    client.release();
  }
});

router.post("/station", async (req, res) => {
  const client = await pool.connect();

  try {
    const { error, value } = StationSchema.validate(req.body)

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((err) => err.message),
      })
    }

    const { stationCode, stationName, details, address, province, city, barangay, openingTime, closingTime, pumps, nozzles, fillingPosition, posStations, shipToNumber } = value;

    await client.query("BEGIN");

    const result = await client.query(`
      INSERT INTO station
                  (
                    code,
                    name,
                    details,
                    address,
                    province,
                    city,
                    barangay,
                    openingTime,
                    closingTime,
                    pumps,
                    nozzles,
                    fillingPosition,
                    posStation,
                    shipToNumber,
                    createdby
                  )
      VALUES      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING   id
    `, [stationCode, stationName, details, address, province, city, barangay, openingTime, closingTime, pumps, nozzles, fillingPosition, posStations, shipToNumber, req.user.username]);

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Successfully add new station",
      body: null
    });
  }
  catch (err) {
    await client.query("ROLLBACK");
    console.log(err);

    res.status(500).json({ success: false, message: "Database query error" });
  }
  finally {
    client.release();
  }
});

router.put("/station/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { error, value } = StationSchema.validate(req.body)

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((err) => err.message),
      })
    }

    const { stationCode, stationName, details, address, province, city, barangay, openingTime, closingTime, pumps, nozzles, fillingPosition, posStations, shipToNumber } = value;

    await client.query("BEGIN")

    const result = await client.query(`
      UPDATE      station
      SET         code = $2,
                  name = $3,
                  details = $4,
                  address = $5,
                  province = $6,
                  city = $7,
                  barangay = $8,
                  openingTime = $9,
                  closingTime = $10,
                  pumps = $11,
                  nozzles = $12,
                  fillingPosition = $13,
                  posStation = $14,
                  shipToNumber = $15
      WHERE       id = $1
    `, [id, stationCode, stationName, details, address, province, city, barangay, openingTime, closingTime, pumps, nozzles, fillingPosition, posStations, shipToNumber]);

    await client.query("COMMIT");

    res.status(201).json({ success: true,  message: 'Successfully updated station details'});
  }
  catch (err) {
    await client.query("ROLLBACK");

    res.status(500).json({ success: false, message: "Database query error" });
  }
  finally {
    client.release();
  }
});

router.delete("/station/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN")

    const result = await client.query(`
      DELETE
      FROM        station
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
