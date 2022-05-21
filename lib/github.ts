import { Octokit } from "octokit"
import { GetResponseDataTypeFromEndpointMethod } from "@octokit/types"

import { githubAuthToken } from "./config"

const octokit = new Octokit({ auth: githubAuthToken })

type Repositories = GetResponseDataTypeFromEndpointMethod<typeof octokit.rest.repos.listForUser>

const _getReposForUser = async (user: string) => {
    const data = await octokit.paginate(octokit.rest.repos.listForUser, {
        username: user,
        type: "all",
        per_page: 100,
        sort: "pushed"
    })

    // const withoutForks = data.filter((repo) => !repo.fork)
    return data.slice(0, 40) as Repositories
}

type CommitsByAuthor = string[]
type Commits = {
    repo: string
    commits: CommitsByAuthor
}

const _getCommitsByAuthorForRepos = async (repos: Repositories, user: string) => {
   const promises = repos.map(async (repo) => {
        const commits = await octokit.paginate(octokit.rest.repos.listCommits, {
            owner: repo.owner.login,
            repo: repo.name,
            author: user,
            per_page: 100,
            since: new Date(Date.now() - (1000 * 60 * 60 * 24 * 365 * 5)).toISOString()
        })
        const commitDates = commits.map((commit) => commit.commit.author?.date || commit.commit.committer?.date)

        const filtered = commitDates.filter((date) => date !== undefined) as string[]

        return {
            repo: repo.name,
            commits: filtered,
        } as Commits
    })

    const commitsByAuthor = await Promise.allSettled(promises)

    const successful = commitsByAuthor.filter((commit) => commit.status === "fulfilled") as PromiseFulfilledResult<Commits>[]
    const successfulCommits = successful.map((commit) => commit.value)

    // merge duplicate repos which can occur due to forks
    const merged = successfulCommits.reduce((acc, curr) => {
        const existing = acc.find((repo) => repo.repo === curr.repo)
        if (existing) {
            existing.commits = [...existing.commits, ...curr.commits]
        } else {
            acc.push(curr)
        }
        return acc
    }, [] as Commits[])

    return merged
}

export default async function getCommitsByAuthorForUser(user: string) {
    const repos = await _getReposForUser(user)
    return await _getCommitsByAuthorForRepos(repos, user)
}
