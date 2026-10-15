// ÂNCORA: validadores de formato para dados lidos do localStorage.
// JSON válido não garante o tipo certo (uma extensão ou versão antiga pode ter gravado outra coisa).
// Se o formato estiver errado, só aquela chave volta ao padrão; as outras ficam intactas.
export const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
export const isStringArray = (v) => Array.isArray(v) && v.every((item) => typeof item === 'string')
export const isStringRecord = (v) => isPlainObject(v) && Object.values(v).every((item) => typeof item === 'string')
export const isString = (v) => typeof v === 'string'
