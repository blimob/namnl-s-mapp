import express from 'express'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import ejsLayouts from 'express-ejs-layouts'
import helmet from 'helmet'
import expressSession from 'express-session'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connectDatabase } from './config/db.js'

// ✅ VIKTIG: Konfigurera miljövariabler FÖRST
dotenv.config()

// ✅ VIKTIG: Initiera Firebase Admin EFTER dotenv men FÖRE routes
import './config/firebaseAdmin.js'
import routes from './routes/index.js'

// Skapa __dirname motsvarighet för ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3005
const baseURL = process.env.BASE_URL || ''

// Loggning för alla routes
app.use((req, res, next) => {
  console.log(`Route requested: ${req.method} ${req.path}`)
  next()
})

// Förenklade säkerhetsinställningar
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "https:"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://www.gstatic.com",
        "https://apis.google.com",
        "https://cdn.jsdelivr.net"
      ],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com"
      ],
      fontSrc: [
        "'self'", 
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com"
      ],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: [
        "'self'",
        "https://identitytoolkit.googleapis.com",
        "https://*.firebaseio.com",
        "https://*.googleapis.com"
      ]
    },
    reportOnly: false
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  // Inaktivera specifika headers som kan orsaka problem
  hidePoweredBy: true,
  frameguard: {
    action: 'deny'
  },
  // Tillåt iframe från samma ursprung
  xFrame: {
    action: 'sameorigin'
  }
}))

// CORS och cookie-hantering
app.use(cors({
  origin: true,
  credentials: true
}))
app.use(cookieParser())

// Parsning av request body
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session-middleware
app.use(expressSession({
  secret: process.env.SESSION_SECRET || 'en_mycket_hemlig_nyckel',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000, // 1 timme
    sameSite: 'strict'
  }
}))

// Globala middleware för alla vyer
app.use((req, res, next) => {
  res.locals.baseURL = baseURL
  res.locals.user = req.session.user || null
  res.locals.currentPage = req.path
  res.locals.flash = req.session.flash || null

  // Rensa flash-meddelanden efter rendering
  if (req.session.flash) {
    delete req.session.flash
  }
  
  next()
})

// Statiska filer
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: '1d', // Cacha statiska filer i 1 dag
  etag: true // Aktivera ETag för effektiv cachehantering
}))
app.use(baseURL, express.static(path.join(__dirname, '../public')))

// EJS setup
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(ejsLayouts)
app.set('layout', 'layouts/main')

// Huvudroutes
app.use(routes)

// 404-hantering
app.use((req, res) => {
  res.status(404).render('errors/404', {
    title: 'Sidan hittades inte',
    layout: 'layouts/error'
  })
})

// Global felhantering
app.use((err, req, res, next) => {
  console.error('Serverfel:', err)
  res.status(err.status || 500).render('errors/error', {
    title: 'Ett fel inträffade',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ett oväntat fel inträffade',
    layout: 'layouts/error'
  })
})

const startServer = async () => {
  try {
    await connectDatabase()

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server igång på port ${PORT}`)
      console.log(`Miljö: ${process.env.NODE_ENV || 'development'}`)
      console.log(`Base URL: ${baseURL}`)
      console.log(`Server listening on: http://localhost:${PORT}`)
    })

    // Lägg till felhantering för servern
    server.on('error', (error) => {
      console.error('Serverstart misslyckades:', error)
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} är upptagen`)
      }
      process.exit(1)
    })
  } catch (error) {
    console.error('Kunde inte starta servern:', error)
    process.exit(1)
  }
}

startServer()