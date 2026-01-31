import express from "express";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "100mb" }));

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "ffmpeg-http-api" });
});

// Video processing endpoint
app.post("/process", async (req, res) => {
  try {
    const { input, output, args } = req.body;

    if (!input || !output || !args) {
      return res.status(400).json({ error: "input, output ve args zorunlu" });
    }

    const inputPath = path.join(__dirname, input);
    const outputPath = path.join(__dirname, output);

    const command = `ffmpeg -y -i "${inputPath}" ${args} "${outputPath}"`;

    exec(command, (error) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: "FFmpeg çalıştırılamadı" });
      }

      if (!fs.existsSync(outputPath)) {
        return res.status(500).json({ error: "Çıktı dosyası oluşmadı" });
      }

      res.setHeader("Content-Type", "video/mp4");
      fs.createReadStream(outputPath).pipe(res);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FFmpeg API running on port ${PORT}`);
});
