import mongoose from 'mongoose'
/**
 * Ansluter till MongoDB-databasen.
 *
 * @returns {Promise<mongoose.Connection>} En Promise som löser sig med databaskopplingen.
 */
export const connectDatabase = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/brf-raastenen'

    console.log('🔍 Ansluter till MongoDB på:', mongoUrl)

    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority'
    })

    console.log('✅ Framgångsrik anslutning till MongoDB')

    return mongoose.connection
  } catch (error) {
    console.error('❌ Kunde inte ansluta till databasen:', {
      errorName: error.name,
      errorMessage: error.message
    })
    throw error
  }
}
