import sanitizeHtml from 'sanitize-html'

export function sanitizeContentHtml(source: string) {
  return sanitizeHtml(source, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'iframe', 'section', 'aside', 'figure']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      div: ['class'], section: ['class'], ul: ['class'], aside: ['class'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      iframe: ['src', 'title', 'allow', 'allowfullscreen', 'width', 'height', 'loading'],
    },
    allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com'],
  })
}
