# 🏥 Homeopathy Radar Cloud

**Dr. Bamania's Classical Homeopathy - Advanced Repertory & Patient Management System**

A full-stack web application for homeopathic case analysis, remedy selection, and patient management with a comprehensive repertory database of 31,000+ rubrics and 1,200+ remedies.

---

## ✨ Features

- 📊 **Advanced Case Analysis** - Analyze symptoms and get remedy recommendations
- 📚 **Materia Medica** - Browse 1,200+ remedies with detailed descriptions
- 🔍 **Smart Search** - Autocomplete symptom search with 31,000+ rubrics
- 👥 **Patient Management** - Save, edit, and manage patient cases
- 📱 **WhatsApp Integration** - Share prescriptions directly via WhatsApp
- 🎨 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- ⚡ **Fast & Efficient** - Optimized performance with caching and compression

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Clone or download the repository**
   ```bash
   cd homeopathy-web-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

---

## 📁 Project Structure

```
homeopathy-web-app/
├── backend/
│   ├── server.js                    # Main Express server
│   ├── cases.json                   # Patient cases storage
│   ├── data/
│   │   ├── repertory.json          # 31,000+ symptom rubrics
│   │   └── materia_medica.json     # 1,200+ remedy descriptions
│   ├── generate_repertory.js       # Script to generate repertory
│   └── generate_materia_medica.js  # Script to generate materia medica
├── frontend/
│   ├── index.html                  # Main HTML file
│   ├── app.js                      # Frontend JavaScript
│   ├── style.css                   # Styling
│   ├── logo.svg                    # App logo
│   └── whatsapp.svg                # WhatsApp icon
├── package.json                    # Dependencies and scripts
├── render.yaml                     # Render.com deployment config
├── .env.example                    # Environment variables template
└── README.md                       # This file
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory (optional):

```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
```

For production, these are automatically set by hosting platforms.

---

## 🌐 API Endpoints

### Health Check
- **GET** `/health` - Server health status and statistics

### Symptoms
- **GET** `/symptoms` - Get all symptoms
- **GET** `/symptoms?q=headache&limit=50` - Search symptoms

### Remedies
- **GET** `/remedies` - Get all remedies
- **GET** `/remedies?q=arnica` - Search remedies
- **GET** `/remedy/:name` - Get remedy details

### Analysis
- **POST** `/analyze` - Analyze symptoms and get remedy scores
  ```json
  {
    "symptoms": ["headache", "fever", "nausea"]
  }
  ```

### Cases
- **GET** `/cases` - Get all patient cases
- **GET** `/cases?q=john` - Search cases
- **POST** `/save` - Save a new case
- **PUT** `/cases/:id` - Update a case
- **DELETE** `/cases/:id` - Delete a case

### Statistics
- **GET** `/stats` - Get database statistics

---

## 🚢 Deployment

### Deploy to Render.com (Recommended)

1. **Push your code to GitHub**

2. **Create a new Web Service on Render.com**
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`

3. **Configuration is automatic** via `render.yaml`:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check: `/health`
   - Port: Auto-assigned

4. **Deploy!** 🎉

### Deploy to Heroku

1. **Install Heroku CLI**

2. **Login and create app**
   ```bash
   heroku login
   heroku create homeopathy-radar-cloud
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Deploy to Railway

1. **Connect GitHub repository**
2. **Railway auto-detects Node.js**
3. **Deploy automatically**

---

## 🛠️ Development

### Run in Development Mode
```bash
npm run dev
```

### Generate New Data

**Regenerate Repertory:**
```bash
cd backend
node generate_repertory.js
```

**Regenerate Materia Medica:**
```bash
cd backend
node generate_materia_medica.js
```

---

## 📊 Database

The application uses **file-based JSON storage** for simplicity:

- **cases.json** - Patient records (auto-created)
- **data/repertory.json** - Symptom-remedy mappings (31,119 rubrics)
- **data/materia_medica.json** - Remedy descriptions (1,257 remedies)

For production with high traffic, consider migrating to MongoDB or PostgreSQL.

---

## 🎨 Frontend Features

- **Responsive Design** - Mobile-first approach
- **Toast Notifications** - User-friendly feedback
- **Modal System** - Clean Materia Medica browsing
- **Autocomplete** - Fast symptom search
- **WhatsApp Integration** - One-click prescription sharing
- **Case Management** - Full CRUD operations
- **Live Clock** - Real-time prescription timestamp

---

## 🔒 Security Features

- **CORS Protection** - Configurable cross-origin requests
- **Input Validation** - Server-side validation for all inputs
- **Rate Limiting** - Prevent abuse (50 symptoms max per analysis)
- **Error Handling** - Graceful error recovery
- **Sanitized Inputs** - XSS protection

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Data Files Not Found
Ensure `backend/data/` contains:
- `repertory.json`
- `materia_medica.json`

Run generation scripts if missing.

### Server Won't Start
1. Check Node.js version: `node --version` (should be ≥18)
2. Reinstall dependencies: `npm install`
3. Check logs for specific errors

---

## 📝 License

This project is for educational and professional use by homeopathic practitioners.

---

## 👨‍⚕️ About

Developed for **Dr. Bamania's Classical Homeopathy Practice**

**Contact:** [Your Contact Information]

---

## 🙏 Acknowledgments

- Repertory data compiled from classical homeopathic texts
- Materia Medica sourced from authoritative homeopathic literature
- Built with modern web technologies for optimal performance

---

**Made with ❤️ for the Homeopathic Community**