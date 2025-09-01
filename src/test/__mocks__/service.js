import express from 'express'
import sanitizeHtml from 'sanitize-html'

const app = express()

// Mycket strikt XSS-sanitering
const sanitizeInput = (input) => {
  // Om input innehåller något potentiellt skadligt, returnera tom sträng
  const dangerousPatterns = [
    'javascript:',
    'alert(',
    '<script',
    'onerror',
    'onload'
  ]

  // Konvertera till sträng och toLowerCase för att fånga alla varianter
  const normalizedInput = String(input).toLowerCase()

  // Om någon farlig pattern hittas, returnera tom sträng
  if (dangerousPatterns.some(pattern => normalizedInput.includes(pattern))) {
    return ''
  }

  // Annars använd sanitizeHtml
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'escape'
  })
}

// Simulera CSRF-skydd
const mockCsrfProtection = (req, res, next) => {
  const csrfToken = req.headers['csrf-token']
  
  if (!csrfToken) {
    return res.status(403).json({ error: 'CSRF token saknas' })
  }
  
  next()
}

app.use(express.json())

// CSRF-token route
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: 'mock-csrf-token' })
})

// XSS-sanitering route
app.post('/test-xss', (req, res) => {
  const userInput = sanitizeInput(req.body.input)
  
  res.json({ 
    sanitizedInput: userInput 
  })
})

// CSRF-skyddad route
app.post('/test-csrf', mockCsrfProtection, (req, res) => {
  res.json({ 
    message: 'CSRF-skydd fungerar',
    data: req.body 
  })
})

export default app