import fs from 'fs'
import path from 'path'
import os from 'os'

interface Credentials {
  claudeAiOauth?: {
    accessToken?: string
    expiresAt?: string
  }
}

function findCredentialsPath(): string | null {
  const home = os.homedir()
  const possiblePaths = [
    path.join(home, '.claude', '.credentials.json'),
    path.join(home, '.config', 'claude', '.credentials.json')
  ]

  for (const credPath of possiblePaths) {
    if (fs.existsSync(credPath)) return credPath
  }

  if (process.platform === 'win32') {
    const wslBases = ['\\\\wsl.localhost\\Ubuntu', '\\\\wsl$\\Ubuntu']
    for (const wslBase of wslBases) {
      try {
        const homePath = path.join(wslBase, 'home')
        if (fs.existsSync(homePath)) {
          for (const user of fs.readdirSync(homePath)) {
            const credPath = path.join(homePath, user, '.claude', '.credentials.json')
            if (fs.existsSync(credPath)) return credPath
          }
        }
      } catch (error) {
        console.error('CredentialsService: WSL access error:', (error as Error).message)
      }
    }
  }

  return null
}

function readCredentials(): Credentials | null {
  const credPath = findCredentialsPath()
  if (!credPath) return null

  try {
    return JSON.parse(fs.readFileSync(credPath, 'utf-8'))
  } catch (error) {
    console.error('CredentialsService: Failed to read:', (error as Error).message)
    return null
  }
}

export function getAccessToken(): string | null {
  const credentials = readCredentials()
  if (!credentials?.claudeAiOauth) return null

  const { accessToken, expiresAt } = credentials.claudeAiOauth

  if (expiresAt && new Date(expiresAt) <= new Date()) {
    throw new Error('Token expired')
  }

  return accessToken || null
}
