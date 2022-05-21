const githubAuthToken = process.env.GITHUB_AUTH_TOKEN

if (!githubAuthToken) {
  throw new Error("GITHUB_AUTH_TOKEN is required")
}

// if window is defined, abort. This is a browser environment.
if (typeof window !== "undefined") {
  throw new Error("Tried to load config in a browser environment.")
}

export {
    githubAuthToken,
}
