// Find element with IMDb
let imdbElements = document.querySelectorAll('a span[aria-hidden="true"]')
imdbElements = Array.from(imdbElements).filter(elm => elm.textContent.trim() === 'IMDb')

imdbElements.forEach(imdbElement => {
    // Find the closest <a> tag (which is the parent link element)
    const imdbLink = imdbElement.closest('a')

    let letterboxdElement = imdbLink.parentElement.querySelectorAll('a span[aria-hidden="true"]')
    letterboxdElement = Array.from(letterboxdElement).find(elm => elm.textContent.trim() === 'Letterboxd')
    if (!letterboxdElement) {

        // Extract the IMDb ID from the href attribute
        const imdbUrl = imdbLink.getAttribute('href')
        const imdbId = imdbUrl.split('title/').pop().replace('/','')
        const letterboxdUrl = `https://letterboxd.com/imdb/${imdbId}`

        // Remove Ratings heading
        let headingElement = document.querySelectorAll('span[role="heading"]')
        headingElement = Array.from(headingElement).find(elm => elm.textContent.trim() === 'Ratings')
        if (headingElement)
            headingElement.parentElement.style.display = "none"

        // Remove links if there are too many
        if (imdbLink.parentElement.childElementCount >= 5) {
            for (let i = imdbLink.parentElement.childElementCount - 1; i >= 3; i--)
                imdbLink.parentElement.children[i].remove()
        }

        // Add divider
        let dividerElement = imdbLink.parentElement.querySelector(':scope > div')
        if (dividerElement) {
            dividerElement = dividerElement.cloneNode(true)
            imdbLink.parentElement.appendChild(dividerElement)
        }

        // Construct the letterboxdLink
        const letterboxdLink = imdbLink.cloneNode(true)
        letterboxdLink.href = letterboxdUrl

        imdbLink.parentElement.appendChild(letterboxdLink)
        imdbLink.parentElement.style = "overflow-x:auto; overflow-y:hidden; justify-content:start;"

        const spans = letterboxdLink.querySelectorAll('span')
        const span1 = Array.from(spans).find(span => span.textContent.includes('/10'))
        span1.textContent = '/5'
        const span2 = Array.from(spans).find(span => span.textContent.trim() === 'IMDb')
        span2.textContent = 'Letterboxd'

        const img = letterboxdLink.querySelector('img')
        if (img)
            img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABxklEQVQ4jaWTvWtTYRTGf+fNtUGJcLV+cFsIiEiDt5SipVKKIB0SBAUpROgiDnGQDkLwD8gfIN1sFwcdxI9AF0ExQ8giSF20xEgVpSSkGbRwlQym5N7jYI25sYUGn+k9h/M8POd5OUIPUnPzrvrtTKAkgfh2u2qEgkSsey8f3X3fPS9/Hul0bsCTxgJwU1VNrzCAiATAkq1ONp/PbXUE0uncgEfjhaIzOxH/EUKKNs7FfD63ZQA8aSzslQyg6My2WyQ1N+8Gfnt1N9u7uhAJTMQas9RvZ1TVTB1c50ysTq1l89xL8OOQsDHZAmBoJcoBbx9BYgrso1D/hFkvG/XbGStQklePvOXG8ZWO+ik3yqXUIH5UAahN/+TKx1ts7h//PTB6Hl4/g3elpAHis4PlkD1n9jYjseFOPRIb5vr0UGgmGLsAEO9r751ggOry5mio2Vi+w1qz3qnXmnXuv9oIE1dLAFXLCIWn38ZP11r23xA/nOBcJRzid+8hJvGlO0SMSOG/vzHyufzm60l34hgw2afAYuHJ0gMDYKuTFaS4ZzJStNXJAkQAKpWSf9a9/LglzcMiMkHXkfXaFpFFG+da6Ji60e85/wJ5/LY0w2PuAAAAAABJRU5ErkJggg=="

        // Fetch the Letterboxd page and extract the rating
        fetch(letterboxdUrl)
            .then(response => response.text())
            .then(text => {
                // Use regex to find the ratingValue
                const ratingMatch = text.match(/"ratingValue"\s*:\s*(\d+(\.\d+)?)/)
                if (ratingMatch) {
                    const rating = parseFloat(ratingMatch[1])
                    span1.textContent = `${rating.toFixed(1)}/5`
                } else if (/IMDB ID not found/i.test(text)) {
                    letterboxdLink.remove()
                    if (dividerElement)
                        dividerElement.remove()
                    if (headingElement)
                        headingElement.parentElement.style.display = "block"
                } else {
                    console.error('Letterboxd rating not found.')
                }
            })
            .catch(error => {
                console.error('Error fetching Letterboxd page:', error)
            })

    }
})