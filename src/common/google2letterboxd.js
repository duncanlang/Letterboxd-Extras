const letterboxdIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABxklEQVQ4jaWTvWtTYRTGf+fNtUGJcLV+cFsIiEiDt5SipVKKIB0SBAUpROgiDnGQDkLwD8gfIN1sFwcdxI9AF0ExQ8giSF20xEgVpSSkGbRwlQym5N7jYI25sYUGn+k9h/M8POd5OUIPUnPzrvrtTKAkgfh2u2qEgkSsey8f3X3fPS9/Hul0bsCTxgJwU1VNrzCAiATAkq1ONp/PbXUE0uncgEfjhaIzOxH/EUKKNs7FfD63ZQA8aSzslQyg6My2WyQ1N+8Gfnt1N9u7uhAJTMQas9RvZ1TVTB1c50ysTq1l89xL8OOQsDHZAmBoJcoBbx9BYgrso1D/hFkvG/XbGStQklePvOXG8ZWO+ik3yqXUIH5UAahN/+TKx1ts7h//PTB6Hl4/g3elpAHis4PlkD1n9jYjseFOPRIb5vr0UGgmGLsAEO9r751ggOry5mio2Vi+w1qz3qnXmnXuv9oIE1dLAFXLCIWn38ZP11r23xA/nOBcJRzid+8hJvGlO0SMSOG/vzHyufzm60l34hgw2afAYuHJ0gMDYKuTFaS4ZzJStNXJAkQAKpWSf9a9/LglzcMiMkHXkfXaFpFFG+da6Ji60e85/wJ5/LY0w2PuAAAAAABJRU5ErkJggg=='
const imdbTitlePattern = /https?:\/\/(?:[\w-]+\.)?imdb\.com\/title\/(tt\d+)\b/i
const mobileRatingsSelector = '[role="dialog"] :is([role="list"], ul), .ZTQ50'
const desktopRatingLabelSelector = 'a[href] span[aria-hidden="true"]'
const desktopLetterboxdSelector = 'a[data-letterboxd-desktop]'
const desktopRatings = new WeakMap()

google2letterboxd();

async function google2letterboxd(){
    const { options } = await browser.storage.sync.get('options')
    if (options?.google == null || options.google === false)
        return

    const scoreScale = options['convert-ratings'] === '10' ? 10 : 5
    const processedLinks = new WeakMap()
    const updateRatings = () => Promise.all([
        addMobileReviewLinks(scoreScale, processedLinks),
        addDesktopRatingLinks(scoreScale)
    ])
    watchRatings(updateRatings)
    await updateRatings()
}

function addDesktopRatingLinks(scoreScale) {
    const rows = new Map()
    for (const label of document.querySelectorAll(desktopRatingLabelSelector)) {
        if (!isIMDbLabel(label) || label.closest(mobileRatingsSelector))
            continue
        const link = label.closest('a')
        if (!rows.has(link.parentElement))
            rows.set(link.parentElement, link)
    }
    // The IMDb provider can itself be beyond the first two displayed links.
    for (const link of document.querySelectorAll(desktopLetterboxdSelector)) {
        const row = link.parentElement
        const state = desktopRatings.get(row)
        if (!rows.has(row) && state?.link === link &&
            state.removed.some(({element, placeholder}) => element === state.imdbLink && placeholder.parentNode === row))
            rows.set(row, state.imdbLink)
    }
    return Promise.all(Array.from(rows, ([row, link]) => updateDesktopRating(row, link, scoreScale)))
}

function findDesktopLetterboxdLink(row) {
    return Array.from(row.querySelectorAll(`:scope > ${desktopRatingLabelSelector}`))
        .find(label => label.textContent.trim() === 'Letterboxd')?.closest('a')
}

