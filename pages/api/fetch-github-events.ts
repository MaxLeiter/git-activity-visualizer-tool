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

async function handler(
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

  const results = await fetchCommitsByUser(username as string)
  if (!results) {
    res.status(404).json({
      error: 'No results found',
    })
    return
  }

  return results
}

async function within(fn: () => Promise<Commits | undefined>, res: NextApiResponse, duration: number) {
  const id = setTimeout(() => res.status(500).json({
    error: "It took too long to fetch the commits. Try a user with less activity. Sorry!"
  }), duration)

  try {
    let data = await fn()
    clearTimeout(id)
    // https://vercel.com/docs/concepts/functions/serverless-functions/edge-caching#stale-while-revalidate
    res.setHeader('Cache-Control', 'Cache-Control: s-maxage=0 max-age=3600')
    res.json({commits: data})
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
}

const fct = async (req: NextApiRequest, res: NextApiResponse) => {
  await within(() => handler(req, res), res, (60 * 1000) - 300)
}

export default fct
