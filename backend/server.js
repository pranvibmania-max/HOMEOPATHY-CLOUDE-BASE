const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const app = express();const path = require('path');

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve index.html on root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Middleware ───────────────────────────────────────────────────────────────

// CORS Configuration - Allow all origins in production (adjust as needed)
const corsOptions = {
    origin: process.env.NODE_ENV === "production"
        ? true // Allow all origins in production
        : "*", // Allow all in development
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser with size limit
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        if (req.path !== "/health") {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
        }
    });
    next();
});

// Serve static frontend files with caching
const isProduction = process.env.NODE_ENV === "production";
app.use(express.static(path.join(__dirname, "../frontend"), {
    maxAge: isProduction ? "1d" : 0,
    etag: true,
    lastModified: true
}));

// ── Data Files ──────────────────────────────────────────────────────────────
const DATA_FILE = path.join(__dirname, "cases.json");
const REPERTORY_FILE = path.join(__dirname, "data/repertory.json");
const MATERIA_MEDICA_FILE = path.join(__dirname, "data/materia_medica.json");

// ── Case Management (File-based CRUD) ───────────────────────────────────────
function getCases() {
    if (!fs.existsSync(DATA_FILE)) return [];
    try {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Error reading cases file:", e.message);
        return [];
    }
}

function saveCasesToFile(cases) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(cases, null, 2), "utf-8");
        return true;
    } catch (e) {
        console.error("Error writing cases file:", e.message);
        return false;
    }
}

