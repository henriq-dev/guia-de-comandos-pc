import { launchBrowser, APP_URL, OUT, serveDir, DIST } from './_env.mjs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
let pass=0, fail=0; const ok=(c,m)=>{c?pass++:(fail++,console.log('FALHOU',m))}
const U=APP_URL
const b=await launchBrowser()
const p=await (await b.newContext({viewport:{width:1280,height:800}})).newPage()
await p.goto(U); await p.locator('nav button').nth(1).click(); await p.waitForTimeout(800)
const k=await p.locator('.step-card p').first().textContent()
ok(/~\d+ min/.test(k),'tempo na etapa: '+k)
ok(/~\d+ min no total/.test(await p.locator('text=no total').textContent()),'tempo total')
// total completo = 3+5+5+5+25+5 = 48
ok((await p.locator('text=no total').textContent()).includes('~48'),'total completo 48')
ok(await p.getByRole('button',{name:'Ver no Guia'}).count()>=5,'botões Ver no Guia')
// clicar em "Ver no Guia" do SFC
const sfc=p.locator('li',{hasText:'Verificação de Integridade'}).getByRole('button',{name:'Ver no Guia'})
await sfc.click(); await p.waitForTimeout(700)
ok(await p.locator('input[type=search], input').first().inputValue()==='sfc','busca preenchida com sfc')
const n=await p.locator('main article').count()
ok(n>=1 && n<14,'guia filtrado: '+n)
ok(await p.locator('main article').first().textContent().then(t=>/sfc/i.test(t)),'card do SFC aparece')
// alvos de toque
const m=await (await b.newContext({viewport:{width:390,height:800},hasTouch:true,isMobile:true})).newPage()
await m.goto(U); await m.locator('nav button').nth(1).click(); await m.waitForTimeout(800)
const hs=await m.evaluate(()=>[...document.querySelectorAll('nav button, .step-card label, main button:not(.inline-code)')].map(e=>e.getBoundingClientRect().height).filter(h=>h>0))
ok(Math.min(...hs)>=32,'menor alvo '+Math.min(...hs))
const lab=await m.evaluate(()=>Math.min(...[...document.querySelectorAll('.step-card label')].map(e=>e.getBoundingClientRect().height)))
ok(lab>=44,'linhas do checklist >=44px: '+lab)
const nav=await m.evaluate(()=>Math.min(...[...document.querySelectorAll('nav button')].map(e=>e.getBoundingClientRect().height)))
ok(nav>=44,'abas >=44px: '+nav)
ok(await m.evaluate(()=>document.documentElement.scrollWidth)<=390,'sem scroll lateral')
await m.screenshot({path:OUT+'/rot-mobile.png'})
await b.close(); console.log(`${pass} ok, ${fail} falhas`)
