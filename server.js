const express = require("express");
const { exec } = require("child_process");

const app = express();
app.use(express.json({ limit: "500mb" }));

app.post("/process", (req, res) => {
  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ error: "FFmpeg command missing" });
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      return res.status(500).json({ error: stderr });
    }
    res.json({ success: true, output: stdout });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FFmpeg HTTP API running on port ${PORT}`);
});
