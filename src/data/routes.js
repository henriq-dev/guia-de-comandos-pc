import { Wrench, Gauge, Wifi, MonitorX } from 'lucide-react'
import { allSteps } from './steps.js'

// ÂNCORA: cada rota é uma lista de ids de etapas. Para criar um roteiro novo:
// 1) crie as etapas em steps.js  2) inclua uma rota aqui com os ids na ordem desejada.
// Uma mesma etapa pode aparecer em mais de uma rota (ex.: s1 em "completo" e em "lentidão").
export const routes = [
  {
    id: 'completo',
    label: 'Manutenção completa',
    description: 'Rotina geral: ponto de restauração, triagem, inicialização, limpeza, integridade e validação.',
    icon: Wrench,
    stepIds: ['p0', 's1', 's2', 's3', 's4', 's5']
  },
  {
    id: 'lentidao',
    label: 'Computador lento',
    description: 'Foco em hardware, programas na inicialização e limpeza de arquivos.',
    icon: Gauge,
    stepIds: ['p0', 's1', 's2', 's3', 's5']
  },
  {
    id: 'internet',
    label: 'Internet instável',
    description: 'Descobre se a falha é do PC ou da rede e renova a configuração.',
    icon: Wifi,
    stepIds: ['i1', 'i2', 'i3']
  },
  {
    id: 'tela-azul',
    label: 'Tela azul e travamentos',
    description: 'Coleta o código de erro e testa memória, disco, sistema e drivers.',
    icon: MonitorX,
    stepIds: ['p0', 'b1', 'b2', 'b3', 'b4', 'b5']
  }
]

const stepsById = Object.fromEntries(allSteps.map((step) => [step.id, step]))

// Devolve as etapas da rota, já na ordem certa
export function getRouteSteps(route) {
  return route.stepIds.map((id) => stepsById[id])
}
