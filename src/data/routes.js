import { Wrench, Gauge, Wifi, MonitorX } from 'lucide-react'
import { allSteps } from './steps.js'

// ÂNCORA: cada rota é uma lista de ids de etapas. Para criar um roteiro novo:
// 1) crie as etapas em steps.js  2) inclua uma rota aqui com os ids na ordem desejada.
// Uma mesma etapa pode aparecer em mais de uma rota (ex.: s1 em "completo" e em "lentidão").
export const routes = [
  {
    id: 'completo',
    label: 'Manutenção completa',
    description: 'Triagem, inicialização, revisão de espaço, reparos quando indicados e validação.',
    timeNote: 'Soma nominal das etapas. DISM/SFC, limpeza e reinicialização podem acrescentar espera variável; não é prazo garantido.',
    icon: Wrench,
    stepIds: ['p0', 's1', 's2', 's3', 's4', 's5']
  },
  {
    id: 'lentidao',
    label: 'Computador lento',
    description: 'Foco em hardware, aplicativos de inicialização e liberação revisada de espaço.',
    timeNote: 'Soma nominal das etapas. Criação do ponto, limpeza e reinicialização variam; o tempo real pode ser maior.',
    icon: Gauge,
    stepIds: ['p0', 's1', 's2', 's3', 's5']
  },
  {
    id: 'internet',
    label: 'Internet instável',
    description: 'Delimita a falha, testa a rede e aplica ajustes condicionais no Windows.',
    timeNote: 'Soma nominal das etapas. Modem/roteador, DHCP, recuperação da conexão e eventual reinicialização têm espera variável.',
    icon: Wifi,
    stepIds: ['i1', 'i2', 'i3']
  },
  {
    id: 'tela-azul',
    label: 'Tela azul e travamentos',
    description: 'Investiga código, memória, disco, sistema e alterações recentes sem presumir a causa.',
    timeNote: 'Soma nominal, não prazo. Teste de memória, CHKDSK, DISM/SFC, atualizações e reinicializações podem estender o atendimento ou exigir acompanhamento posterior.',
    icon: MonitorX,
    stepIds: ['p0', 'b1', 'b2', 'b3', 'b4', 'b5']
  }
]

const stepsById = Object.fromEntries(allSteps.map((step) => [step.id, step]))

// Devolve as etapas da rota, já na ordem certa
export function getRouteSteps(route) {
  return route.stepIds.map((id) => stepsById[id])
}
