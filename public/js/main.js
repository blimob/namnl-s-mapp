document.addEventListener('DOMContentLoaded', function () {
  // Hamburgarmenyn (för mobila enheter)
  const hamburger = document.querySelector('.hamburger-menu')
  const navMenu = document.querySelector('.nav-links')

  // För mobila enheter behöver vi hantera klick på hamburgarmenyn
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function () {
      navMenu.classList.toggle('show')
    })

    // Hantera dropdown-menyer på mobil
    const dropdownLinks = document.querySelectorAll('.dropdown > a')
    dropdownLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        if (window.innerWidth <= 768) {
          e.preventDefault()
          this.parentElement.classList.toggle('show')

          // Stäng andra öppna dropdowns
          dropdownLinks.forEach(otherLink => {
            if (otherLink !== link && otherLink.parentElement.classList.contains('show')) {
              otherLink.parentElement.classList.remove('show')
            }
          })
        }
      })
    })

    // Stäng menyn när man klickar på en regular länk
    const regularLinks = document.querySelectorAll('.nav-links a:not(.dropdown > a)')
    regularLinks.forEach(link => {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
          navMenu.classList.remove('show')
        }
      })
    })

    // Stäng menyn när man klickar utanför
    document.addEventListener('click', function (event) {
      const isClickInside = hamburger.contains(event.target) || navMenu.contains(event.target)

      if (!isClickInside && navMenu.classList.contains('show')) {
        navMenu.classList.remove('show')
        // Stäng även alla öppna dropdowns
        document.querySelectorAll('.dropdown.show').forEach(dropdown => {
          dropdown.classList.remove('show')
        })
      }
    })
  }
})
