
import { Commits } from "pages/api/fetch-github-events"
import { useEffect, useState } from "react"
import styles from './graphs.module.css'
import HourScatterplot from "./hour-scatterplot"
import WeekScatterplot from "./week-scatterplot"
import MonthScatterplot from "./month-scatterplot"
import YearScatterplot from "./year-scatterplot"

type Props = {
    commits: Commits
}

const Graphs = ({ commits }: Props) => {
    const [totalCommits, setTotalCommits] = useState<number>()

    useEffect(() => {
        let total = 0
        commits.forEach((c) => {
            c.commits.forEach(() => {
                total++
            })
        })
        setTotalCommits(total)
    }, [commits])

    return (
        <>
            <hr className={styles.hr} />
            <details className={styles.details}>
                <summary>Total commits analyzed: {totalCommits} (click to see breakdown by repository)</summary>
                <ul>
                    {commits.map((c) => (
                        c.commits.length > 0 && <li key={c.repo}>
                            <details>
                                <summary>{c.repo} ({c.commits.length})</summary>
                                <ul>
                                    {c.commits.map((commitDate) => (
                                        <li key={`${commitDate}-${c.repo}`}>{commitDate}</li>
                                    ))}
                                </ul>
                            </details>
                        </li>
                    ))}
                </ul>
            </details>
            <HourScatterplot commits={commits} />
            <WeekScatterplot commits={commits} />
            <MonthScatterplot commits={commits} />
            <YearScatterplot commits={commits} />
        </>
    )
}

export default Graphs