function addCase(newCase) {
    const cases = getCases();
    // Generate a unique ID for the case
    newCase.id = newCase.id || `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    newCase.createdAt = newCase.date || new Date().toISOString();
    newCase.updatedAt = new Date().toISOString();
    cases.push(newCase);
    return saveCasesToFile(cases) ? newCase : null;
}

// ── Load Repertory & Materia Medica ─────────────────────────────────────────
let repertory = {};
let materiaMedica = {};
let repertoryKeys = []; // Pre-cached lowercase keys for fast search
let materiaMedicaKeys = []; // Pre-cached sorted keys

// Load Repertory
if (fs.existsSync(REPERTORY_FILE)) {
    try {
        console.log("Loading repertory data...");
        const rawData = fs.readFileSync(REPERTORY_FILE, "utf-8");
        repertory = JSON.parse(rawData);
        repertoryKeys = Object.keys(repertory).map(k => k.toLowerCase());
        console.log(`✔ Loaded ${repertoryKeys.length} repertory rubrics.`);
    } catch (e) {
        console.error("✖ Error loading repertory:", e.message);
    }
} else {
    console.warn("⚠ Repertory file not found at", REPERTORY_FILE);
}

// Load Materia Medica
if (fs.existsSync(MATERIA_MEDICA_FILE)) {
    try {
        console.log("Loading Materia Medica...");
        const mmData = fs.readFileSync(MATERIA_MEDICA_FILE, "utf-8");
        materiaMedica = JSON.parse(mmData);
        materiaMedicaKeys = Object.keys(materiaMedica).sort();
        console.log(`✔ Loaded Materia Medica for ${materiaMedicaKeys.length} remedies.`);
    } catch (e) {
        console.error("✖ Error loading Materia Medica:", e.message);
    }
} else {
    console.warn("⚠ Warning: Materia Medica file not found at", MATERIA_MEDICA_FILE);
}

// ══════════════════════════════════════════════════════════════════════════════
// ── API ROUTES ───────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// ── Health Check ─────────────────────────────────────────────────────────────
const startTime = Date.now();

app.get("/health", (req, res) => {
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;

    res.json({
        status: "ok",
        uptime: `${hours}h ${minutes}m ${seconds}s`,
        remediesCount: materiaMedicaKeys.length,
        repertoryCount: repertoryKeys.length,
        casesCount: getCases().length,
        timestamp: new Date().toISOString()
    });
});

// ── Symptoms endpoint ────────────────────────────────────────────────────────
app.get("/symptoms", (req, res) => {
    const search = (req.query.q || "").toLowerCase().trim();
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);

    if (search && search.length >= 2) {
        // Advanced search: split query into words and match ALL words
        const searchWords = search.replace(/headache/g, 'head aching').split(/\s+/);
        const matches = [];
        const originalKeys = Object.keys(repertory);

        for (let i = 0; i < originalKeys.length && matches.length < limit; i++) {
            const lowKey = originalKeys[i].toLowerCase();
            const allWordsMatch = searchWords.every(word => lowKey.includes(word));

            if (allWordsMatch) {
                matches.push(originalKeys[i]);
            }
        }
        res.json(matches);
    } else {
        // Return all symptoms
        res.json(Object.keys(repertory));
    }
});

// ── List all remedies ────────────────────────────────────────────────────────
app.get("/remedies", (req, res) => {
    const search = (req.query.q || "").toLowerCase().trim();

    if (search) {
        const filtered = materiaMedicaKeys.filter(k => k.toLowerCase().includes(search));
        res.json(filtered);
    } else {
        res.json(materiaMedicaKeys);
    }
});

// ── Get remedy Materia Medica details ────────────────────────────────────────
app.get("/remedy/:name", (req, res) => {
    const remedyName = req.params.name;

    if (!remedyName || remedyName.trim().length === 0) {
        return res.status(400).json({ error: "Remedy name is required." });
    }

    // Case-insensitive match
    const key = Object.keys(materiaMedica).find(
        k => k.toLowerCase() === remedyName.toLowerCase().trim()
    );

    if (key) {
        res.json({ name: key, details: materiaMedica[key] });
    } else {
        // Try partial match as fallback
        const partialKey = Object.keys(materiaMedica).find(
            k => k.toLowerCase().includes(remedyName.toLowerCase().trim())
        );
        if (partialKey) {
            res.json({ name: partialKey, details: materiaMedica[partialKey], partial: true });
        } else {
            res.status(404).json({ error: "Remedy not found" });
        }
    }
});

// ── Analyze symptoms ─────────────────────────────────────────────────────────
app.post("/analyze", (req, res) => {
    const symptoms = req.body.symptoms;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
        return res.status(400).json({ error: "Please provide an array of symptoms." });
    }

    // Limit to prevent abuse
    if (symptoms.length > 50) {
        return res.status(400).json({ error: "Maximum 50 symptoms per analysis." });
    }

    let scores = {};
    const originalKeys = Object.keys(repertory);

    symptoms.forEach(inputSymptom => {
        if (typeof inputSymptom !== "string") return;
        const lowerInput = inputSymptom.toLowerCase().trim();
        if (!lowerInput) return;

        let found = false;

        // Exact match first (fast O(1) lookup)
        if (repertory[lowerInput]) {
            const remedyMap = repertory[lowerInput];
            for (let remedy in remedyMap) {
                scores[remedy] = (scores[remedy] || 0) + remedyMap[remedy];
            }
            found = true;
        }

        // If no exact match, try partial match
        if (!found) {
            for (let i = 0; i < originalKeys.length; i++) {
                const key = originalKeys[i];
                const lowerKey = key.toLowerCase();
                if (lowerKey.includes(lowerInput) || lowerInput.includes(lowerKey)) {
                    const remedyMap = repertory[key];
                    for (let remedy in remedyMap) {
                        scores[remedy] = (scores[remedy] || 0) + (remedyMap[remedy] * 0.5);
                    }
                }
            }
        }
    });

    // Sort and return top results
    const sortedEntries = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30); // Return top 30 for efficiency

    const result = {};
    sortedEntries.forEach(([remedy, score]) => {
        result[remedy] = score;
    });

    res.json(result);
});

// ── Save a new case ──────────────────────────────────────────────────────────
app.post("/save", (req, res) => {
    const { name, age, gender } = req.body;

    // Validation
    if (!name || !name.trim()) {
        return res.status(400).json({ error: "Patient name is required." });
    }
    if (!age) {
        return res.status(400).json({ error: "Patient age is required." });
    }
    if (!gender) {
        return res.status(400).json({ error: "Patient gender is required." });
    }

    const caseData = {
        name: req.body.name.trim(),
        age: req.body.age,
        gender: req.body.gender,
        mobile: (req.body.mobile || "").trim(),
        address: (req.body.address || "").trim(),
        complaint: (req.body.complaint || "").trim(),
        symptoms: Array.isArray(req.body.symptoms) ? req.body.symptoms : [],
        prescription: (req.body.prescription || "").trim(),
        date: req.body.date || new Date().toISOString()
    };

    const saved = addCase(caseData);
    if (saved) {
        res.json({ status: "saved", case: saved });
    } else {
        res.status(500).json({ error: "Failed to save case. Please try again." });
    }
});

// ── Get all cases (with optional search) ─────────────────────────────────────
app.get("/cases", (req, res) => {
    const cases = getCases();
    const search = (req.query.q || "").toLowerCase().trim();

    if (search) {
        const filtered = cases.filter(c => {
            const nameMatch = (c.name || "").toLowerCase().includes(search);
            const mobileMatch = (c.mobile || "").includes(search);
            const complaintMatch = (c.complaint || "").toLowerCase().includes(search);
            return nameMatch || mobileMatch || complaintMatch;
        });
        res.json(filtered);
    } else {
        res.json(cases);
    }
});

// ── Update a case ────────────────────────────────────────────────────────────
app.put("/cases/:id", (req, res) => {
    const cases = getCases();
    const caseId = req.params.id;

    // Find by either 'id' field or 'date' field for backward compatibility
    const index = cases.findIndex(c => c.id === caseId || c.date === caseId);

    if (index === -1) {
        return res.status(404).json({ error: "Case not found." });
    }

    // Update fields
    const existing = cases[index];
    cases[index] = {
        ...existing,
        name: (req.body.name || existing.name).trim(),
        age: req.body.age || existing.age,
        gender: req.body.gender || existing.gender,
        mobile: (req.body.mobile !== undefined ? req.body.mobile : existing.mobile || "").trim(),
        address: (req.body.address !== undefined ? req.body.address : existing.address || "").trim(),
        complaint: (req.body.complaint !== undefined ? req.body.complaint : existing.complaint || "").trim(),
        symptoms: Array.isArray(req.body.symptoms) ? req.body.symptoms : existing.symptoms,
        prescription: (req.body.prescription !== undefined ? req.body.prescription : existing.prescription || "").trim(),
        updatedAt: new Date().toISOString()
    };

    if (saveCasesToFile(cases)) {
        res.json({ status: "updated", case: cases[index] });
    } else {
        res.status(500).json({ error: "Failed to update case." });
    }
});

// ── Delete a case ────────────────────────────────────────────────────────────
app.delete("/cases/:id", (req, res) => {
    const cases = getCases();
    const caseId = req.params.id;

    // Find by either 'id' field or 'date' field for backward compatibility
    const index = cases.findIndex(c => c.id === caseId || c.date === caseId);

    if (index === -1) {
        return res.status(404).json({ error: "Case not found." });
    }

    const deleted = cases.splice(index, 1)[0];

    if (saveCasesToFile(cases)) {
        res.json({ status: "deleted", case: deleted });
    } else {
        res.status(500).json({ error: "Failed to delete case." });
    }
});

// ── Statistics endpoint ──────────────────────────────────────────────────────
app.get("/stats", (req, res) => {
    const cases = getCases();

    const totalCases = cases.length;
    const genderBreakdown = {};
    const monthlyCount = {};

    cases.forEach(c => {
        // Gender stats
        const g = c.gender || "Unknown";
        genderBreakdown[g] = (genderBreakdown[g] || 0) + 1;

        // Monthly stats
        if (c.date) {
            const month = c.date.substring(0, 7); // "YYYY-MM"
            monthlyCount[month] = (monthlyCount[month] || 0) + 1;
        }
    });

    res.json({
        totalCases,
        genderBreakdown,
        monthlyCount,
        totalRemedies: materiaMedicaKeys.length,
        totalRubrics: repertoryKeys.length
    });
});

// ── Catch-All: Serve frontend for SPA routing ────────────────────────────────
app.get("*", (req, res) => {
    // Only serve index.html for non-API, non-file routes
    if (!req.path.startsWith("/api") && !req.path.includes(".")) {
        res.sendFile(path.join(__dirname, "../frontend/index.html"));
    } else {
        res.status(404).json({ error: "Not found" });
    }
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
    res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong."
    });
});

// ── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces

const server = app.listen(PORT, HOST, () => {
    console.log("\n══════════════════════════════════════════════");
    console.log(`  🏥 Homeopathy Radar Cloud Server`);
    console.log(`  🌐 Running at: http://${HOST}:${PORT}`);
    console.log(`  📊 Remedies: ${materiaMedicaKeys.length} | Rubrics: ${repertoryKeys.length}`);
    console.log(`  📁 Cases: ${getCases().length}`);
    console.log(`  🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log("══════════════════════════════════════════════\n");
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please use a different port.`);
        process.exit(1);
    } else {
        console.error('❌ Server error:', error);
        throw error;
    }
});

// ── Graceful Shutdown ────────────────────────────────────────────────────────
function gracefulShutdown(signal) {
    console.log(`\n[${signal}] Shutting down gracefully...`);
    server.close(() => {
        console.log("Server closed. Goodbye! 👋");
        process.exit(0);
    });
    // Force exit after 5s if still hanging
    setTimeout(() => {
        console.error("Forced shutdown after timeout.");
        process.exit(1);
    }, 5000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("uncaughtException", (err) => {
    console.error("[UNCAUGHT EXCEPTION]", err);
});
process.on("unhandledRejection", (reason) => {
    console.error("[UNHANDLED REJECTION]", reason);
});