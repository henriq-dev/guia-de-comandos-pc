// ÂNCORA: regras do histórico em funções puras (sem React), fáceis de testar no Node.
import { STATUS_OPTIONS } from './report.js'

export const MAX_HISTORY = 50 // guarda só os atendimentos mais recentes

// id único; o plano B cobre navegadores sem crypto.randomUUID
export function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

// Coloca o registro novo no topo e corta o que passar do limite
export function addRecord(list, record, { id = newId(), now = new Date() } = {}) {
  return [{ ...record, id, createdAt: now.toISOString() }, ...list].slice(0, MAX_HISTORY)
}

export const removeRecord = (list, id) => list.filter((record) => record.id !== id)

export function statusLabel(status) {
  return STATUS_OPTIONS.find((option) => option.id === status)?.label ?? ''
}

// Busca por cliente, equipamento, tipo de atendimento ou situação
export function filterRecords(list, term) {
  const text = term.trim().toLowerCase()
  if (!text) return list
  return list.filter((record) =>
    [record.client, record.machine, record.routeLabel, statusLabel(record.status)]
      .join(' ')
      .toLowerCase()
      .includes(text)
  )
}

// "14/10/2026 às 13:54" — devolve '' se a data estiver corrompida
export function formatDateTime(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const day = date.toLocaleDateString('pt-BR')
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${day} às ${time}`
}

// ÂNCORA: formata a duração do atendimento. 754000 ms -> "12 min"; 4500000 ms -> "1h 15min".
export function formatDuration(ms) {
  const minutes = Math.floor((Number(ms) || 0) / 60000)
  if (minutes < 1) return 'menos de 1 min'
  if (minutes < 60) return `${minutes} min`
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}min`
}

// Relógio "mm:ss" (ou "h:mm:ss") exibido no cronômetro ao vivo
export function formatClock(ms) {
  const total = Math.floor(Math.max(0, Number(ms) || 0) / 1000)
  const h = Math.floor(total / 3600)
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`
}

// ===== Backup do histórico (exportar / importar) =====
export const BACKUP_APP = 'katana-tech-hub'

// ÂNCORA: gera o texto do arquivo de backup (JSON). Telefone nunca existe no histórico, então não vai junto.
export function buildBackup(list, now = new Date()) {
  return JSON.stringify({ app: BACKUP_APP, version: 1, exportedAt: now.toISOString(), records: list }, null, 2)
}

const text = (value, max) => (typeof value === 'string' ? value.slice(0, max) : '')
const count = (value) => (Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0)

// Aceita só os campos conhecidos e com tamanho limitado: um arquivo editado à mão não entra "sujo" no histórico
function cleanRecord(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = text(raw.id, 80)
  const message = text(raw.message, 6000)
  const created = new Date(raw.createdAt)
  if (!id || !message || Number.isNaN(created.getTime())) return null
  return {
    id,
    createdAt: created.toISOString(),
    client: text(raw.client, 120),
    machine: text(raw.machine, 120),
    status: text(raw.status, 20),
    routeLabel: text(raw.routeLabel, 80),
    done: count(raw.done),
    total: count(raw.total),
    durationMs: count(raw.durationMs),
    message
  }
}

// Confere cada registro já salvo no navegador: um item corrompido (ex.: sem mensagem) é ignorado na tela, não quebra a lista.
export const cleanHistory = (list) => (Array.isArray(list) ? list.map(cleanRecord).filter(Boolean) : [])

// Lê o arquivo de backup. Devolve { ok: true, records } ou { ok: false, error } com mensagem para a pessoa.
export function parseBackup(content) {
  let data
  try {
    data = JSON.parse(content)
  } catch {
    return { ok: false, error: 'O arquivo não é um backup válido (JSON inválido).' }
  }
  const list = Array.isArray(data) ? data : data && data.app === BACKUP_APP ? data.records : null
  if (!Array.isArray(list)) return { ok: false, error: 'Este arquivo não parece ser um backup do Técnico Henrique.' }
  const records = list.map(cleanRecord).filter(Boolean)
  if (records.length === 0) return { ok: false, error: 'Nenhum atendimento válido encontrado no arquivo.' }
  return { ok: true, records, ignored: list.length - records.length }
}

// Junta o histórico atual com o importado: sem repetir ids, mais recentes primeiro, respeitando o limite
export function mergeRecords(current, incoming) {
  const seen = new Set(current.map((r) => r.id))
  const fresh = incoming.filter((r) => !seen.has(r.id))
  return [...current, ...fresh].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, MAX_HISTORY)
}