async function updateDesktopRating(row, imdbLink, scoreScale) {
    const href = imdbLink.href
    let previous = desktopRatings.get(row)
    if (previous && (previous.imdbLink !== imdbLink || previous.href !== href)) {
        previous.remove?.()
        desktopRatings.delete(row)
        previous = undefined
    }

    const existing = previous?.link?.parentElement === row ? previous.link : findDesktopLetterboxdLink(row)
    if (existing) {
        if (previous?.link !== existing) {
            previous?.remove?.()
            const state = {imdbLink, href, link: existing, removed: []}
            state.remove = () => restoreDesktopProviders(state)
            desktopRatings.set(row, state)
            previous = state
        }
        placeDesktopRating(row, previous)
        if (scoreScale === 10) {
            const rating = findScore(existing, 5)
            const value = parseFloat(rating?.textContent)
            if (Number.isFinite(value))
                rating.textContent = `${(value * 2).toFixed(1)}/10`
        }
        return
    }

    // Keep one lookup per row, including titles that Letterboxd could not match.
    if ((previous && !previous.link) || !findScore(imdbLink, 10))
        return
    previous?.remove?.()
    const current = {imdbLink, href, removed: []}
    desktopRatings.set(row, current)
    const imdbId = await resolveIMDbId(imdbLink)
    if (!imdbId || desktopRatings.get(row) !== current || !row.isConnected ||
        imdbLink.parentElement !== row || imdbLink.href !== href || findDesktopLetterboxdLink(row))
        return

    const link = cloneRating(imdbLink)
    const label = Array.from(link.querySelectorAll('span[aria-hidden="true"]')).find(isIMDbLabel)
    const rating = findScore(link, 10)
    if (!label || !rating) {
        desktopRatings.delete(row)
        return
    }
    link.href = `https://letterboxd.com/imdb/${imdbId}`
    label.textContent = 'Letterboxd'
    rating.textContent = `/${scoreScale}`
    setRatingIcon(link)

    const heading = Array.from(document.querySelectorAll('span[role="heading"]'))
        .find(element => element.textContent.trim() === 'Ratings')
    const headingDisplay = heading?.parentElement.style.display
    if (heading)
        heading.parentElement.style.display = 'none'

    current.link = link
    placeDesktopRating(row, current)
    current.remove = () => {
        link.remove()
        restoreDesktopProviders(current)
        if (heading)
            heading.parentElement.style.display = headingDisplay
    }
    row.style.overflowX = 'auto'
    row.style.overflowY = 'hidden'
    row.style.justifyContent = 'space-between'
    updateLetterboxdRating(link.href, scoreScale, score => {
        rating.textContent = `${score}/${scoreScale}`
    }, () => {
        if (desktopRatings.get(row) === current) {
            current.remove()
            current.link = null
        }
    })
}

function placeDesktopRating(row, state) {
    // Use the displayed provider order, including flex order and reversed rows.
    const link = state.link
    const reversed = getComputedStyle(row).flexDirection === 'row-reverse'
    const providers = Array.from(row.querySelectorAll(':scope > a[href]'))
        .filter(element => element !== link)
        .map(element => ({element, order: Number(getComputedStyle(element).order)}))
        .sort((first, second) => first.order - second.order)
    if (reversed)
        providers.reverse()
    const previous = providers[Math.min(1, providers.length - 1)]
    if (!previous)
        return

    link.setAttribute('data-letterboxd-desktop', '')
    link.style.order = previous.order

    const adjacent = reversed ? 'previousElementSibling' : 'nextElementSibling'
    const preceding = reversed ? 'nextElementSibling' : 'previousElementSibling'
    if (!state.divider) {
        const nativeDivider = [link[preceding], link[adjacent]].find(element => element?.matches('div'))
        if (nativeDivider) {
            state.divider = nativeDivider
        } else {
            const template = row.querySelector(':scope > div')
            if (template) {
                state.divider = cloneRating(template)
                state.ownsDivider = true
            }
        }
    }
    const separator = state.divider
    if (separator)
        separator.style.order = previous.order

    const positioned = separator
        ? previous.element[adjacent] === separator && separator[adjacent] === link
        : previous.element[adjacent] === link
    if (!positioned) {
        const elements = separator ? [separator, link] : [link]
        if (reversed)
            previous.element.before(...elements.reverse())
        else
            previous.element.after(...elements)
    }

    for (const {element} of providers.slice(2)) {
        const divider = element[preceding]
        if (divider !== separator && divider?.matches('div'))
            detachDesktopProvider(divider, state)
        detachDesktopProvider(element, state)
    }
}

