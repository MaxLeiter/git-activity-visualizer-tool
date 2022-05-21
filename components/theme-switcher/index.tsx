import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

import styles from './switcher.module.css'

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className={styles.themeSwitcher}>
      <label htmlFor="themeSwitcher">
        Theme:
      </label>
      <select id="themeSwitcher" value={theme} onChange={e => setTheme(e.target.value)}>
        <option value="system">System</option>
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
    </div>
  )
}

export default ThemeSwitcher
