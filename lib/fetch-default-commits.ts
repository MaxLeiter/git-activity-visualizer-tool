import { Commits } from "pages/api/fetch-github-events"

const fetchDefaultCommits = async () => {
    const API_URL = process.env.NODE_ENV === "production" ? 
        "https://git-visualizer.maxleiter.com/api/fetch-github-events?username=MaxLeiter" :
        "http://localhost:3000/api/fetch-github-events?username=MaxLeiter"

    const commitsByRepo = await fetch(API_URL)

    if (!commitsByRepo.ok) {
        const error = await commitsByRepo.json()
        throw new Error(error.error)
    }

    const commitsByRepoJson = await commitsByRepo.json() as {commits: Commits}

    return commitsByRepoJson
}

export default fetchDefaultCommits
