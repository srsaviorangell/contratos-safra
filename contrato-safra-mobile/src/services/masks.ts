export function maskDocument(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14)
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
      .slice(0, 14)
  }
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5")
    .slice(0, 18)
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) {
    return digits.length ? `(${digits}` : ""
  }
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)})-${digits.slice(2)}`
  }
  return `(${digits.slice(0, 2)})-${digits.slice(2, 7)}-${digits.slice(7)}`
}