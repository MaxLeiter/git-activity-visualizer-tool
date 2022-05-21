import type { NextApiRequest, NextApiResponse } from 'next'

import fetchCommitsByUser from '../../lib/github'

export type Commits = Array<{
  repo: string
  commits: Array<string>
}>

type Data = {
  error?: string
  commits?: Commits
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { username } = req.query

  if (!username) {
    res.status(400).json({
      error: 'A username or URL is required',
    })

    return
  }
  
  try {
    const results = await fetchCommitsByUser(username as string)
    if (!results) {
      res.status(404).json({
        error: 'No results found',
      })
      return
    }
    
    // cache for 1 hour
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.status(200).json({
      commits: results,
    })
  } catch (error: any) {
    res.status(500).json({
      error: "Something went wrong: " + error.message ? error.message : error,
    })
  }
}
