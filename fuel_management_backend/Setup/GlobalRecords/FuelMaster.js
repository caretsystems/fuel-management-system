const express = require("express");
const router = express.Router();
const pool = require("../../Config/Connection");

router.get("/fuelMasters", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(`
      SELECT      a.id,
                  a.code,
                  a.name,
                  a.categoryId,
                  b.name category,
                  a.details,
                  a.color,
                  a.status,
                  coalesce(fuelprice.price,0) price
      FROM        fuelMaster a
      INNER JOIN  dropdown b
              ON  a.categoryId = b.id
      left join (
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
			) trans
	            where trans.RN=1
	        group by trans.fuelmasterid
      ) fuelprice
      on fuelprice.fuelmasterid= a.id
      ORDER BY a.code asc
    `);

    await client.query("COMMIT");
    
    res.status(200).json(result.rows);
  }
  catch (err) {
    await client.query("ROLLBACK");

    res.status(500).json({ error: "Database query error" });
  }
  finally {
    client.release();
  }
});

router.get("/fuelMasters/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN");

    const result = await client.query(`
      SELECT      a.id,
                  a.code,
                  a.name,
                  a.categoryId,
                  b.name category,
                  a.details,
                  a.color,
                  a.status
      FROM        fuelMaster a
      INNER JOIN  dropdown b
              ON  a.categoryId = b.id
      WHERE       a.id = $1
    `, [id]);

    await client.query("COMMIT");

    res.status(200).json(result.rows);
  }
  catch (err) {
    await client.query("ROLLBACK");

    res.status(500).json({ error: "Database query error" });
  }
  finally {
    client.release();
  }
});

router.post("/fuelMaster", async (req, res) => {
  const client = await pool.connect();
  const { code, name, categoryId, details, color, status } = req.body;

  // console.log(req.body);
  try {
    

    await client.query("BEGIN");

    const result = await client.query(`
      INSERT INTO fuelMaster
                  (
                    code,
                    name,
                    categoryId,
                    details,
                    color,
                    status
                  )
      VALUES      ($1, $2, $3, $4, $5, $6)
      RETURNING   id
    `, [code, name, categoryId, details, color, status]);

    await client.query("COMMIT");

    res.status(201).json(result.rows);
  }
  catch (err) {
    await client.query("ROLLBACK");

    res.status(500).json({ error: "Database query error" });
  }
  finally {
    client.release()
  }
});

router.put("/fuelMaster/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { code, name, categoryId, details, color, status } = req.body;

    await client.query("BEGIN");

    const result = await client.query(`
      UPDATE      fuelMaster
      SET         code = $2,
                  name = $3,
                  categoryId = $4,
                  details = $5,
                  color = $6,
                  status = $7
      WHERE       id = $1
    `, [id, code, name, categoryId, details, color, status]);

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

router.delete("/fuelMaster/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN");

    const result = await client.query(`
      DELETE
      FROM        fuelMaster
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