// server.js
import express from "express";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/graph", (req, res) => {
  const { x = 1, y = 2, z = 3, activation = "tanh" } = req.query;

  const py = spawn("python", [
    path.join(__dirname, "graphwiz/generate_graph.py"),
    x,
    y,
    z,
    activation,
  ]);

  let data = "";
  py.stdout.on("data", (chunk) => (data += chunk.toString()));
  py.stderr.on("data", (err) => console.error(err.toString()));

  py.on("close", () => res.send(data));
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
