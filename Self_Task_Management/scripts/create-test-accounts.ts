/**
 * Dev utility script to create as many test accounts as you want for convenient testing.
 * 
 * Usage:
 *   npx tsx scripts/create-test-accounts.ts --count 10
 *   npx tsx scripts/create-test-accounts.ts --count 5 --prefix mytest --password test123
 * 
 * Also supports:
 *   --list
 *   --delete-all
 * 
 * This bypasses email confirmation using the service role key.
 * Only for development/testing. Do not use in production.
 */

// We create our own admin client here (instead of importing from lib/supabase/server)
// so we can explicitly pass the 'ws' transport. This avoids init errors on Node 20
// and also means the regular app code never has to deal with ws for the admin client.
import { createClient as createJsClient } from '@supabase/supabase-js'
import ws from 'ws'

const supabaseAdmin = createJsClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: {
      transport: ws as any,
    },
  }
)

interface Args {
  count: number
  prefix: string
  password: string
  list: boolean
  deleteAll: boolean
  help: boolean
}

function parseArgs(): Args {
  const args = process.argv.slice(2)
  const result: Args = {
    count: 5,
    prefix: 'devtest',
    password: 'testpass123',
    list: false,
    deleteAll: false,
    help: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--count' || arg === '-c') {
      result.count = parseInt(args[++i], 10) || 5
    } else if (arg === '--prefix' || arg === '-p') {
      result.prefix = args[++i] || 'devtest'
    } else if (arg === '--password') {
      result.password = args[++i] || 'testpass123'
    } else if (arg === '--list' || arg === '-l') {
      result.list = true
    } else if (arg === '--delete-all' || arg === '-d') {
      result.deleteAll = true
    } else if (arg === '--help' || arg === '-h') {
      result.help = true
    }
  }
  return result
}

function printHelp() {
  console.log(`
Dev Test Account Creator

Options:
  --count, -c <n>     Number of accounts to create (default: 5)
  --prefix, -p <str>  Prefix for usernames/emails (default: devtest)
  --password <str>    Password for created accounts (default: testpass123)
  --list, -l          List existing test accounts (@dev.test)
  --delete-all, -d    Delete all test accounts (@dev.test)
  --help, -h          Show this help

Examples:
  npx tsx scripts/create-test-accounts.ts --count 20
  npx tsx scripts/create-test-accounts.ts -c 3 -p tester --password mypass
  npx tsx scripts/create-test-accounts.ts --list
  npx tsx scripts/create-test-accounts.ts --delete-all
`)
}

async function main() {
  const args = parseArgs()

  if (args.help) {
    printHelp()
    process.exit(0)
  }

  if (process.env.NODE_ENV !== 'development' && !process.env.FORCE_DEV_SCRIPT) {
    console.error('This script is intended for development use only.')
    console.error('Set FORCE_DEV_SCRIPT=1 to run anyway.')
    process.exit(1)
  }

  if (args.list) {
    console.log('Listing test accounts...')
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
    if (error) {
      console.error('Error listing users:', error)
      process.exit(1)
    }
    const testUsers = (data.users || []).filter(u => u.email?.endsWith('@dev.test'))
    if (testUsers.length === 0) {
      console.log('No test accounts found.')
    } else {
      console.log(`Found ${testUsers.length} test accounts:`)
      testUsers.forEach(u => {
        console.log(`  ${u.user_metadata?.username || '(no username)'} | ${u.email} | id: ${u.id}`)
      })
    }
    return
  }

  if (args.deleteAll) {
    console.log('Deleting all test accounts...')
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
    if (error) {
      console.error('Error listing for delete:', error)
      process.exit(1)
    }
    const testUsers = (data.users || []).filter(u => u.email?.endsWith('@dev.test'))
    let deleted = 0
    for (const u of testUsers) {
      const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(u.id)
      if (delErr) {
        console.error(`Failed to delete ${u.email}:`, delErr.message)
      } else {
        deleted++
        console.log(`Deleted ${u.email}`)
      }
    }
    console.log(`Done. Deleted ${deleted} accounts.`)
    return
  }

  // Create accounts
  console.log(`Creating ${args.count} test accounts with prefix "${args.prefix}"...`)
  console.log(`Password for all: ${args.password}`)
  console.log('')

  const results = []

  for (let i = 1; i <= args.count; i++) {
    const username = `${args.prefix}-${i}`
    const email = `${args.prefix}-${i}@dev.test`

    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: args.password,
        email_confirm: true,
        user_metadata: { username },
      })

      if (error) {
        console.error(`✗ ${username} / ${email}: ${error.message}`)
        results.push({ username, email, success: false, error: error.message })
      } else {
        console.log(`✓ ${username} / ${email}`)
        results.push({ username, email, success: true })
      }
    } catch (err: any) {
      const msg = err.message || 'Unknown error'
      console.error(`✗ ${username} / ${email}: ${msg}`)
      results.push({ username, email, success: false, error: msg })
    }
  }

  const successCount = results.filter(r => r.success).length
  console.log('')
  console.log(`Created ${successCount}/${args.count} accounts successfully.`)
  console.log('')
  console.log('You can now sign in with any of the above emails using the password above.')
  console.log('Example: ' + (results.find(r => r.success)?.email || `${args.prefix}-1@dev.test`))
}

main().catch(err => {
  console.error('Script failed:', err)
  process.exit(1)
})
