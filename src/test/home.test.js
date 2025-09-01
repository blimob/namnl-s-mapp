import request from 'supertest'
import app from '../test/__mocks__/service.js'

describe('CSRF Protection', () => {
  let csrfToken

  beforeAll(async () => {
    const tokenResponse = await request(app).get('/csrf-token')
    csrfToken = tokenResponse.body.csrfToken
  })

  test('should reject request without CSRF token', async () => {
    const response = await request(app)
      .post('/test-csrf')
      .send({ data: 'test' })

    expect(response.statusCode).toBe(403)
    expect(response.body).toHaveProperty('error', 'CSRF token saknas')
  })

  test('should accept request with valid CSRF token', async () => {
    const response = await request(app)
      .post('/test-csrf')
      .set('CSRF-Token', csrfToken)
      .send({ data: 'test' })

    expect(response.statusCode).toBe(200)
    expect(response.body.message).toBe('CSRF-skydd fungerar')
  })
})