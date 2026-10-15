import { launchBrowser, APP_URL, OUT, serveDir, DIST } from './_env.mjs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { buildBackup, parseBackup, mergeRecords, MAX_HISTORY } from '../../src/utils/history.js'
import { readFileSync } from 'node:fs'
let pass=0, fail=0; const ok=(c,m)=>{c?pass++:(fail++,console.log('FALHOU',m))}
const rec=(i,extra={})=>({id:'r'+i,createdAt:new Date(2026,9,1,10,i).toISOString(),client:'C'+i,machine:'M',status:'resolvido',routeLabel:'R',done:2,total:5,durationMs:60000,message:'msg '+i,...extra})
// ---- funções puras
const list=[rec(1),rec(2)]
const parsed=parseBackup(buildBackup(list)); ok(parsed.ok&&parsed.records.length===2,'ida e volta')
ok(JSON.stringify(parsed.records.map(r=>r.id))===JSON.stringify(['r1','r2']),'ids preservados')
ok(parseBackup('não é json').ok===false,'json inválido'); ok(parseBackup('{"a":1}').ok===false,'formato desconhecido')
ok(parseBackup(JSON.stringify({app:'outro',records:[rec(1)]})).ok===false,'app diferente rejeitado')
ok(parseBackup(JSON.stringify([rec(1)])).ok,'aceita lista pura')
const sujo=parseBackup(JSON.stringify([rec(1,{phone:'69999999999',extra:'x',client:'A'.repeat(500)}),{id:'x'},null,rec(3,{createdAt:'lixo'}),rec(4,{message:''})]))
ok(sujo.ok&&sujo.records.length===1&&sujo.ignored===4,'filtra inválidos: '+sujo.records?.length+'/'+sujo.ignored)
ok(!('phone' in sujo.records[0])&&!('extra' in sujo.records[0]),'campos extras e telefone removidos'); ok(sujo.records[0].client.length===120,'limita tamanho')
ok(parseBackup(JSON.stringify([{id:'x'}])).ok===false,'sem registros válidos')
const merged=mergeRecords([rec(1),rec(3)],[rec(2),rec(3)]); ok(merged.map(r=>r.id).join()==='r3,r2,r1','merge sem duplicar e em ordem: '+merged.map(r=>r.id))
const big=Array.from({length:60},(_,i)=>rec(i)); ok(mergeRecords([],big).length===MAX_HISTORY,'respeita limite')
// ---- navegador
const U=APP_URL
const b=await launchBrowser()
const ctx=await b.newContext({viewport:{width:1280,height:900},acceptDownloads:true}); await ctx.grantPermissions(['clipboard-read','clipboard-write'])
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message))
await p.goto(U)
await p.evaluate((l)=>localStorage.setItem('katana-history',JSON.stringify(l)),[rec(1),rec(2)]); await p.reload()
await p.locator('nav button').nth(2).click(); await p.waitForTimeout(600)
const [dl]=await Promise.all([p.waitForEvent('download'),p.getByRole('button',{name:'Exportar backup'}).click()])
ok(/^tecnico-henrique-historico-\d{4}-\d{2}-\d{2}\.json$/.test(dl.suggestedFilename()),'nome do arquivo '+dl.suggestedFilename())
const path=await dl.path(); const conteudo=readFileSync(path,'utf-8'); ok(parseBackup(conteudo).ok&&parseBackup(conteudo).records.length===2,'arquivo baixado é válido')
ok(/atendimento\(s\) baixado/.test(await p.locator('[role=status]').textContent()),'mensagem de exportação')
// importar o mesmo arquivo: nada novo
await p.locator('#importar-backup').setInputFiles({name:'b.json',mimeType:'application/json',buffer:Buffer.from(conteudo)}); await p.waitForTimeout(400)
ok(/Nada novo/.test(await p.locator('[role=status]').textContent()),'importar repetido = nada novo')
ok(await p.locator('.history-card').count()===2,'sem duplicar na tela')
// importar novos
await p.locator('#importar-backup').setInputFiles({name:'c.json',mimeType:'application/json',buffer:Buffer.from(buildBackup([rec(5),rec(6),rec(1)]))}); await p.waitForTimeout(400)
ok(/2 atendimento\(s\) importado/.test(await p.locator('[role=status]').textContent()),'importou 2 novos')
ok(await p.locator('.history-card').count()===4,'4 cards: '+await p.locator('.history-card').count())
ok(JSON.parse(await p.evaluate(()=>localStorage.getItem('katana-history'))).length===4,'salvo no navegador')
// arquivo inválido
await p.locator('#importar-backup').setInputFiles({name:'x.json',mimeType:'application/json',buffer:Buffer.from('lixo')}); await p.waitForTimeout(300)
ok(/inválido/.test(await p.locator('[role=status]').textContent()),'erro de arquivo inválido'); ok(await p.locator('.history-card').count()===4,'histórico intacto após erro')
// vazio: só importar
await p.getByRole('button',{name:'Limpar histórico'}).click(); await p.getByRole('button',{name:'Sim, apagar'}).click(); await p.waitForTimeout(400)
ok(await p.getByRole('button',{name:'Exportar backup'}).count()===0,'vazio: sem exportar'); ok(await p.getByRole('button',{name:'Importar backup'}).count()===1,'vazio: pode importar')
await p.locator('#importar-backup').setInputFiles({name:'c.json',mimeType:'application/json',buffer:Buffer.from(conteudo)}); await p.waitForTimeout(500)
ok(await p.locator('.history-card').count()===2,'restaurou a partir do vazio')
// ---- copiar comando no Roteiro
await p.locator('nav button').nth(1).click(); await p.waitForTimeout(700)
const cmd=p.locator('button.inline-code').filter({hasText:'sfc /scannow'}).first(); ok(await cmd.count()===1,'comando sfc é botão')
const chk0=await p.locator('input[type=checkbox]:checked').count()
await cmd.click(); await p.waitForTimeout(250)
ok((await p.evaluate(()=>navigator.clipboard.readText()))==='sfc /scannow','copiou o comando')
ok(/Copiado/.test(await cmd.getAttribute('aria-label')),'feedback copiado')
ok(await p.locator('input[type=checkbox]:checked').count()===chk0,'clicar no comando não marca o item')
await p.waitForTimeout(2200); ok(/Copiar:/.test(await cmd.getAttribute('aria-label')),'feedback some')
ok(await p.locator('.step-card code').count()===0,'sem <code> solto')
// mobile: botão-código não vira alvo gigante
const m=await (await b.newContext({viewport:{width:390,height:800},hasTouch:true,isMobile:true})).newPage()
await m.goto(U); await m.locator('nav button').nth(1).click(); await m.waitForTimeout(800)
const h=await m.locator('button.inline-code').filter({hasText:'sfc /scannow'}).first().boundingBox(); ok(h.height<40,'código inline não estica no toque: '+h.height)
ok(await m.evaluate(()=>document.documentElement.scrollWidth)<=390,'sem scroll lateral')
await m.screenshot({path:OUT+'/rot3-mobile.png'})
ok(errs.length===0,'sem erros: '+errs.join('|'))
await b.close(); console.log(`${pass} ok, ${fail} falhas`)
