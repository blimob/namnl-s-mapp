import admin from '../config/firebaseAdmin.js'

/**
 * Middleware för att verifiera Firebase-session-cookie.
 * Om sessionen är giltig, spara användarinformation i req.user.
 * Om sessionen inte är giltig, rensa cookie och omdirigera till inloggning.
 *
 * @param {object} req - Express begäran objekt
 * @param {object} res - Express svar objekt
 * @param {Function} next - Nästa middleware funktion
 * @returns {void}
 */
export const verifyFirebaseToken = async (req, res, next) => {
  const sessionCookie = req.cookies.session || ''

  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true)
    const userRecord = await admin.auth().getUser(decodedClaims.uid)

    req.user = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || userRecord.email
    }

    next()
  } catch (error) {
    res.clearCookie('session', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })
    return res.redirect('/admin/login')
  }
}

/**
 * Middleware för att skapa en sessions-cookie.
 * Denna cookie används för att autentisera användaren under sessionen.
 * Om ID-token inte finns, returnera ett felmeddelande.
 *
 * @param {object} req - Express begäran objekt
 * @param {object} res - Express svar objekt
 * @param {Function} next - Nästa middleware funktion
 * @returns {void}
 */
export const createSessionCookie = async (req, res, next) => {
  const idToken = req.body.idToken

  if (!idToken) {
    return res.status(401).json({
      success: false,
      message: 'Ingen autentiseringstoken mottagen'
    })
  }

  try {
    const expiresIn = 15 * 60 * 1000 // 15 min
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn })

    res.cookie('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    res.json({
      success: true,
      redirect: '/admin/dashboard'
    })
  } catch (error) {
    console.error('Fel vid skapande av sessions-cookie:', error)
    res.status(401).json({
      success: false,
      message: 'Autentiseringsfel'
    })
  }
}

/**
 * Logout function to clear the session cookie and redirect to login page.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
export const logout = (req, res) => {
  res.clearCookie('session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  })

  if (req.session) {
    req.session.destroy((err) => {
      if (err) console.error('Fel vid session.destroy:', err)
      res.redirect('/admin/login')
    })
  } else {
    res.redirect('/admin/login')
  }
}
