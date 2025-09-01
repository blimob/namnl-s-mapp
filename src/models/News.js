import mongoose from 'mongoose'

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Titel är obligatorisk'],
    trim: true,
    minlength: [3, 'Titel måste vara minst 3 tecken lång']
  },
  content: {
    type: String,
    required: [true, 'Innehåll är obligatoriskt'],
    trim: true,
    minlength: [4, 'Innehållet måste vara minst 4 tecken']
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  visibleUntil: {
    type: Date,
    /**
     * Datumet då nyheten inte längre är synlig.
     *
     * @returns {Date} Datumet då nyheten inte längre är synlig.
     */
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dagar fram
  },
  isPermanent: {
    type: Boolean,
    default: false
  },
  author: {
    type: String,
    default: 'Styrelsen'
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Lägger till createdAt och updatedAt
})

export const NewsModel = mongoose.model('News', newsSchema)
