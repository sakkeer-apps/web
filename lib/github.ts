// lib/github.ts - Safe server-side GitHub repository metadata fetcher

import { GitHubRepoData } from '@/types'

export interface FetchGitHubResult {
  success: boolean
  error?: string
  data?: GitHubRepoData
}

export function parseGitHubRepoUrl(inputUrl: string): { owner: string; repo: string } | null {
  if (!inputUrl || typeof inputUrl !== 'string') return null

  const trimmed = inputUrl.trim()
  const regex = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+?)(?:\.git|\/.*)?$/i
  const match = trimmed.match(regex)
  if (!match) return null

  const owner = match[1]
  const repo = match[2]

  // Prevent invalid names or path traversals
  if (!owner || !repo || owner === '.' || repo === '.') return null
  return { owner, repo }
}

export async function fetchGitHubRepositoryDetails(repoUrl: string): Promise<FetchGitHubResult> {
  const parsed = parseGitHubRepoUrl(repoUrl)
  if (!parsed) {
    return {
      success: false,
      error: 'Invalid GitHub URL. Please provide a URL in the format https://github.com/owner/repository.',
    }
  }

  const { owner, repo } = parsed
  const repoApiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`

  try {
    const res = await fetch(repoApiUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Muhammed-Sakkeer-Portfolio-CMS/1.0',
      },
      next: { revalidate: 300 }, // Cache up to 5 mins
      signal: AbortSignal.timeout(8000),
    })

    if (res.status === 404) {
      return {
        success: false,
        error: `Repository "${owner}/${repo}" was not found or is private. For private repositories, please configure details manually.`,
      }
    }

    if (res.status === 403 || res.status === 429) {
      const remaining = res.headers.get('x-ratelimit-remaining')
      if (remaining === '0') {
        return {
          success: false,
          error: 'GitHub API rate limit reached for anonymous requests. You can still enter repository details manually.',
        }
      }
      return {
        success: false,
        error: 'GitHub API request was restricted. You can enter repository details manually below.',
      }
    }

    if (!res.ok) {
      return {
        success: false,
        error: `GitHub returned status ${res.status}. You can enter repository details manually below.`,
      }
    }

    const item = await res.json()

    const repoData: GitHubRepoData = {
      name: typeof item.name === 'string' ? item.name : repo,
      full_name: typeof item.full_name === 'string' ? item.full_name : `${owner}/${repo}`,
      description: typeof item.description === 'string' ? item.description : '',
      html_url: typeof item.html_url === 'string' ? item.html_url : `https://github.com/${owner}/${repo}`,
      homepage: typeof item.homepage === 'string' ? item.homepage : '',
      stargazers_count: typeof item.stargazers_count === 'number' ? item.stargazers_count : 0,
      forks_count: typeof item.forks_count === 'number' ? item.forks_count : 0,
      language: typeof item.language === 'string' ? item.language : '',
      topics: Array.isArray(item.topics) ? item.topics.map((t: unknown) => String(t)) : [],
      license: item.license && typeof item.license === 'object' && 'spdx_id' in item.license
        ? String(item.license.spdx_id)
        : (item.license && typeof item.license === 'object' && 'name' in item.license ? String(item.license.name) : ''),
      updated_at: typeof item.updated_at === 'string' ? item.updated_at : undefined,
      default_branch: typeof item.default_branch === 'string' ? item.default_branch : 'main',
      open_issues_count: typeof item.open_issues_count === 'number' ? item.open_issues_count : 0,
      is_private: Boolean(item.private),
      fetched_at: new Date().toISOString(),
    }

    // Attempt to fetch latest release metadata if available (non-blocking)
    try {
      const releaseRes = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases/latest`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Muhammed-Sakkeer-Portfolio-CMS/1.0',
        },
        signal: AbortSignal.timeout(4000),
      })

      if (releaseRes.ok) {
        const relJson = await releaseRes.json()
        repoData.latest_release_tag = typeof relJson.tag_name === 'string' ? relJson.tag_name : ''
        repoData.latest_release_name = typeof relJson.name === 'string' ? relJson.name : ''
        repoData.latest_release_url = typeof relJson.html_url === 'string' ? relJson.html_url : ''
      }
    } catch {
      // Latest release is optional, ignore failure
    }

    return {
      success: true,
      data: repoData,
    }
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')
    return {
      success: false,
      error: isTimeout
        ? 'GitHub request timed out after 8 seconds. Please check your internet connection or enter details manually.'
        : `Network error connecting to GitHub: ${err instanceof Error ? err.message : 'Unknown error'}. You can enter details manually.`,
    }
  }
}
