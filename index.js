import express from "express";
import dotenv from "dotenv";
import { getSignedPdfUrl } from "./utils/s3.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.get("/pdf/:fileName", async (req, res) => {
  try {
    const { fileName } = req.params;
    
    const signedUrl = await getSignedPdfUrl(fileName);

    res.redirect(signedUrl);
  } catch (err) {
    console.error("Error generating signed URL:", err);
    res.status(500).json({ error: "Failed to fetch PDF" });
  }
});

app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
