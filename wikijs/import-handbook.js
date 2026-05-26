const fs = require('fs')
const fsp = require('fs/promises')
const path = require('path')
const { nanoid } = require('nanoid')
const { DateTime } = require('luxon')

async function listFiles(rootDir, currentDir = rootDir) {
  const entries = await fsp.readdir(currentDir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await listFiles(rootDir, absolutePath))
    } else if (entry.isFile()) {
      files.push(path.relative(rootDir, absolutePath).replace(/\\/g, '/'))
    }
  }

  return files
}

async function bootstrapWiki() {
  process.chdir('/wiki')

  const pkg = require('/wiki/package.json')

  global.WIKI = {
    IS_DEBUG: false,
    IS_MASTER: true,
    ROOTPATH: '/wiki',
    INSTANCE_ID: nanoid(10),
    SERVERPATH: '/wiki/server',
    Error: require('/wiki/server/helpers/error'),
    configSvc: require('/wiki/server/core/config'),
    kernel: require('/wiki/server/core/kernel'),
    version: pkg.version,
    releaseDate: pkg.releaseDate,
    startedAt: DateTime.utc()
  }

  WIKI.configSvc.init()
  WIKI.logger = require('/wiki/server/core/logger').init('IMPORT')
  WIKI.models = require('/wiki/server/core/db').init()

  await WIKI.models.onReady
  await WIKI.configSvc.loadFromDb()
  await WIKI.configSvc.applyFlags()
  await WIKI.kernel.preBootMaster()

  WIKI.auth = require('/wiki/server/core/auth').init()
  WIKI.lang = require('/wiki/server/core/localization').init()
  WIKI.mail = require('/wiki/server/core/mail').init()
  WIKI.system = require('/wiki/server/core/system').init()

  await WIKI.kernel.postBootMaster()
}

async function run() {
  const importDir = process.argv[2]

  if (!importDir || !fs.existsSync(importDir)) {
    throw new Error(`Import directory not found: ${importDir || '(missing)'}`)
  }

  await bootstrapWiki()

  const diskImporter = require('/wiki/server/modules/storage/disk/common')
  const pageHelper = require('/wiki/server/helpers/page.js')
  const rootUser = await WIKI.models.users.getRootUser()
  const navigationConfig = JSON.parse(fs.readFileSync(path.join(importDir, 'navigation.json'), 'utf8'))
  const files = await listFiles(importDir)

  const indexPage = await WIKI.models.pages.query().findOne({
    localeCode: 'en',
    path: 'index'
  })
  if (indexPage) {
    await WIKI.models.pages.deletePage({
      id: indexPage.id,
      user: rootUser,
      skipStorage: true
    })
  }

  for (const relPath of files) {
    if (relPath === 'navigation.json') {
      continue
    }

    const absolutePath = path.join(importDir, relPath)
    const fileStats = await fsp.stat(absolutePath)
    const contentType = pageHelper.getContentType(relPath)

    if (contentType) {
      await diskImporter.processPage({
        user: rootUser,
        fullPath: importDir,
        relPath,
        contentType,
        moduleName: 'HANDBOOK'
      })
    } else {
      await diskImporter.processAsset({
        user: rootUser,
        relPath,
        file: {
          path: absolutePath,
          stats: fileStats
        },
        contentType,
        moduleName: 'HANDBOOK'
      })
    }
  }

  await WIKI.models.navigation.query().patchAndFetchById('site', {
    config: navigationConfig
  })

  await WIKI.models.navigation.getTree({ cache: false, locale: 'all', bypassAuth: true })
  await WIKI.models.pages.rebuildTree()

  WIKI.logger.info('(IMPORT) Handbook migration completed.')
  await WIKI.kernel.shutdown(true)
  if (WIKI.models?.knex) {
    await WIKI.models.knex.destroy()
  }
}

run().catch(async (error) => {
  console.error(error)
  if (global.WIKI?.models?.knex) {
    await global.WIKI.models.knex.destroy()
  }
  process.exit(1)
})