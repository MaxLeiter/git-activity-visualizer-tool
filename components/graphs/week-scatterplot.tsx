import * as d3 from "d3"
import { useState, useRef, useEffect } from "react"
import { Commits } from "pages/api/fetch-github-events"
import styles from './graphs.module.css'
import useTooltip from "@/lib/hooks/use-tooltip"
import useGraphSize from "@/lib/hooks/use-graph-size"
import useDownload from "@/lib/hooks/use-download-button"

type Props = {
    commits: Commits
}

const WeekScatterplot = ({ commits }: Props) => {
    const [weekBuckets, setWeekBuckets] = useState<Map<number, number>>()
    const svgRef = useRef(null)
    const {mouseLeave, mouseMove, mouseOver} = useTooltip({
        transformFct: (d) => `${getDayFromNumber(d.day)} ${d.hour}:00`
    })
    
    const { margin, rawWidth, rawHeight, width, height } = useGraphSize()

    useEffect(() => {
        const bucket = new Map<number, number>()
        commits.forEach((c) => {
            c.commits.forEach((commitDate) => {
                const date = new Date(commitDate)
                const dayOfWeek = date.getDay()
                const count = bucket.get(dayOfWeek) || 0
                bucket.set(dayOfWeek, count + 1)
            })
        })

        setWeekBuckets(bucket)
    }, [commits])

    useEffect(() => {
        if (!weekBuckets) return

        const mapToD3: {
            day: number
            count: number
        }[] = []
        weekBuckets.forEach((value, key) => {
            mapToD3.push({
                day: key,
                count: value
            })
        })

        const svgEl = d3
            .select(svgRef.current)
        // clean up
        svgEl.selectAll("*").remove()

        const svg = svgEl
            .attr("viewBox", `0 0 ${rawWidth} ${rawHeight}`)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        // Add X axis
        const x = d3.scaleLinear().domain([0, 7]).range([0, width])
        svg
            .append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(7)).selectAll("text").attr("transform", "translate(6 2) rotate(45)").style("text-anchor", "start").text((d) =>
                getDayFromNumber(d as number - 1)  || ""
            )

        const maxCount = d3.max(mapToD3, d => d.count)
        // Add Y axis
        const y = d3.scaleLinear().domain([0, maxCount || 10]).range([height, 0])
        svg
            .append("g")
            .call(d3.axisLeft(y))

        // Add dots
        svg
            .append("g")
            .selectAll("dot")
            .data(mapToD3)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return x(d.day + 1) })
            .attr("cy", function (d) { return y(d.count) })
            .attr("r", 5)

            // color based on count
            .attr("fill", function (d) {
                // gradient based on count
                const color = d3.scaleLinear()
                    .domain([0, maxCount || 24])
                    // TODO: fix
                    //@ts-ignore
                    .range(["#86cefa", "#1750ac"])

                return color(d.count)

            })

            .on("mouseover", mouseOver)
            .on("mousemove", mouseMove)
            .on("mouseleave", mouseLeave)


        // Add X axis label:
        svg
            .append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + margin.top + 25)
            .text("Day")

        // Add Y axis label:
        svg
            .append("text")
            .attr("text-anchor", "end")
            .attr("y", -60)
            .attr("x", -height / 2)
            .attr("dy", "1em")
            .attr("transform", "rotate(-90)")
            .text("Count")

        // add title
        svg
            .append("text")
            .attr("x", (width / 2))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text(`Commits by day of the week`)

    }, [commits.length, height, margin.bottom, margin.left, margin.right, margin.top, mouseLeave, mouseMove, mouseOver, rawHeight, rawWidth, weekBuckets, width])

    const download = useDownload(svgRef, 'commits-by-day-of-week.svg')

    return (
        <>
            <div className={styles.titleWrapper}>
                <h2>Commits by day of the week</h2>
                <button onClick={download}>Save as .svg</button>
            </div>
            <div className={styles.graphWrapper}>
                <svg ref={svgRef} />
            </div>
        </>
    )
}

const getDayFromNumber = (day: number) => {
    switch (day) {
        case 0:
            return "Sunday"
        case 1:
            return "Monday"
        case 2:
            return "Tuesday"
        case 3:
            return "Wednesday"
        case 4:
            return "Thursday"
        case 5:
            return "Friday"
        case 6:
            return "Saturday"
    }
}

export default WeekScatterplot
