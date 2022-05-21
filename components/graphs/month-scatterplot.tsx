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

const MonthScatterplot = ({ commits }: Props) => {
    const [monthBuckets, setMonthBuckets] = useState<Map<number, number>>()
    const svgRef = useRef(null)
    const tooltip = useTooltip()
    const { margin, rawWidth, rawHeight, width, height } = useGraphSize()

    useEffect(() => {
        const bucket = new Map<number, number>()
        commits.forEach((c) => {
            c.commits.forEach((commitDate) => {
                const date = new Date(commitDate)
                const month = date.getMonth()
                const count = bucket.get(month) || 0
                bucket.set(month, count + 1)
            })
        })

        setMonthBuckets(bucket)
    }, [commits])

    useEffect(() => {
        if (!monthBuckets) return

        const mapToD3: {
            month: number
            count: number
        }[] = []
        monthBuckets.forEach((value, key) => {
            mapToD3.push({
                month: key,
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
        const x = d3.scaleLinear().domain([0, 12]).range([0, width])
        svg
            .append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(13).tickFormat((d) => (d as number + 1).toString())).selectAll("text").attr("transform", "translate(6 2) rotate(45)").style("text-anchor", "start").text((d) =>
                getMonthFromNumber(d as number - 1) || ""
            )

        const maxCount = d3.max(mapToD3, d => d.count)
        // Add Y axis
        const y = d3.scaleLinear().domain([0, maxCount || 10]).range([height, 0])
        svg
            .append("g")
            .call(d3.axisLeft(y))

        const mouseOver = function (event: MouseEvent, d: any) {
            tooltip
                .html(`${getMonthFromNumber(d.month)} - ${d.count} commits`)
                .style("left", event.pageX + "px")
                .style("top", event.pageY + "px")
                .style("opacity", 1)
        }

        const mouseMove = function (event: MouseEvent, d: any) {
            tooltip
                .style("left", event.pageX + "px")
                .style("top", event.pageY + "px")
        }

        const mouseLeave = function () {
            tooltip
                .style("opacity", 0)
                .transition()
                .duration(200)
        }

        // Add dots
        svg
            .append("g")
            .selectAll("dot")
            .data(mapToD3)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return x(d.month + 1 ) })
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
            .text("Month")

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
            .style("color", "var(--fg)")
            .text(`Commits by month of the year`)

    }, [commits.length, height, margin.bottom, margin.left, margin.right, margin.top, monthBuckets, rawHeight, rawWidth, tooltip, width])

    const download = useDownload(svgRef, 'commits-by-month.svg')

    return (
        <>
            <div className={styles.titleWrapper}>
                <h2>Commits by month of the year</h2>
                <button onClick={download}>Save as .svg</button>
            </div>
            <div className={styles.graphWrapper}>
                <svg ref={svgRef} />
            </div>
        </>
    )
}

const getMonthFromNumber = (month: number) => {
    switch (month) {
        case 0:
            return "Jan"
        case 1:
            return "Feb"
        case 2:
            return "Mar"
        case 3:
            return "Apr"
        case 4:
            return "May"
        case 5:
            return "June"
        case 6:
            return "July"
        case 7:
            return "Aug"
        case 8:
            return "Sept"
        case 9:
            return "Oct"
        case 10:
            return "Nov"
        case 11:
            return "Dec"
    }
}

export default MonthScatterplot
