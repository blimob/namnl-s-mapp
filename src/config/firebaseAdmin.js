import admin from 'firebase-admin'

console.log('🔥 Starting Firebase Admin initialization...')

let serviceAccount = null

// ✅ Prioritera separata miljövariabler
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  console.log('🔧 Using individual Firebase environment variables')
  
  serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`,
    universe_domain: "googleapis.com"
  }
  
  console.log('✅ Firebase config built from individual environment variables')
  console.log('📧 Client email:', serviceAccount.client_email)
  console.log('🔑 Private key length:', serviceAccount.private_key?.length || 0)
}

// Fallback till JSON (om det finns)
if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    console.log('✅ Firebase config loaded from JSON environment variable')
  } catch (error) {
    console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:', error.message)
  }
}

if (!serviceAccount) {
  console.error('❌ No Firebase configuration found! Check environment variables.')
  console.error('Required: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL')
  process.exit(1)
}

// Kontrollera viktiga fält
const requiredFields = ['project_id', 'private_key', 'client_email']
const missingFields = requiredFields.filter(field => !serviceAccount[field])

if (missingFields.length > 0) {
  console.error('❌ Missing Firebase fields:', missingFields)
  process.exit(1)
}

try {
  // Initiera Firebase Admin
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    })
    console.log('✅ Firebase Admin initialized successfully')
  } else {
    console.log('✅ Firebase Admin already initialized')
  }
  
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message)
  process.exit(1)
}

export default admin