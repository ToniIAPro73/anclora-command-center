#!/usr/bin/env node
// Validación de contrato derivado para Command Center.
// Lee Vault/Knowledge; no mantiene un catálogo paralelo para la UI.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const workspace = process.env.ANCLORA_WORKSPACE || resolve(process.cwd(), '..')
const modelPath = resolve(workspace, 'anclora-infrastructure/knowledge/generated/knowledge-model.json')
const raw = JSON.parse(readFileSync(modelPath, 'utf8'))
const repositories = raw.entities?.repositories ?? []
const products = raw.entities?.products ?? []

const byId = (items, id) => items.find((item) => item.id === id)
const ccRepo = byId(repositories, 'repo:ToniIAPro73/anclora-command-center')
const ccProduct = byId(products, 'product:command-center')
const secureFlowIds = ['filestudio', 'purgedoc', 'tableextractor', 'clearsheet'].map((id) => `product:${id}`)
const secureFlowProducts = products.filter((product) => secureFlowIds.includes(product.id))

const failures = []
if (raw.metadata?.generated_at === '2026-08-16T20:15:00Z') failures.push('Knowledge mantiene la fecha de generación histórica')
if (ccRepo?.fields?.tier !== 'internal' || ccRepo?.status?.portfolio_status !== 'ACTIVE') failures.push('Command Center no está internal/ACTIVE')
if (ccProduct?.fields?.business_unit_id !== 'bu:internal' || ccProduct?.status?.product_status !== 'ACTIVE') failures.push('Producto Command Center no está internal/ACTIVE')
if (!String(ccRepo?.fields?.deployed_on ?? '').includes('aos-runtime')) failures.push('Command Center no declara runtime AOS/VPS')
if (String(ccRepo?.fields?.deployed_on ?? '').toLowerCase().includes('vercel')) failures.push('Command Center contiene hosting Vercel')
if (secureFlowProducts.length !== 4 || new Set(secureFlowProducts.map((product) => product.id)).size !== 4) failures.push('SecureFlow no contiene exactamente cuatro productos')
const cleanSheet = byId(products, 'product:clearsheet')
if (cleanSheet?.fields?.exposed_at !== 'https://cleansheet.anclora.com/') failures.push('CleanSheet no usa la URL canónica')

if (failures.length > 0) {
  console.error('[validate-canonical-sync] FAIL')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log('[validate-canonical-sync] PASS')
  console.log(JSON.stringify({
    knowledgeBuildId: raw.metadata?.rebuild_id ?? null,
    generatedAt: raw.metadata?.generated_at ?? null,
    secureFlowProducts: secureFlowProducts.map((product) => product.id),
    commandCenter: { tier: ccRepo.fields.tier, status: ccRepo.status.portfolio_status, runtime: ccRepo.fields.deployed_on },
    cleanSheetUrl: cleanSheet.fields.exposed_at,
  }, null, 2))
}
