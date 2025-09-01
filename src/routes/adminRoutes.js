import express from 'express'
import admin from '../config/firebaseAdmin.js'
import {
  getAdminNews,
  getEditNewsForm,
  createNews,
  updateNews,
  deleteNews
} from '../controllers/newsController.js'

const router = express.Router()

/**
 * Middleware för att kontrollera autentisering
 * Om användaren inte är autentiserad, omdirigera till inloggningssidan.
 * Om användaren är autentiserad, fortsätt till nästa middleware eller route.
 *
 * @function requireAuth
 * @param {object} req - Express begäran objekt
 * @param {object} res - Express svar objekt
 * @param {Function} next - Nästa middleware funktion
 * @returns {void}
 */
const requireAuth = async (req, res, next) => {
  const sessionCookie = req.cookies.session

  if (!sessionCookie) {
    return res.redirect('/admin/login')
  }

  try {
    // Verifiera sessions-cookie och hämta claims
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true)
    
    // ✅ Hämta fullständig användarinformation
    const userRecord = await admin.auth().getUser(decodedClaims.uid)
    
    // ✅ Skapa user-objekt
    const user = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || userRecord.email,
      authenticated: true
    }
    
    // ✅ Sätt user i session och req
    req.session.user = user
    req.user = user
    res.locals.user = user
    
    console.log('✅ User authenticated in requireAuth:', user.email)
    next()
  } catch (error) {
    console.log('❌ Autentiseringsfel:', error)
    
    // Rensa user-data vid fel
    req.session.user = null
    res.locals.user = null
    
    res.clearCookie('session')
    return res.redirect('/admin/login')
  }
}


// Login-sida (GET)
router.get('/login', async (req, res) => {
  const sessionCookie = req.cookies.session

  if (sessionCookie) {
    try {
      await admin.auth().verifySessionCookie(sessionCookie, true)
      return res.redirect(`${process.env.BASE_URL || '/'}admin/dashboard`)
    } catch (error) {
      res.clearCookie('session')
    }
  }

  res.render('admin/login', {
    title: 'Styrelse-inloggning',
    layout: 'layouts/admin',
    currentPage: '/admin/login'
  })
})

// Logout (GET)
router.get('/logout', (req, res) => {
  res.clearCookie('session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  })

  req.session.destroy(() => {
    res.redirect(`${process.env.BASE_URL || '/'}admin/login`)
  })
})

// Login-hantering (POST)
router.post('/login', async (req, res) => {
  console.log('Login route received body:', req.body)

  const { idToken, email } = req.body

  console.log('Login route details:', {
    idTokenReceived: !!idToken,
    emailReceived: email
  })

  if (!idToken) {
    console.error('Ingen token mottagen')
    return res.status(400).json({
      success: false,
      message: 'Ingen autentiseringstoken mottagen',
      details: {
        body: req.body,
        headers: req.headers
      }
    })
  }

  try {
    // Verifiera ID-token
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    console.log('Token verified:', {
      uid: decodedToken.uid,
      email: decodedToken.email
    })

    // Skapa sessions-cookie
    const expiresIn = 15 * 60 * 1000 // 15 min
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn })

    // Sätt sessions-cookie
    res.cookie('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    req.session.user = {
      email: decodedToken.email || email,
      uid: decodedToken.uid,
      authenticated: true
    }

    res.json({
      success: true,
      redirect: `${process.env.BASE_URL || ''}admin/dashboard`,
      user: {
        email: decodedToken.email || email
      }
    })
  } catch (error) {
    console.error('Detaljerat autentiseringsfel:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    })

    res.status(401).json({
      success: false,
      message: 'Autentiseringsfel',
      details: process.env.NODE_ENV === 'development'
        ? {
            errorMessage: error.message,
            errorCode: error.code
          }
        : null
    })
  }
})

// Dashboard (skyddad route)
router.get('/dashboard', requireAuth, (req, res) => {
  res.render('admin/dashboard', {
    title: 'Admin Dashboard',
    layout: 'layouts/admin',
    currentPage: '/admin/dashboard'
  })
})

// Nyhetsrouter
router.get('/nyheter', requireAuth, getAdminNews)

router.get('/nyheter/ny', requireAuth, (req, res) => {
  res.render('admin/news-form', {
    title: 'Skapa nyhet',
    layout: 'layouts/admin',
    news: null,
    currentPage: '/admin/nyheter'
  })
})

router.post('/nyheter/ny', requireAuth, createNews)

// Redigera nyhet - visa formulär
router.get('/nyheter/:id/redigera', requireAuth, getEditNewsForm)

// Uppdatera nyhet
router.post('/nyheter/:id/uppdatera', requireAuth, updateNews)

// Ta bort nyhet
router.post('/nyheter/:id/radera', requireAuth, deleteNews)

export default router
