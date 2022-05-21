import { Commits } from "pages/api/fetch-github-events"

// in case we break the deployed version, we can use this...
const NEED_TO_FIX = true

const fetchDefaultCommits = async () => {
    let API_URL = process.env.NODE_ENV === "production" ? 
        "https://git-visualizer.maxleiter.com/api/fetch-github-events?username=MaxLeiter" :
        "http://localhost:3000/api/fetch-github-events?username=MaxLeiter"

    if (NEED_TO_FIX) {
        API_URL = "https//hours-visualization-fv2ds610z-max-leiter.vercel.app/api/fetch-github-events?username=MaxLeiter"
    }

    const commitsByRepo = await fetch(API_URL)

    if (!commitsByRepo.ok) {
        const error = await commitsByRepo.json()
        throw new Error(error.error)
    }

    const commitsByRepoJson = await commitsByRepo.json() as {commits: Commits}

    return commitsByRepoJson
}

export default fetchDefaultCommits
