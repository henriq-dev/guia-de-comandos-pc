import { Check } from 'lucide-react'

// ÂNCORA: transforma `texto` entre crases em um botão-código que copia ao clicar (sem usar HTML perigoso).
// "prefix" identifica de qual item veio o trecho, para mostrar "copiado" só no botão clicado.
export default function InlineText({ text, copy, copiedId, prefix }) {
  return text.split('`').map((part, i) => {
    if (i % 2 === 0) return part
    const id = `${prefix}-${i}`
    const copied = copiedId === id
    return (
      <button
        key={i}
        type="button"
        onClick={() => copy(id, part)}
        title="Clique para copiar"
        aria-label={copied ? `Copiado: ${part}` : `Copiar: ${part}`}
        className={`inline-code align-baseline rounded px-1.5 py-0.5 text-left font-mono text-[13px] transition [overflow-wrap:anywhere] ${
          copied ? 'bg-jade/30 text-white' : 'bg-jade/10 text-jade hover:bg-jade/20'
        }`}
      >
        {part}
        {copied && <Check size={12} className="ml-1 inline" aria-hidden="true" />}
      </button>
    )
  })
}