function detachDesktopProvider(element, state) {
    // Retain the original position in case the Letterboxd link needs to be removed.
    const placeholder = document.createComment('')
    element.replaceWith(placeholder)
    state.removed.push({element, placeholder})
}

function restoreDesktopProviders(state) {
    state.link?.removeAttribute('data-letterboxd-desktop')
    if (state.ownsDivider)
        state.divider.remove()
    for (const {element, placeholder} of state.removed)
        placeholder.replaceWith(element)
    state.removed.length = 0
}

function watchRatings(update) {
    let scheduled = false
    const observer = new MutationObserver(records => {
        if (scheduled || !records.some(changedRatings))
            return
        scheduled = true
        requestAnimationFrame(() => {
            scheduled = false
            update()
        })
    })
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributeFilter: ['href', 'aria-hidden']
    })
}

function changedRatings({target, addedNodes}) {
    const element = target.nodeType === Node.ELEMENT_NODE ? target : target.parentElement
    if (!element)
        return false
    if (element.closest(mobileRatingsSelector))
        return true

    const link = element.closest('a[href]')
    if (link && Array.from(link.querySelectorAll('span[aria-hidden="true"]')).some(isIMDbLabel))
        return true
    if (element.querySelector(`:scope > ${desktopLetterboxdSelector}`) ||
        Array.from(element.querySelectorAll(`:scope > ${desktopRatingLabelSelector}`)).some(isIMDbLabel))
        return true

    return Array.from(addedNodes).some(node => node.nodeType === Node.ELEMENT_NODE &&
        (node.matches(mobileRatingsSelector) || node.querySelector(mobileRatingsSelector) ||
            Array.from(node.querySelectorAll(desktopRatingLabelSelector)).some(isIMDbLabel)))
}

function addMobileReviewLinks(scoreScale, processedLinks) {
    return Promise.all(Array.from(document.querySelectorAll(mobileRatingsSelector), async list => {
        if (list.querySelector('[data-letterboxd-review]'))
            return
        const inline = list.matches('.ZTQ50')
        const imdbRow = inline ? null : Array.from(list.children).find(item => findIMDbLabel(item))
        const imdbLink = inline
            ? Array.from(list.querySelectorAll('a[href]')).find(link => link.textContent.trim() === 'IMDb')
            : imdbRow?.querySelector('a[href]')
        if (!imdbLink)
            return

        const href = imdbLink.href
        if (processedLinks.get(imdbLink) === href)
            return
        processedLinks.set(imdbLink, href)
        const imdbId = await resolveIMDbId(imdbLink, list.closest('[role="dialog"]'))
        if (!imdbId || !imdbLink.isConnected || imdbLink.href !== href ||
            list.querySelector('[data-letterboxd-review]'))
            return

        const url = `https://letterboxd.com/imdb/${imdbId}`
        if (inline)
            appendInlineReview(imdbLink, url, scoreScale)
        else
            appendReviewRow(list, imdbRow, url, scoreScale)
    }))
}

function appendInlineReview(imdbLink, url, scoreScale) {
    // Firefox mobile can show the card's provider ratings as inline text.
    const provider = imdbLink.parentElement
    const entry = document.createElement('span')
    const link = cloneRating(imdbLink)
    const label = findIMDbLabel(link) ?? link
    const rating = document.createTextNode(` —/${scoreScale} · `)
    entry.dataset.letterboxdReview = ''
    link.href = url
    label.textContent = 'Letterboxd'
    entry.append(rating, link)
    provider.parentElement.append(entry)
    updateLetterboxdRating(url, scoreScale, score => {
        rating.textContent = ` ${score}/${scoreScale} · `
    }, () => entry.remove())
}

