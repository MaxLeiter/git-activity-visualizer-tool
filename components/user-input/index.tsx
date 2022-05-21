import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import styles from './user-input.module.css'

type Props = {
    onSubmit: (username: string) => void
    error?: string
    setError: (error: string | undefined) => void
}

const UserInput = ({ onSubmit, error, setError }: Props) => {
    const router = useRouter()
    const [usernameOrLink, setUsernameOrLink] = useState<string>('MaxLeiter')
    const { query } = router

    useEffect(() => {
        if (typeof query.username === 'string')
            setUsernameOrLink(query.username)
    }, [query])

    const updateUsernameOrLink = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length > 0) {
            setError(undefined)
        }

        setUsernameOrLink(e.target.value)
    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const setDefaultError = () => setError('Please enter a valid GitHub username or GitHub URL')

        let username = ''
        if (!usernameOrLink || usernameOrLink.length === 0) {
            setDefaultError()
            return
        }

        if (usernameOrLink.includes('/')) {
            // if not github
            if (!usernameOrLink.includes('github.com')) {
                setDefaultError()
                return
            }

            username = usernameOrLink.split('/')[usernameOrLink.split('/').length - 1]
        } else {
            username = usernameOrLink
        }

        setError(undefined)
        onSubmit(username)
    }

    return (<>
        {error && <div className={styles.inputError}>
            <p><strong>Error:</strong> {error}</p>
        </div>}

        <form className={styles.inputAndLabel} onSubmit={submitForm}>
            <label htmlFor="github-username">GitHub username or URL</label>
            <input
                autoComplete="off"
                id="github-username"
                type="text"
                placeholder="https://github.com/username"
                onChange={updateUsernameOrLink}
                value={usernameOrLink}
            />
            <button type="submit" className={styles.submitButton}>Submit</button>
        </form>
    </>)
}

export default UserInput
