import express from 'express'
import { NewsModel } from '../models/News.js'

const router = express.Router()

/**
 * Hämtar publika nyheter från databasen.
 * Filtrerar nyheterna baserat på publiceringsstatus och datum.
 *
 * @returns {Promise<Array>} En lista med publika nyheter.
 * @throws {Error} Om det uppstår ett fel vid hämtning av nyheterna.
 */
const getPublicNews = async () => {
  try {
    const currentDate = new Date()

    // Filtrera publika nyheter
    const publicNews = await NewsModel.find({
      isPublished: true,
      publishDate: { $lte: currentDate },
      $or: [
        { isPermanent: true },
        { visibleUntil: { $gte: currentDate } }
      ]
    }).sort({ publishDate: -1 })

    return publicNews
  } catch (error) {
    console.error('Fel vid hämtning av nyheter:', error)
    return []
  }
}

// Startsida
router.get('/', async (req, res) => {
  // Hämta de senaste nyheterna
  const latestNews = await getPublicNews()
  const topThreeNews = latestNews.slice(0, 3)

  res.render('pages/home', {
    title: 'BRF Råstenen Mitt - Hem',
    description: 'Välkommen till BRF Råstenen Mitts officiella webbplats',
    currentPage: '/',
    latestNews: topThreeNews // Skicka med nyheterna till vyn
  })
})

// Nyhetssida
router.get('/nyheter', async (req, res) => {
  const publicNews = await getPublicNews()

  res.render('pages/nyheter', {
    title: 'Nyheter',
    description: 'Senaste nytt från BRF Råstenen Mitt',
    currentPage: '/nyheter',
    news: publicNews
  })
})

// Om föreningen
router.get('/om-oss', (req, res) => {
  res.render('pages/om-oss/index', {
    title: 'Om föreningen',
    description: 'Information om BRF Råstenen Mitt',
    currentPage: '/om-oss'
  })
})

// Undersidor för Om föreningen
router.get('/om-oss/:page', (req, res) => {
  const page = req.params.page
  const validPages = [
    'bostadsratt', 'styrelse', 'foreningsstamma',
    'avgift', 'skotsel', 'maklarinfo', 'trivselregler'
  ]

  if (validPages.includes(page)) {
    const titles = {
      bostadsratt: 'Att bo i bostadsrätt',
      styrelse: 'Styrelse',
      foreningsstamma: 'Föreningsstämma',
      avgift: 'Månadsavgift & avier',
      skotsel: 'Skötselanvisningar',
      maklarinfo: 'Mäklarinformation',
      trivselregler: 'Trivselregler'
    }

    res.render(`pages/om-oss/${page}`, {
      title: titles[page],
      description: `Information om ${titles[page].toLowerCase()}`,
      currentPage: `/om-oss/${page}`
    })
  } else {
    res.status(404).render('errors/404', {
      title: 'Sidan hittades inte',
      currentPage: '/404'
    })
  }
})

// Dokument
router.get('/dokument', (req, res) => {
  res.render('pages/dokument/index', {
    title: 'Dokument',
    description: 'Viktiga dokument för BRF Råstenen Mitt',
    currentPage: '/dokument'
  })
})

// Undersidor för Dokument
router.get('/dokument/:page', (req, res) => {
  const page = req.params.page
  const validPages = [
    'andrahand', 'brandskydd', 
    'forsakring', 'stadgar', 'arsredovisning', 'stammoprotokoll'
  ]

  if (validPages.includes(page)) {
    const titles = {
      andrahand: 'Andrahandsuthyrning',
      brandskydd: 'Brandskydd',
      forsakring: 'Försäkring',
      stadgar: 'Stadgar',
      arsredovisning: 'Årsredovisning',
      stammoprotokoll: 'Stämmoprotokoll'
    }

    res.render(`pages/dokument/${page}`, {
      title: titles[page],
      description: `Information om ${titles[page].toLowerCase()}`,
      currentPage: `/dokument/${page}`
    })
  } else {
    res.status(404).render('errors/404', {
      title: 'Sidan hittades inte',
      currentPage: '/404'
    })
  }
})

// Kontakt
router.get('/kontakt', (req, res) => {
  res.render('pages/kontakt', {
    title: 'Kontakt',
    description: 'Kontaktuppgifter till BRF Råstenen Mitt',
    currentPage: '/kontakt'
  })
})

export default router
