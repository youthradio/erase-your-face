const utils = {
  makeSlug(s) {
    const from = 'ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;'
    const to = 'aaaaaeeeeeiiiiooooouuuunc------'

    const noaccents = Array.from(s)
      .map((c) => {
        const index = [...from].indexOf(c)
        if (index > -1) {
          return c.replace(
            new RegExp(from.charAt(index), 'g'),
            to.charAt(index)
          )
        }
        return c
      })
      .join('')

    return noaccents
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  }
}

module.exports = utils
