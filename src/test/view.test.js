import sanitizeHtml from 'sanitize-html'

describe('View XSS Protection', () => {
  test('should safely render user input in views', () => {
    const maliciousInput = '<script>alert("XSS")</script>Legitim text'
    
    const sanitizedContent = sanitizeHtml(maliciousInput, {
      allowedTags: [],
      allowedAttributes: {}
    })

    expect(sanitizedContent).toBe('Legitim text')
    expect(sanitizedContent).not.toContain('<script>')
  })
})