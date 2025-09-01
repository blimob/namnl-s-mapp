import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Vänligen ange en giltig e-postadress']
  },
  role: {
    type: String,
    enum: ['admin', 'board_member'],
    default: 'board_member'
  },
  position: {
    type: String,
    enum: ['ordförande', 'kassör', 'ledamot', 'suppleant'],
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Före sparande: hasa lösenordet om det har ändrats
userSchema.pre('save', async function (next) {
  const user = this
  if (!user.isModified('password')) return next()

  try {
    const salt = await bcryppt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

/**
 * Jämför lösenord med det hashade lösenordet i databasen.
 *
 * @param {string} candidatePassword - Det lösenord som ska jämföras.
 * @returns {Promise<boolean>} - Returnerar true om lösenorden matchar, annars false.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', userSchema)

export default User
