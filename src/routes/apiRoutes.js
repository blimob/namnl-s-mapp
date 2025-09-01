import express from 'express'
import admin from '../config/firebaseAdmin.js'

const router = express.Router()

// Sessionshantering
router.post('/auth/session', async (req, res) => {
  const { idToken } = req.body

  console.log('Session route hit. Token received:', !!idToken)

  if (!idToken) {
    return res.status(400).json({
      success: false,
      message: 'Ingen autentiseringstoken mottagen'
    })
  }

  try {
    // Verifiera ID-token
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    console.log('Token verified for user:', decodedToken.email)

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

    res.json({
      success: true,
      redirect: 'admin/dashboard',
      user: {
        email: decodedToken.email
      }
    })
  } catch (error) {
    console.error('Autentiseringsfel:', error)

    res.status(401).json({
      success: false,
      message: 'Autentiseringsfel',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    })
  }
})

// Utloggningsrutt
router.get('/auth/logout', (req, res) => {
  console.log('Utloggning påbörjad för användare:', req.session.user?.email || 'okänd användare')

  // Rensa cookies
  res.clearCookie('session')

  // Förstör sessionen
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Fel vid utloggning:', err)
        return res.status(500).send('Ett fel uppstod vid utloggning')
      }

      // Logga ut lyckas - omdirigera till inloggningssidan med meddelande
      return res.redirect('/admin/login?logout=success')
    })
  } else {
    // Om ingen session finns, dirigera om ändå
    res.redirect('/admin/login?logout=success')
  }
})

export default router
