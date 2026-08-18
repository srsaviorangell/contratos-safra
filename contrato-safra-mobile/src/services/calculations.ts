export function calculateTotalValue(quantity: number, unitPrice: number): number {
  return quantity * unitPrice
}

export function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR")
}
