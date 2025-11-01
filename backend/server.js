import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Carpeta de uploads
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Servir frontend y uploads
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/uploads", express.static(UPLOAD_DIR));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/home.html"));
});

// 🐱 Datos simulados en memoria
let cats = [
  {
    id: 1,
    name: "Pelusa",
    age: 2,
    breed: "Siames",
    description: "Muy juguetón y curioso.",
    status: "available",
    image: ""
  },
  {
    id: 2,
    name: "Michi",
    age: 3,
    breed: "Persa",
    description: "Tranquilo y cariñoso.",
    status: "adopted",
    image: ""
  }
];

// --- Rutas API ---
app.get("/api/cats", (req, res) => {
  res.json(cats);
});

app.post("/api/cats", upload.single("imageFile"), (req, res) => {
  const { name, age, breed, description, status } = req.body;
  const newCat = {
    id: Date.now(),
    name,
    age,
    breed,
    description,
    status,
    image: req.file ? `/uploads/${req.file.filename}` : ""
  };
  cats.push(newCat);
  res.json({ id: newCat.id });
});

app.put("/api/cats/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const cat = cats.find(c => c.id == id);
  if (cat) cat.status = status;
  res.json({ message: "Estado actualizado" });
});

app.delete("/api/cats/:id", (req, res) => {
  const { id } = req.params;
  cats = cats.filter(c => c.id != id);
  res.json({ message: "Gato eliminado" });
});

// 🚀 Iniciar servidor (Render usa PORT automáticamente)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
