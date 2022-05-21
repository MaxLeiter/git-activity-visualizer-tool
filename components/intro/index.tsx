import ThemeSwitcher from "../theme-switcher"
import styles from './intro.module.css'

const Intro = () => (<>
    <div className={styles.titleWrapper}>
        <h1>When are you most productive?</h1>
        <ThemeSwitcher />
    </div>
    <p>
        This is a <a href="https://d3js.org/" rel="noreferrer" target="_blank">d3.js</a> and React powered webapp that visualizes your Git commits. You can use it with the GitHub API to see when you most often push.
    </p>
    <p>
        It currently only supports GitHub but contributions adding support for GitLab and other source forges are welcome.
    </p>
    <p>
        <strong>Caveats:</strong> This only analyzes the 35 most recently pushed-to
        public repositories that the user owns. Only commits since 2017 are returned.
    </p>
</>)

export default Intro
