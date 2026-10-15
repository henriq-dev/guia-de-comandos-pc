// ÂNCORA: funções puras (sem React) que montam a mensagem e o link do WhatsApp.
// Por serem puras, dá para testar no Node só chamando a função com dados de exemplo.

export const STATUS_OPTIONS = [
  { id: 'resolvido', label: 'Resolvido' },
  { id: 'parcial', label: 'Parcialmente resolvido' },
  { id: 'acompanhar', label: 'Requer acompanhamento' }
]

// Frases curtas dos procedimentos marcados (item com report: null fica de fora)
export function getReportItems(steps, checked) {
  return steps
    .flatMap((step) => step.items)
    .filter((item) => item.report && checked.includes(item.id))
    .map((item) => item.report)
}

// Monta o texto com a formatação do WhatsApp: *negrito* e _itálico_
export function buildMessage({ client, machine, status, notes }, procedures, { date = new Date(), routeLabel = '' } = {}) {
  const lines = ['*Relatório de Atendimento — Técnico Henrique*', '']

  if (client.trim()) lines.push(`Cliente: ${client.trim()}`)
  if (machine.trim()) lines.push(`Equipamento: ${machine.trim()}`)
  if (routeLabel) lines.push(`Atendimento: ${routeLabel}`)
  lines.push(`Data: ${date.toLocaleDateString('pt-BR')}`, '')

  lines.push('*Procedimentos realizados:*')
  if (procedures.length) procedures.forEach((p) => lines.push(`✅ ${p}`))
  else lines.push('Nenhum procedimento marcado.')

  const statusLabel = STATUS_OPTIONS.find((s) => s.id === status)?.label
  if (statusLabel) lines.push('', `*Situação:* ${statusLabel}`)

  if (notes.trim()) lines.push('', '*Observações:*', notes.trim())

  lines.push('', 'Qualquer dúvida, é só me chamar. Obrigado pela confiança!')
  lines.push('_Técnico Henrique — Suporte Técnico Remoto_')
  return lines.join('\n')
}

// Deixa só dígitos. Sem "+", assume Brasil e põe o 55 na frente. Com "+", respeita o código do país
// informado (ex.: +351...) e NÃO converte para Brasil. Devolve '' se o número estiver incompleto.
export function normalizePhone(raw) {
  const international = raw.trim().startsWith('+')
  let digits = raw.replace(/\D/g, '')
  if (international) {
    if (digits.startsWith('55')) return /^55\d{10,11}$/.test(digits) ? digits : ''
    return /^[1-9]\d{7,14}$/.test(digits) ? digits : '' // padrão internacional: até 15 dígitos
  }
  digits = digits.replace(/^0+/, '') // tira o 0 de operadora
  if (digits.length === 10 || digits.length === 11) digits = '55' + digits // DDD + número
  return /^55\d{10,11}$/.test(digits) ? digits : ''
}

// Com telefone válido abre a conversa direto; sem ele, o WhatsApp deixa escolher o contato
export function buildWhatsAppLink(rawPhone, message) {
  const phone = normalizePhone(rawPhone)
  const text = encodeURIComponent(message)
  return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`
}
