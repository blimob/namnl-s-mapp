import express from 'express'
import publicRoutes from './publicRoutes.js'
import adminRoutes from './adminRoutes.js'
import apiRoutes from './apiRoutes.js'

const router = express.Router()

router.use((req, res, next) => {
  console.log(`Route requested: ${req.method} ${req.path}`)
  next()
})
// Använd de olika route-modulerna
router.use('/', publicRoutes)
router.use('/admin', adminRoutes)
router.use('/api', apiRoutes)

export default router
