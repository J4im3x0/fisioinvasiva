import 'dotenv/config'
import { businessAccessToken } from '../src/lib/google-business-reviews'

const { GOOGLE_BUSINESS_CLIENT_ID: clientId, GOOGLE_BUSINESS_CLIENT_SECRET: clientSecret, GOOGLE_BUSINESS_REFRESH_TOKEN: refreshToken } = process.env
if (!clientId || !clientSecret || !refreshToken) throw new Error('Configura GOOGLE_BUSINESS_CLIENT_ID, GOOGLE_BUSINESS_CLIENT_SECRET y GOOGLE_BUSINESS_REFRESH_TOKEN en .env')

const token = await businessAccessToken({ clientId, clientSecret, refreshToken })
const headers = { Authorization: `Bearer ${token}` }
const accounts: { name: string; accountName?: string }[] = []
let pageToken = ''
do {
  const url = new URL('https://mybusinessaccountmanagement.googleapis.com/v1/accounts')
  if (pageToken) url.searchParams.set('pageToken', pageToken)
  const response = await fetch(url, { headers, cache: 'no-store' })
  if (!response.ok) throw new Error(`Google Account Management: HTTP ${response.status}`)
  const page = await response.json() as { accounts?: typeof accounts; nextPageToken?: string }
  accounts.push(...(page.accounts || []))
  pageToken = page.nextPageToken || ''
} while (pageToken)

let found = 0
for (const account of accounts) {
  pageToken = ''
  do {
    const url = new URL(`https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`)
    url.searchParams.set('readMask', 'name,title')
    url.searchParams.set('pageSize', '100')
    if (pageToken) url.searchParams.set('pageToken', pageToken)
    const response = await fetch(url, { headers, cache: 'no-store' })
    if (!response.ok) throw new Error(`Google Business Information (${account.name}): HTTP ${response.status}`)
    const page = await response.json() as { locations?: { name: string; title?: string }[]; nextPageToken?: string }
    for (const location of page.locations || []) {
      console.log(`${location.title || 'Sin nombre'} — ${account.accountName || account.name}\nGOOGLE_BUSINESS_LOCATION=${account.name}/${location.name}\n`)
      found++
    }
    pageToken = page.nextPageToken || ''
  } while (pageToken)
}
if (!found) throw new Error('La cuenta autorizada no tiene ubicaciones accesibles')
