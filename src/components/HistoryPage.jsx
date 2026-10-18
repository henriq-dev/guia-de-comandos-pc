import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Inbox, Search, Trash2, Copy, Check, Send, Laptop, CalendarDays, SearchX, Download, Upload } from 'lucide-react'
import { MAX_HISTORY, buildBackup, parseBackup, mergeRecords, filterRecords, formatDateTime, formatDuration, statusLabel } from '../utils/history'
import { buildWhatsAppLink } from '../utils/report'
import { useCopy } from '../hooks/useCopy'
import { prefersReducedMotion } from '../hooks/useReducedMotion'
import { scrollRegionWithKeyboard } from '../utils/keyboardScroll'

// ÂNCORA: cor da etiqueta de cada situação (classes completas para o Tailwind enxergar)
const STATUS_STYLE = {
  resolvido: 'bg-jade/15 text-jade',
  parcial: 'bg-amber/15 text-amber',
  acompanhar: 'bg-neon/15 text-neon'
}

const actionBtn =
  'flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-sm text-muted transition hover:border-neon/50 hover:text-white'

// ÂNCORA: botões de backup. Exportar baixa um .json; importar lê o .json e junta com o histórico atual.
function BackupActions({ history, onImport }) {
  const fileRef = useRef(null)
  const [message, setMessage] = useState(null) // { type: 'ok' | 'erro', text }

  const exportBackup = () => {
    const blob = new Blob([buildBackup(history)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tecnico-henrique-historico-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    setMessage({ type: 'ok', text: `Backup com ${history.length} atendimento(s) baixado.` })
  }

  const importBackup = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = '' // permite escolher o mesmo arquivo de novo
    if (!file) return
    if (file.size > 2_000_000) return setMessage({ type: 'erro', text: 'Arquivo grande demais para ser um backup.' })
    const result = parseBackup(await file.text())
    if (!result.ok) return setMessage({ type: 'erro', text: result.error })
    const added = mergeRecords(history, result.records).filter((r) => !history.some((h) => h.id === r.id)).length
    onImport(result.records)
    setMessage({
      type: 'ok',
      text: added > 0 ? `${added} atendimento(s) importado(s).` : 'Nada novo: esses atendimentos já estão no histórico.'
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {history.length > 0 && (
        <button type="button" onClick={exportBackup} className={actionBtn}>
          <Download size={14} aria-hidden="true" />
          Exportar backup
        </button>
      )}
      <button type="button" onClick={() => fileRef.current?.click()} className={actionBtn}>
        <Upload size={14} aria-hidden="true" />
        Importar backup
      </button>
      <input ref={fileRef} id="importar-backup" type="file" accept="application/json,.json" onChange={importBackup} className="sr-only" tabIndex={-1} aria-label="Escolher arquivo de backup" />
      {message && (
        <p role="status" className={`w-full text-xs ${message.type === 'erro' ? 'text-red-400' : 'text-jade'}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}

function DataCareNotice() {
  return (
    <aside aria-label="Cuidados com dados e backups" className="w-full rounded-lg border border-amber/25 bg-amber/5 p-3 text-left text-xs leading-relaxed text-muted">
      <strong className="text-amber">Cuidados com dados e backup</strong>
      <ul className="mt-1 list-disc space-y-1 pl-5">
        <li>O histórico fica no armazenamento local deste perfil do navegador. O app não o criptografa nem sincroniza; quem acessar o perfil poderá ver os registros. Não use em perfil compartilhado.</li>
        <li>O backup é um arquivo JSON legível e contém nomes, equipamento, status e mensagens. O telefone digitado no formulário do relatório não é guardado no histórico. Importe apenas arquivos de origem confiável.</li>
        <li>Registre só o necessário; não inclua senhas, chaves de licença ou códigos de recuperação. Proteja o perfil/dispositivo, guarde backups em local privado e apague cópias quando não forem mais necessárias. O limite de 50 registros não define prazo de retenção.</li>
      </ul>
    </aside>
  )
}

export default function HistoryPage({ history, onDelete, onClear, onGoRoteiro, onImport }) {
  const [term, setTerm] = useState('')
  const [confirmId, setConfirmId] = useState(null) // qual card está pedindo confirmação de exclusão
  const [confirmClear, setConfirmClear] = useState(false)
  const { copiedId, failedId, copy } = useCopy()
  const root = useRef(null)
  const confirmButtonRef = useRef(null)
  const returnFocusRef = useRef(null)

  const visible = useMemo(() => filterRecords(history, term), [history, term])

  useEffect(() => {
    if (confirmClear || confirmId) confirmButtonRef.current?.focus()
    else if (returnFocusRef.current) {
      returnFocusRef.current.focus()
      returnFocusRef.current = null
    }
  }, [confirmClear, confirmId])

  const focusAfterHistoryChange = () => {
    requestAnimationFrame(() => {
      const target = document.getElementById('busca-historico') || document.querySelector('main section button')
      target?.focus()
    })
  }

  // Os cards entram em cascata só ao abrir a página (excluir um card não refaz a animação)
  useLayoutEffect(() => {
    if (prefersReducedMotion() || !root.current) return
    const ctx = gsap.context(() => {
      gsap.from('.history-card', {
        y: 22,
        opacity: 0,
        duration: 0.45,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'transform,opacity'
      })
    }, root)
    return () => ctx.revert()
  }, [])

  // ÂNCORA: tela vazia, com o caminho para criar o primeiro registro
  if (history.length === 0) {
    return (
      <section aria-label="Histórico de atendimentos" className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
        <Inbox size={40} className="text-muted" aria-hidden="true" />
        <h2 className="text-xl font-bold text-white">Nenhum atendimento salvo ainda</h2>
        <p className="text-sm leading-relaxed text-muted">
          Gere um relatório no Roteiro e clique em <strong className="text-white">Salvar no histórico</strong>. Ele aparece aqui, pronto para copiar ou reenviar.
        </p>
        <DataCareNotice />
        <button
          onClick={onGoRoteiro}
          className="rounded-md bg-jade px-4 py-2 text-sm font-bold text-black shadow-jade transition hover:brightness-110"
        >
          Ir para o Roteiro
        </button>
        <div className="mt-2 flex flex-col items-center gap-2 border-t border-white/10 pt-5">
          <p className="text-xs text-muted">Trocou de computador ou limpou o navegador? Traga seu backup de volta.</p>
          <BackupActions history={history} onImport={onImport} />
        </div>
      </section>
    )
  }

  return (
    <section ref={root} aria-label="Histórico de atendimentos" className="mx-auto max-w-3xl">
      <h2 className="sr-only">Atendimentos salvos</h2>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          <strong className="text-white">{history.length}</strong> {history.length === 1 ? 'atendimento salvo' : 'atendimentos salvos'} · até {MAX_HISTORY}, neste perfil do navegador.
        </p>

        {confirmClear ? (
          <div role="group" aria-label="Confirmar limpeza do histórico" className="flex items-center gap-2 text-sm">
            <span id="clear-history-description" className="text-amber">Apagar todo o histórico?</span>
            <button
              ref={confirmButtonRef}
              aria-describedby="clear-history-description"
              onClick={() => {
                returnFocusRef.current = null
                onClear()
                setConfirmClear(false)
                focusAfterHistoryChange()
              }}
              className="rounded-md bg-red-500/90 px-3 py-1.5 font-semibold text-white transition hover:bg-red-500"
            >
              Sim, apagar
            </button>
            <button onClick={() => setConfirmClear(false)} className={actionBtn}>Cancelar</button>
          </div>
        ) : (
          <button onClick={(e) => { returnFocusRef.current = e.currentTarget; setConfirmClear(true) }} className={actionBtn}>
            <Trash2 size={14} aria-hidden="true" />
            Limpar histórico
          </button>
        )}
      </div>

      <div className="mb-5">
        <BackupActions history={history} onImport={onImport} />
      </div>

      <div className="mb-5">
        <DataCareNotice />
      </div>

      <div className="relative mb-6">
        <label htmlFor="busca-historico" className="sr-only">Buscar no histórico</label>
        <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          id="busca-historico"
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar por cliente, equipamento ou tipo..."
          autoComplete="off"
          className="w-full rounded-lg border border-white/10 bg-ink-800 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-muted/70 focus:border-neon focus:shadow-neon"
        />
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center text-muted">
          <SearchX size={32} aria-hidden="true" />
          <p>Nenhum atendimento encontrado para essa busca.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((record) => (
            <article key={record.id} className="history-card glass rounded-xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="line-clamp-2 break-words text-lg font-bold text-white" title={record.client || undefined}>
                    {record.client || 'Cliente sem nome'}
                  </h3>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={13} aria-hidden="true" />
                      {formatDateTime(record.createdAt)}
                    </span>
                    {record.machine && (
                      <span className="flex min-w-0 items-center gap-1">
                        <Laptop size={13} aria-hidden="true" />
                        <span className="truncate">{record.machine}</span>
                      </span>
                    )}
                  </p>
                </div>
                {record.status && (
                  <span className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLE[record.status] ?? 'bg-white/10 text-slate-300'}`}>
                    {statusLabel(record.status)}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded bg-white/5 px-2 py-1 text-slate-300">{record.routeLabel}</span>
                <span className="text-muted">{record.done} de {record.total} procedimentos</span>
                {record.durationMs > 0 && <span className="text-muted">· {formatDuration(record.durationMs)}</span>}
              </div>

              <details className="mt-3">
                <summary className="w-fit cursor-pointer text-sm font-semibold text-neon hover:underline">Ver mensagem</summary>
                <pre role="region" aria-label={`Mensagem para ${record.client || 'cliente'}`} tabIndex={0} onKeyDown={scrollRegionWithKeyboard} className="mt-2 max-h-72 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black p-4 font-mono text-sm leading-relaxed text-jade">
                  {record.message}
                </pre>
              </details>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button onClick={() => copy(record.id, record.message)} className={actionBtn}>
                  {copiedId === record.id ? <Check size={14} className="text-jade" aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                  {copiedId === record.id ? 'Copiado!' : failedId === record.id ? 'Não copiou' : 'Copiar'}
                </button>
                <a
                  href={buildWhatsAppLink('', record.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={actionBtn}
                >
                  <Send size={14} aria-hidden="true" />
                  WhatsApp
                </a>

                {confirmId === record.id ? (
                  <span role="group" aria-label="Confirmar exclusão do atendimento" className="ml-auto flex items-center gap-2 text-sm">
                    <span id={`delete-record-description-${record.id}`} className="text-amber">Excluir este registro?</span>
                    <button
                      ref={confirmButtonRef}
                      aria-describedby={`delete-record-description-${record.id}`}
                      onClick={() => {
                        returnFocusRef.current = null
                        onDelete(record.id)
                        setConfirmId(null)
                        focusAfterHistoryChange()
                      }}
                      className="rounded-md bg-red-500/90 px-3 py-1.5 font-semibold text-white transition hover:bg-red-500"
                    >
                      Sim, excluir
                    </button>
                    <button onClick={() => setConfirmId(null)} className={actionBtn}>Cancelar</button>
                  </span>
                ) : (
                  <button onClick={(e) => { returnFocusRef.current = e.currentTarget; setConfirmId(record.id) }} className={`${actionBtn} ml-auto hover:border-red-400/60 hover:text-red-300`}>
                    <Trash2 size={14} aria-hidden="true" />
                    Excluir
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
