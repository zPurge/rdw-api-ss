import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/api/rdw", async (req, res) => {
  const { license_plate } = req.body;

  if (!license_plate) {
    return res.status(400).json({ error: "Missing license_plate" });
  }

  const cleanedPlate = license_plate.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  console.log(`✅ Request: ${cleanedPlate}`);
  try {
    const response = await fetch(`https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${cleanedPlate}`);
    const data = await response.json();

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Kenteken niet gevonden" });
    }

    const voertuig = data[0];
    console.log(`✅ Kenteken: ${cleanedPlate}`);
    res.json({
      merk: voertuig.merk,
      model: voertuig.handelsbenaming,
      bouwjaar: voertuig.datum_eerste_toelating
    });
  } catch (err) {
    console.error("❌ Fout bij RDW-fetch:", err);
    res.status(500).json({ error: "Serverfout bij RDW lookup" });
  }
});

app.get("/", (req, res) => {
  res.send("✅ RDW API draait");
});

app.listen(port, () => {
  console.log(`🚗 RDW API draait op poort ${port}`);
});
