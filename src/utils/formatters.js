export const money = (value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value)
export const productType = (type) => type === 'course' ? 'Curso' : 'Ebook'


export function shortDate(value) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function discountedPrice(price, discountPercent = 0) {
  const numericPrice = Number(price || 0)
  const numericDiscount = Number(discountPercent || 0)

  if (!numericDiscount || numericDiscount <= 0) return numericPrice

  return numericPrice - (numericPrice * numericDiscount) / 100
}