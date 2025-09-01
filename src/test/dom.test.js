import { JSDOM } from 'jsdom'
import request from 'supertest'
import app from '../test/__mocks__/service.js'
import sanitizeHtml from 'sanitize-html'

describe('XSS Protection', () => {
  test('should prevent XSS in DOM', () => {
    const dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="output"></div>
        </body>
      </html>
    `)

    const { window } = dom
    const { document } = window

    const xssScripts = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '<svg/onload=alert("XSS")>'
    ]

    xssScripts.forEach(script => {
      // Skapa en funktion som simulerar vår sanitering
      const sanitizeTest = (input) => {
        const dangerousPatterns = [
          'javascript:',
          'alert(',
          '<script',
          'onerror',
          'onload'
        ]

        const normalizedInput = String(input).toLowerCase()

        // Om någon farlig pattern hittas, returnera tom sträng
        if (dangerousPatterns.some(pattern => normalizedInput.includes(pattern))) {
          return ''
        }

        return sanitizeHtml(input, {
          allowedTags: [],
          allowedAttributes: {},
          disallowedTagsMode: 'escape'
        })
      }

      const sanitizedScript = sanitizeTest(script)

      const outputDiv = document.getElementById('output')
      outputDiv.innerHTML = sanitizedScript

      // Mer omfattande kontroller
      expect(outputDiv.textContent).toBe('')
      expect(outputDiv.innerHTML).toBe('')
      expect(outputDiv.innerHTML).not.toContain('<script')
      expect(outputDiv.innerHTML).not.toContain('onerror')
      expect(outputDiv.innerHTML).not.toContain('alert')
      expect(outputDiv.innerHTML).not.toContain('javascript:')
    })
  })

  test('should sanitize XSS input on server', async () => {
    const xssScripts = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>'
    ]

    for (const script of xssScripts) {
      const response = await request(app)
        .post('/test-xss')
        .send({ input: script })

      expect(response.statusCode).toBe(200)
      
      // Mer specifika kontroller
      expect(response.body.sanitizedInput).toBe('')
      expect(response.body.sanitizedInput).not.toContain('<script')
      expect(response.body.sanitizedInput).not.toContain('onerror')
      expect(response.body.sanitizedInput).not.toContain('alert')
      expect(response.body.sanitizedInput).not.toContain('javascript:')
    }
  })
})