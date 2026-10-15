import { launchBrowser, APP_URL, OUT, serveDir, DIST } from './_env.mjs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { formatDuration, formatClock } from '../../src/utils/history.js'
let pass=0, fail=0; const ok=(c,m)=>{c?pass++:(fail++,console.log('FALHOU',m))}
const U=APP_URL
// funções puras
ok(formatDuration(0)==='menos de 1 min' && formatDuration(59999)==='menos de 1 min','dur <1min')
ok(formatDuration(754000)==='12 min','dur 12min'); ok(formatDuration(4500000)==='1h 15min','dur 1h15')
ok(formatDuration(3600000)==='1h 00min','dur 1h00'); ok(formatDuration('x')==='menos de 1 min' && formatDuration(-5)==='menos de 1 min','dur inválida')
ok(formatClock(0)==='00:00' && formatClock(65000)==='01:05' && formatClock(3723000)==='1:02:03','clock')
const b=await launchBrowser()
const ctx=await b.newContext({viewport:{width:1280,height:900}}); await ctx.grantPermissions(['clipboard-read','clipboard-write'])
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message))
await p.goto(U); await p.locator('nav button').nth(1).click(); await p.waitForTimeout(800)
const clock=()=>p.locator('#cronometro').textContent()
ok(await clock()==='00:00','cronômetro zerado'); ok(await p.getByRole('button',{name:/Pausar|Retomar/}).count()===0,'sem botão antes de iniciar')
// auto-start no 1º check
await p.locator('input[type=checkbox]').nth(2).check(); await p.waitForTimeout(2300)
const c1=await clock(); ok(c1!=='00:00','cronômetro andou: '+c1)
ok(await p.getByRole('button',{name:'Pausar'}).count()===1,'botão Pausar')
await p.getByRole('button',{name:'Pausar'}).click(); const cp=await clock(); await p.waitForTimeout(1500)
ok(await clock()===cp,'pausado não anda'); ok(await p.getByRole('button',{name:'Retomar'}).count()===1,'botão Retomar')
// persiste ao recarregar (pausado)
await p.reload(); await p.waitForTimeout(800)
ok(await clock()===cp,'tempo persiste pausado: '+await clock())
await p.getByRole('button',{name:'Retomar'}).click(); await p.waitForTimeout(2100)
ok(await clock()!==cp,'retomou')
// anotações
const det=p.locator('details').first(); await det.locator('summary').click()
await det.locator('textarea').fill('HD com 92% de uso'); await p.waitForTimeout(200)
ok(await det.locator('summary span.bg-jade').count()===1,'indicador de anotação')
await p.reload(); await p.waitForTimeout(800)
await p.locator('details').first().locator('summary').click()
ok(await p.locator('details').first().locator('textarea').inputValue()==='HD com 92% de uso','anotação persiste')
// relatório: incluir anotações
await p.getByRole('button',{name:/Gerar relatório/}).click(); await p.waitForTimeout(500)
const inc=p.getByRole('button',{name:/Incluir anotações das etapas \(1\)/}); ok(await inc.count()===1,'botão incluir anotações')
const nota=p.locator('#rep-notes'); await nota.fill('Obs inicial'); await inc.click()
const v=await nota.inputValue(); ok(v.startsWith('Obs inicial\n• ')&&v.includes('HD com 92% de uso'),'notas anexadas: '+JSON.stringify(v))
ok(await inc.isDisabled(),'não duplica (desabilitado)')
ok((await p.locator('dialog pre').textContent()).includes('HD com 92% de uso'),'anotação na prévia')
// salvar -> histórico com duração
await p.getByRole('button',{name:'Salvar no histórico'}).click(); await p.waitForTimeout(300)
const raw=await p.evaluate(()=>JSON.parse(localStorage.getItem('katana-history'))[0])
ok(raw.durationMs>0,'durationMs salvo: '+raw.durationMs); ok(!('phone' in raw),'sem telefone')
await p.keyboard.press('Escape'); await p.locator('nav button').nth(2).click(); await p.waitForTimeout(700)
ok(/(menos de 1 min|\d+ min)/.test(await p.locator('.history-card').first().textContent()),'duração aparece no histórico')
// novo atendimento zera tudo
await p.locator('nav button').nth(1).click(); await p.waitForTimeout(700)
await p.getByRole('button',{name:/Novo atendimento/}).click(); await p.waitForTimeout(500)
ok(await clock()==='00:00','novo atendimento zera cronômetro')
ok(await p.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('katana-notes'))))==='{}','novo atendimento limpa anotações')
// dado corrompido
await p.evaluate(()=>{localStorage.setItem('katana-notes','[1,2]');localStorage.setItem('katana-timer','"x"')}); await p.reload(); await p.waitForTimeout(800)
ok(await clock()==='00:00' && (await p.locator('.step-card').count())>0,'dados corrompidos não quebram')
// mobile
const m=await (await b.newContext({viewport:{width:390,height:800},hasTouch:true,isMobile:true})).newPage()
await m.goto(U); await m.locator('nav button').nth(1).click(); await m.waitForTimeout(800)
await m.locator('input[type=checkbox]').nth(2).check(); await m.locator('details').first().locator('summary').click()
ok(await m.evaluate(()=>document.documentElement.scrollWidth)<=390,'sem scroll lateral mobile')
ok((await m.locator('details').first().locator('textarea').boundingBox()).height>=44,'textarea >=44px')
await m.screenshot({path:OUT+'/rot2-mobile.png'})
ok(errs.length===0,'sem erros: '+errs.join('|'))
await b.close(); console.log(`${pass} ok, ${fail} falhas`)
