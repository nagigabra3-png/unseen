import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs-extra";
import multer from "multer";

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Ensure directories exist
fs.ensureDirSync(UPLOADS_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  }
});

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Initialize DB if not exists
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      artists: [
        { id: "a1", name: "Omar Khaled", bio: "A contemporary painter exploring the intersections of Cairene brutalism and traditional textile patterns.", achievements: [{ year: 2023, title: "Youth Salon Grand Prize" }] },
        { id: "a2", name: "Laila Mansour", bio: "Focuses on the fluid dynamics of the Nile delta through an abstract expressionist lens.", achievements: [{ year: 2024, title: "AUC Arts Merit Scholarship" }] },
        { id: "a3", name: "Youssef Amin", bio: "Specializes in urban decay and structural beauty in medieval Cairo.", achievements: [{ year: 2023, title: "Cairo Biennale Guest" }] },
        { id: "a4", name: "Hana El-Sayed", bio: "Graphic minimalism applied to traditional Egyptian motifs.", achievements: [{ year: 2024, title: "Design Merit Award" }] },
        { id: "a5", name: "Tarek Zein", bio: "Experimental metalwork and sculpture.", achievements: [{ year: 2022, title: "Sculptors Guild Prize" }] },
        { id: "a6", name: "Mona Reda", bio: "Atmospheric landscapes of the Mediterranean coast.", achievements: [{ year: 2023, title: "Coastal Art Fellowship" }] },
        { id: "a7", name: "Adam El-Maghraby", bio: "Structuralist approach to painting and architecture.", achievements: [{ year: 2024, title: "GUC Design Award" }] },
        { id: "a8", name: "Zeina Fouad", bio: "Explores biological forms through mixed media.", achievements: [{ year: 2023, title: "Gallery Selection Prize" }] },
        { id: "a9", name: "Karim Abdel Aziz", bio: "Digital-influenced oil painting.", achievements: [{ year: 2024, title: "Modernist Grant" }] },
        { id: "a10", name: "Noura Sherif", bio: "Abstract desert landscapes.", achievements: [{ year: 2024, title: "Desert Artist Award" }] },
        { id: "a11", name: "Tamer Hosny", bio: "Neo-symbolist painter.", achievements: [{ year: 2024, title: "Shadows Exhibition" }] },
        { id: "a12", name: "Layla El-Sayed", bio: "Expressionist painter using ancient techniques.", achievements: [{ year: 2023, title: "Gouache Master Award" }] }
      ],
      artworks: [
        { id: "1", title: "The Silent Threshold", artistId: "a1", institution: "Faculty of Fine Arts, Zamalek", program: "Oil Painting & Murals", price: 8500, image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=1000", available: true, year: 2024, medium: "Canvas", paintType: "Oil" },
        { id: "2", title: "Nile Reflections I", artistId: "a2", institution: "Luxor Faculty of Arts", program: "Visual Arts", price: 12000, image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1000", available: true, year: 2023, medium: "Linen", paintType: "Acrylic" },
        { id: "3", title: "Urban Ghost", artistId: "a3", institution: "Cairo University", program: "Fine Arts", price: 6400, image: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1000", available: true, year: 2024, medium: "Paper", paintType: "Ink & Charcoal" },
        { id: "4", title: "Cairo Geometry IV", artistId: "a4", institution: "Helwan University", program: "Applied Arts", price: 9800, image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&q=80&w=1000", available: true, year: 2024, medium: "Fine Art Print", paintType: "Pigment Ink" },
        { id: "5", title: "Resonated Metal", artistId: "a5", institution: "German University in Cairo", program: "Product Design", price: 7200, image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=1000", available: false, year: 2023, medium: "Wood & Metal", paintType: "Mixed" },
        { id: "6", title: "Blue Hour", artistId: "a6", institution: "Alexandria University", program: "Painting Dept.", price: 5900, image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=1000", available: true, year: 2024, medium: "Canvas", paintType: "Oil" },
        { id: "7", title: "Architectural Fluidity", artistId: "a7", institution: "German University in Cairo", program: "Design & Visual Communication", price: 15500, image: "https://images.unsplash.com/photo-15797833922594-0428d2678bb7?auto=format&fit=crop&q=80&w=1000", available: true, year: 2024, medium: "Canvas", paintType: "Oil" },
        { id: "8", title: "Organic Pulse", artistId: "a8", institution: "American University in Cairo", program: "Visual Arts", price: 4300, image: "https://images.unsplash.com/photo-1576133030430-2cb046dcf884?auto=format&fit=crop&q=80&w=1000", available: true, year: 2023, medium: "Board", paintType: "Mixed Media" },
        { id: "9", title: "Ethereal Morning", artistId: "a9", institution: "Faculty of Fine Arts, Zamalek", program: "Painting", price: 11000, image: "https://images.unsplash.com/photo-1515405295579-ba7b45403062?auto=format&fit=crop&q=80&w=1000", available: true, year: 2024, medium: "Canvas", paintType: "Oil" },
        { id: "10", title: "Desert Geometry", artistId: "a10", institution: "Minia University", program: "Fine Arts", price: 8900, image: "https://images.unsplash.com/photo-1501166617713-78894982c30f?auto=format&fit=crop&q=80&w=1000", available: true, year: 2024, medium: "Canvas", paintType: "Acrylic" },
        { id: "11", title: "Whispering Shadows", artistId: "a11", institution: "Helwan University", program: "Applied Arts", price: 7500, image: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1000", available: true, year: 2024, medium: "Canvas", paintType: "Oil" },
        { id: "12", title: "Vivid Dreams", artistId: "a12", institution: "Luxor Faculty of Arts", program: "Printmaking", price: 13000, image: "https://images.unsplash.com/photo-1579783483458-83d02161294e?auto=format&fit=crop&q=80&w=1000", available: true, year: 2023, medium: "Canvas", paintType: "Gouache" }
      ]
    };
    await fs.writeJson(DB_FILE, initialData, { spaces: 2 });
  }

  const getDB = () => fs.readJson(DB_FILE);
  const saveDB = (data: any) => fs.writeJson(DB_FILE, data, { spaces: 2 });

  // API Routes
  app.get("/api/data", async (req, res) => {
    const db = await getDB();
    res.json(db);
  });

  app.post("/api/artworks", async (req, res) => {
    const db = await getDB();
    const artwork = req.body;
    if (!artwork.id) {
      artwork.id = Date.now().toString();
      db.artworks.push(artwork);
    } else {
      const idx = db.artworks.findIndex((a: any) => a.id === artwork.id);
      if (idx !== -1) db.artworks[idx] = artwork;
      else db.artworks.push(artwork);
    }
    await saveDB(db);
    res.json(artwork);
  });

  app.delete("/api/artworks/:id", async (req, res) => {
    const db = await getDB();
    db.artworks = db.artworks.filter((a: any) => a.id !== req.params.id);
    await saveDB(db);
    res.json({ success: true });
  });

  app.post("/api/artists", async (req, res) => {
    const db = await getDB();
    const artist = req.body;
    if (!artist.id) {
      artist.id = Date.now().toString();
      db.artists.push(artist);
    } else {
      const idx = db.artists.findIndex((a: any) => a.id === artist.id);
      if (idx !== -1) db.artists[idx] = artist;
      else db.artists.push(artist);
    }
    await saveDB(db);
    res.json(artist);
  });

  app.delete("/api/artists/:id", async (req, res) => {
    const db = await getDB();
    // Also remove or unlink artworks by this artist? For now, just set artistId to empty or handle in UI
    db.artists = db.artists.filter((a: any) => a.id !== req.params.id);
    await saveDB(db);
    res.json({ success: true });
  });

  app.post("/api/upload", upload.single("image"), (req: any, res) => {
    if (!req.file) return res.status(400).send("No file uploaded");
    res.json({ url: `/uploads/${req.file.filename}` });
  });

  // Serve uploads
  app.use("/uploads", express.static(UPLOADS_DIR));

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