function appendReviewRow(list, imdbRow, url, scoreScale) {
    const row = cloneRating(imdbRow)
    const link = row.querySelector('a[href]')
    const label = findIMDbLabel(row)
    const rating = findScore(row, 10)
    if (!rating)
        return

    row.dataset.letterboxdReview = ''
    link.href = url
    link.setAttribute('aria-label', 'Visit Letterboxd')
    link.rel = 'noopener'
    const accessibleRating = label.parentElement.querySelector(':scope > span:not([aria-hidden])')
    const labelText = label.querySelector('bdi') ?? label
    const ratingText = rating.querySelector('bdi') ?? rating
    setRatingIcon(row)
    labelText.textContent = 'Letterboxd'
    ratingText.textContent = `—/${scoreScale}`
    if (accessibleRating)
        accessibleRating.textContent = 'Letterboxd'
    else {
        label.removeAttribute('aria-hidden')
        rating.removeAttribute('aria-hidden')
    }
    list.appendChild(row)
    updateLetterboxdRating(url, scoreScale, score => {
        ratingText.textContent = `${score}/${scoreScale}`
        if (accessibleRating)
            accessibleRating.textContent = `Letterboxd ${score} out of ${scoreScale}`
    }, () => row.remove())
}

function findIMDbLabel(element) {
    return Array.from(element.querySelectorAll('span')).find(isIMDbLabel)
}

function isIMDbLabel(element) {
    return element.textContent.trim() === 'IMDb'
}

function findScore(element, scale) {
    return Array.from(element.querySelectorAll('span')).reverse()
        .find(span => span.textContent.trim().endsWith(`/${scale}`))
}

function cloneRating(element) {
    // Keep Google's styling while stripping duplicate IDs, controllers and tracking.
    const copy = element.cloneNode(true)
    for (const node of [copy, ...copy.querySelectorAll('*')]) {
        for (const name of node.getAttributeNames()) {
            if (/^(?:data-|js)|^(?:id|ping)$/.test(name))
                node.removeAttribute(name)
        }
    }
    return copy
}

function setRatingIcon(element) {
    const img = element.querySelector('img')
    if (img) {
        img.removeAttribute('srcset')
        img.src = letterboxdIcon
    }
}

async function resolveIMDbId(link, dialog) {
    const url = new URL(link.href)
    const directId = url.href.match(imdbTitlePattern)?.[1]
    if (directId)
        return directId
    if (url.origin !== 'https://www.google.com' || !['/url', '/goto'].includes(url.pathname))
        return

    const destination = url.searchParams.get('url') ?? url.searchParams.get('q')
    const publishedId = destination?.match(imdbTitlePattern)?.[1] ?? findReviewsIMDbId(dialog)
    if (publishedId)
        return publishedId

    // Google's opaque Visit links use a GET redirect. The background already has IMDb access.
    try {
        const result = await browser.runtime.sendMessage({
            name: 'GETDATA',
            url: url.href,
            options: {credentials: 'omit'}
        })
        return result?.url?.match(imdbTitlePattern)?.[1]
    } catch (error) {
        console.error('Error resolving the Google IMDb link:', error)
    }
}

function findReviewsIMDbId(dialog) {
    // An opaque Google redirect may hide the ID in Visit links. The Reviews widget
    // also includes the original provider URLs in a comment within the info card.
    const section = dialog?.closest('section')
    for (let widget = dialog; section?.contains(widget); widget = widget.parentElement) {
        for (const node of widget.childNodes) {
            if (node.nodeType !== Node.COMMENT_NODE)
                continue
            const imdbId = node.nodeValue.match(imdbTitlePattern)?.[1]
            if (imdbId)
                return imdbId
        }
    }
}

async function updateLetterboxdRating(url, scoreScale, setRating, removeLink) {
    try {
        const response = await fetch(url)
        const text = await response.text()
        const ratingMatch = text.match(/"ratingValue"\s*:\s*(\d+(\.\d+)?)/)
        if (ratingMatch) {
            const score = Number(ratingMatch[1]) * (scoreScale / 5)
            setRating(score.toFixed(1))
        } else if (/IMDB ID not found/i.test(text)) {
            removeLink()
        } else {
            console.error('Letterboxd rating not found.')
        }
    } catch (error) {
        console.error('Error fetching Letterboxd page:', error)
    }
}
