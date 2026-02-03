import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format CNPJ with mask
export function formatCNPJ(cnpj: string): string {
  if (!cnpj) return ''
  const cleaned = cnpj.replace(/\D/g, '')
  if (cleaned.length !== 14) return cnpj
  return cleaned.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5'
  )
}

// Format CPF with mask
export function formatCPF(cpf: string): string {
  if (!cpf) return ''
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return cpf
  return cleaned.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    '$1.$2.$3-$4'
  )
}

// Format CNPJ or CPF automatically
export function formatCNPJCPF(value: string): string {
  if (!value) return ''
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length === 14) return formatCNPJ(cleaned)
  if (cleaned.length === 11) return formatCPF(cleaned)
  return value
}

// Format currency (BRL)
export function formatCurrency(value: number): string {
  if (value === undefined || value === null) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Format date (Brazilian format)
export function formatDate(date: string | Date): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Format date and time
export function formatDateTime(date: string | Date): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format chave de acesso with spaces
export function formatChaveAcesso(chave: string): string {
  if (!chave) return ''
  return chave.replace(/(\d{4})/g, '$1 ').trim()
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Parse XML content (basic)
export function parseXML(xmlString: string): Document | null {
  try {
    const parser = new DOMParser()
    return parser.parseFromString(xmlString, 'text/xml')
  } catch {
    return null
  }
}

// Download file
export function downloadFile(content: Blob | string, filename: string, mimeType?: string) {
  const blob = content instanceof Blob 
    ? content 
    : new Blob([content], { type: mimeType || 'application/octet-stream' })
  
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// Generate random color for tags
export function generateRandomColor(): string {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16',
    '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Validate CNPJ
export function isValidCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '')
  if (cleaned.length !== 14) return false
  
  // Check for repeated digits
  if (/^(\d)\1+$/.test(cleaned)) return false
  
  // Validate first digit
  let sum = 0
  let weight = 5
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i)) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  let digit = 11 - (sum % 11)
  if (digit > 9) digit = 0
  if (digit !== parseInt(cleaned.charAt(12))) return false
  
  // Validate second digit
  sum = 0
  weight = 6
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned.charAt(i)) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  digit = 11 - (sum % 11)
  if (digit > 9) digit = 0
  if (digit !== parseInt(cleaned.charAt(13))) return false
  
  return true
}

// Group array by key
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    result[groupKey] = result[groupKey] || []
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Calculate days difference
export function daysDifference(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay))
}

// Get status color
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'autorizada': 'bg-green-100 text-green-800',
    'cancelada': 'bg-red-100 text-red-800',
    'denegada': 'bg-orange-100 text-orange-800',
    'inutilizada': 'bg-gray-100 text-gray-800',
    'pendente': 'bg-yellow-100 text-yellow-800',
    'confirmada': 'bg-green-100 text-green-800',
    'ciencia': 'bg-blue-100 text-blue-800',
    'desconhecida': 'bg-purple-100 text-purple-800',
    'nao_realizada': 'bg-red-100 text-red-800',
    'desacordo': 'bg-orange-100 text-orange-800',
    'sucesso': 'bg-green-100 text-green-800',
    'erro': 'bg-red-100 text-red-800',
    'aviso': 'bg-yellow-100 text-yellow-800',
    'info': 'bg-blue-100 text-blue-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

// Get status label
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'autorizada': 'Autorizada',
    'cancelada': 'Cancelada',
    'denegada': 'Denegada',
    'inutilizada': 'Inutilizada',
    'pendente': 'Pendente',
    'confirmada': 'Confirmada',
    'ciencia': 'Ciência',
    'desconhecida': 'Desconhecida',
    'nao_realizada': 'Não Realizada',
    'desacordo': 'Desacordo',
    'NFe': 'NF-e',
    'CTe': 'CT-e',
    'NFCe': 'NFC-e',
    'NFSe': 'NFS-e',
    'MDFe': 'MDF-e'
  }
  return labels[status] || status
}

// Export to Excel
export function exportToExcel(data: unknown[], filename: string) {
  // This is a simplified version - in production, use a library like xlsx
  const headers = Object.keys(data[0] || {})
  const csvContent = [
    headers.join(';'),
    ...data.map(row => headers.map(h => {
      const value = (row as Record<string, unknown>)[h]
      return value !== null && value !== undefined ? String(value) : ''
    }).join(';'))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadFile(blob, `${filename}.csv`, 'text/csv')
}
