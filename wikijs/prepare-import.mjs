import { mkdir, readFile, readdir, rm, stat, writeFile, copyFile } from 'node:fs/promises'
import path from 'node:path'

const repoRoot = process.cwd()
const docsDir = path.join(repoRoot, 'doc')
const outputDir = path.join(repoRoot, 'wikijs', 'generated-import')

const pageOrder = [
  'index.md',
  'what-is-handbook.md',
  'strategy.md',
  'code-of-conduct.md',
  'talent-acquisition.md',
  'on-boarding.md',
  'development-guide.md',
  'predefining-non-functional-requirements.md',
  'technical-glossary.md',
  'sheq-policy.md',
  'security-policy.md'
]

// Pages sourced from the repo root instead of doc/
const rootPages = [
  { source: 'README.md', output: 'readme.md' }
]

const navItems = [
  { label: 'Home', target: '/', targetType: 'home', icon: 'mdi-home' },
  { kind: 'header', label: 'About' },
  { label: 'What is Handbook?', target: '/what-is-handbook', targetType: 'page', icon: 'mdi-book-open-page-variant' },
  { label: 'Strategy', target: '/strategy', targetType: 'page', icon: 'mdi-chess-king' },
  { kind: 'header', label: 'People & Culture' },
  { label: 'Code of Conduct', target: '/code-of-conduct', targetType: 'page', icon: 'mdi-handshake' },
  { label: 'Talent Acquisition', target: '/talent-acquisition', targetType: 'page', icon: 'mdi-account-search' },
  { label: 'On-boarding', target: '/on-boarding', targetType: 'page', icon: 'mdi-rocket-launch' },
  { kind: 'header', label: 'Guideline' },
  { label: 'Development Guide', target: '/development-guide', targetType: 'page', icon: 'mdi-code-tags' },
  { label: 'Predefining Non-functional Requirements', target: '/predefining-non-functional-requirements', targetType: 'page', icon: 'mdi-clipboard-list-outline' },
  { label: 'Technical Glossary', target: '/technical-glossary', targetType: 'page', icon: 'mdi-book-alphabet' },
  { kind: 'header', label: 'Policies' },
  { label: 'SHEQ Policy', target: '/sheq-policy', targetType: 'page', icon: 'mdi-shield-check' },
  { label: 'Security Policy', target: '/security-policy', targetType: 'page', icon: 'mdi-lock' },
  { kind: 'header', label: 'Reference' },
  { label: 'README', target: '/readme', targetType: 'page', icon: 'mdi-file-document-outline' }
]

function slugToTitle(slug) {
  return slug
    .replace(/\.md$/, '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function extractFirstHeading(markdown) {
  const match = markdown.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : null
}

function stripFirstHeading(markdown) {
  return markdown.replace(/^#\s+.+\n+/, '')
}

function escapeYaml(value) {
  return JSON.stringify(value)
}

function buildHomePage() {
  return `---
title: "The OSBR Handbook"
description: "A guide to OSBR's culture, values, and workflows."
---

Welcome to the OSBR Handbook. Use the sidebar to navigate through our culture, values, and workflows.
`
}

function normalizeAdmonitions(markdown) {
  const lines = markdown.split('\n')
  const output = []
  let inAdmonition = false
  let title = ''

  for (const line of lines) {
    const startMatch = line.match(/^:::\s*([a-zA-Z]+)?\s*(.*)$/)
    if (!inAdmonition && startMatch) {
      inAdmonition = true
      const type = (startMatch[1] || 'note').toUpperCase()
      const label = startMatch[2]?.trim()
      title = label ? `${type}: ${label}` : type
      output.push(`> **${title}**`)
      continue
    }

    if (inAdmonition && line.trim() === ':::') {
      inAdmonition = false
      title = ''
      output.push('')
      continue
    }

    if (inAdmonition) {
      output.push(line.length > 0 ? `> ${line}` : '>')
      continue
    }

    output.push(line)
  }

  return output.join('\n')
}

function normalizeMarkdown(markdown, fileName) {
  if (fileName === 'index.md') {
    return buildHomePage()
  }

  const heading = extractFirstHeading(markdown) || slugToTitle(fileName)
  let content = stripFirstHeading(markdown)
  content = content.replace(/^\[\[TOC\]\]\s*$/gm, '')
  content = normalizeAdmonitions(content)
  content = content.replace(/^````+$/gm, '```')
  content = content.replace(/\n{3,}/g, '\n\n').trim()

  return `---\ntitle: ${escapeYaml(heading)}\n---\n\n${content}\n`
}

async function ensureCleanOutput() {
  await rm(outputDir, { recursive: true, force: true })
  await mkdir(outputDir, { recursive: true })
}

async function copyRecursive(sourceDir, targetDir) {
  await mkdir(targetDir, { recursive: true })
  const entries = await readdir(sourceDir, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name)
    const targetPath = path.join(targetDir, entry.name)

    if (entry.isDirectory()) {
      await copyRecursive(sourcePath, targetPath)
    } else if (entry.isFile()) {
      await copyFile(sourcePath, targetPath)
    }
  }
}

async function preparePages() {
  for (const fileName of pageOrder) {
    const sourcePath = path.join(docsDir, fileName)
    const raw = await readFile(sourcePath, 'utf8')
    const normalized = normalizeMarkdown(raw, fileName)

    if (fileName === 'index.md') {
      await writeFile(path.join(outputDir, 'home.md'), normalized)
      continue
    }

    await writeFile(path.join(outputDir, fileName), normalized)
  }
}

async function maybeCopyDir(relativePath) {
  const sourcePath = path.join(docsDir, relativePath)
  const exists = await stat(sourcePath).then(() => true).catch(() => false)
  if (exists) {
    await copyRecursive(sourcePath, path.join(outputDir, relativePath))
  }
}

async function writeNavigation() {
  await writeFile(
    path.join(outputDir, 'navigation.json'),
    JSON.stringify([
      {
        locale: 'en',
        items: navItems.map((item, index) => {
          const id = `handbook-nav-${index + 1}`
          if (item.kind === 'header') {
            return { id, kind: 'header', label: item.label }
          }
          return {
            id,
            ...item,
            visibilityMode: 'all',
            visibilityGroups: []
          }
        })
      }
    ], null, 2)
  )
}

async function prepareRootPages() {
  for (const { source, output } of rootPages) {
    const sourcePath = path.join(repoRoot, source)
    const raw = await readFile(sourcePath, 'utf8')
    const normalized = normalizeMarkdown(raw, output)
    await writeFile(path.join(outputDir, output), normalized)
  }
}

await ensureCleanOutput()
await preparePages()
await prepareRootPages()
await maybeCopyDir('static')
await maybeCopyDir('public')
await writeNavigation()

console.log(`Prepared Wiki.js import content at ${outputDir}`)