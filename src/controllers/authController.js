import admin from '../config/firebaseAdmin.js'
/**
 * Middleware för att verifiera Firebase-session-cookie.
 * Verifierar sessionen och hämtar användarinformation.
 * Om sessionen är giltig, fortsätter till nästa middleware.
 * Om sessionen inte är giltig, rensar cookie och omdirigerar till inloggning.
 *
 * @param {object} req - Express begäran objekt
 * @param {object} res - Express svar objekt
 * @returns {void}
 */
export const createSessionCookie = async (req, res) => {
  const { idToken } = req.body

  // Detaljerad loggning
  console.log('Mottagen ID-token:', idToken ? 'Finns' : 'Saknas')

  if (!idToken) {
    console.error('Ingen ID-token mottagen')
    return res.status(400).json({
      success: false,
      message: 'Ingen autentiseringstoken mottagen'
    })
  }

  try {
    // Verifiera ID-token
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    console.log('Dekodad token:', decodedToken)

    // Hämta användarinformation
    const userRecord = await admin.auth().getUser(decodedToken.uid)
    console.log('Användarinformation:', userRecord.toJSON())

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

    // Skapa lokal session (om du vill)
    req.session.user = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || userRecord.email
    }

    res.json({
      success: true,
      redirect: '/admin/dashboard',
      user: {
        uid: userRecord.uid,
        email: userRecord.email
      }
    })
  } catch (error) {
    // Detaljerad felloggning
    console.error('Autentiseringsfel:', error)

    res.status(401).json({
      success: false,
      message: error.message || 'Autentiseringsfel',
      details: process.env.NODE_ENV === 'development' ? error : {}
    })
  }
}

/**
 * Middleware för att verifiera sessions-cookie.
 * Kontrollerar om sessionen är giltig.
 * Om sessionen är giltig, fortsätter till nästa middleware.
 *
 * @param {object} req - Express begäran objekt
 * @param {object} res - Express svar objekt
 */
export const logout = (req, res) => {
  res.clearCookie('session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  })

  req.session.destroy((err) => {
    if (err) {
      console.error('Fel vid utloggning:', err)
    }

    res.redirect('./admin/login')
  })
}
