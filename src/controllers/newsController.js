import { NewsModel } from '../models/News.js'

/**
 * Controller för hantering av nyheter.
 */
class NewsController {
  static getAdminNews = async (req, res) => {
    try {
      const news = await NewsModel.find().sort({ createdAt: -1 })
      res.render('admin/news', {
        title: 'Hantera nyheter',
        layout: 'layouts/admin',
        news,
        currentPage: '/admin/nyheter'
      })
    } catch (error) {
      console.error('Fel vid hämtning av nyheter:', error)
      res.status(500).render('admin/news', {
        title: 'Hantera nyheter',
        layout: 'layouts/admin',
        news: [],
        error: 'Kunde inte hämta nyheter: ' + error.message
      })
    }
  }

  static createNews = async (req, res) => {
    console.log('📝 createNews körs')
    try {
      const { title, content, publishDate, visibleUntil, author, isPublished } = req.body
      const isPermanent = req.body.isPermanent === 'on'

      console.log('Skapa nyhet - mottagen data:', req.body)

      let endDate
      if (isPermanent) {
        const farFuture = new Date()
        farFuture.setFullYear(farFuture.getFullYear() + 100)
        endDate = farFuture
      } else {
        endDate = visibleUntil ? new Date(visibleUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }

      const newNews = new NewsModel({
        title,
        content,
        publishDate: new Date(publishDate),
        visibleUntil: endDate,
        isPermanent,
        author: author || (req.session.user ? req.session.user.email : 'Styrelsen'),
        isPublished: isPublished === 'on'
      })

      await newNews.save()
      res.send(`
        <html>
          <head>
            <script>
              console.log('Redirecting to: /admin/nyheter');
              window.location.replace('/admin/nyheter');
            </script>
          </head>
          <body>
            <p>Nyheten skapad! Omdirigerar...</p>
          </body>
        </html>
      `)
    } catch (error) {
      console.error('Fel vid skapande av nyhet:', error)
      req.session.flash = {
        type: 'danger',
        text: `Kunde inte skapa nyheten: ${error.message}`
      }
      res.redirect(`admin/nyheter/ny`)
    }
  }

  static getEditNewsForm = async (req, res) => {
    try {
      const news = await NewsModel.findById(req.params.id)

      if (!news) {
        req.session.flash = {
          type: 'danger',
          text: 'Nyheten hittades inte'
        }
        return res.redirect(`admin/nyheter`)
      }

      res.render('admin/news-form', {
        title: 'Redigera nyhet',
        layout: 'layouts/admin',
        news,
        currentPage: '/admin/nyheter'
      })
    } catch (error) {
      console.error('Fel vid hämtning av nyhet för redigering:', error)
      req.session.flash = {
        type: 'danger',
        text: 'Kunde inte hämta nyheten: ' + error.message
      }
      res.redirect(`admin/nyheter`)
    }
  }

  static updateNews = async (req, res) => {
    try {
      const { id } = req.params
      const { title, content, publishDate, visibleUntil, author, isPublished } = req.body
      const isPermanent = req.body.isPermanent === 'on'

      console.log('Uppdatera nyhet - mottagen data:', {
        id,
        ...req.body
      })

      const news = await NewsModel.findById(id)

      if (!news) {
        throw new Error('Nyheten hittades inte')
      }

      let endDate
      if (isPermanent) {
        const farFuture = new Date()
        farFuture.setFullYear(farFuture.getFullYear() + 100)
        endDate = farFuture
      } else {
        endDate = visibleUntil ? new Date(visibleUntil) : news.visibleUntil
      }

      news.title = title
      news.content = content
      news.publishDate = new Date(publishDate)
      news.visibleUntil = endDate
      news.isPermanent = isPermanent
      news.author = author || (req.session.user ? req.session.user.email : 'Styrelsen')
      news.isPublished = isPublished === 'on'

      await news.save()

      req.session.flash = {
        type: 'success',
        text: 'Nyheten har uppdaterats framgångsrikt!'
      }
          // ✅ JavaScript-redirect istället för res.redirect():
    res.send(`
      <html>
        <head>
          <script>
            console.log('Redirecting to: /admin/nyheter');
            window.location.replace('/admin/nyheter');
          </script>
        </head>
        <body>
          <p>Nyheten uppdaterad! Omdirigerar...</p>
        </body>
      </html>
    `)
    } catch (error) {
      console.error('Fel vid uppdatering av nyhet:', error)
      req.session.flash = {
        type: 'danger',
        text: `Kunde inte uppdatera nyheten: ${error.message}`
      }
      res.redirect(`admin/nyheter`)
    }
  }

  static deleteNews = async (req, res) => {
    try {
      const { id } = req.params
  
      console.log(`Försöker radera nyhet med ID: ${id}`)
  
      const result = await NewsModel.findByIdAndDelete(id)
  
      if (!result) {
        console.warn(`Ingen nyhet togs bort: ID ${id} hittades inte`)
        req.session.flash = {
          type: 'warning',
          text: 'Nyheten hittades inte'
        }
        
        // ✅ JavaScript-redirect istället för res.redirect():
        return res.send(`
          <html>
            <head>
              <script>
                console.log('Redirecting to: /admin/nyheter');
                window.location.replace('/admin/nyheter');
              </script>
            </head>
            <body>
              <p>Omdirigerar...</p>
            </body>
          </html>
        `)
      }
  
      console.log(`Nyhet med ID ${id} har tagits bort`)
  
      req.session.flash = {
        type: 'success',
        text: 'Nyheten har tagits bort framgångsrikt!'
      }
  
      // ✅ JavaScript-redirect istället för res.redirect():
      res.send(`
        <html>
          <head>
            <script>
              console.log('Redirecting to: /admin/nyheter');
              window.location.replace('/admin/nyheter');
            </script>
          </head>
          <body>
            <p>Nyheten raderad! Omdirigerar...</p>
          </body>
        </html>
      `)
      
    } catch (error) {
      console.error('Fel vid radering av nyhet:', error)
      req.session.flash = {
        type: 'danger',
        text: `Kunde inte ta bort nyheten: ${error.message}`
      }
      
      // ✅ JavaScript-redirect för error också:
      res.send(`
        <html>
          <head>
            <script>
              console.log('Redirecting to: /admin/nyheter');
              window.location.replace('/admin/nyheter');
            </script>
          </head>
          <body>
            <p>Fel inträffade. Omdirigerar...</p>
          </body>
        </html>
      `)
    }
  }
}

export const getAdminNews = NewsController.getAdminNews
export const getEditNewsForm = NewsController.getEditNewsForm
export const createNews = NewsController.createNews
export const updateNews = NewsController.updateNews
export const deleteNews = NewsController.deleteNews

export default NewsController
