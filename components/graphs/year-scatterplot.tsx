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

const YearScatterplot = ({ commits }: Props) => {
    const [yearBuckets, setYearBuckets] = useState<Map<number, number>>()
    const svgRef = useRef(null)
    const { mouseLeave, mouseMove, mouseOver } = useTooltip({
        transformFct: (d) => d.year
    })
    const { margin, rawWidth, rawHeight, width, height } = useGraphSize()

    // const curve = d3.line().curve(d3.curveLinear)

    useEffect(() => {
        const bucket = new Map<number, number>()
        commits.forEach((c) => {
            c.commits.forEach((commitDate) => {
                const date = new Date(commitDate)
                const year = date.getFullYear()
                const count = bucket.get(year) || 0
                bucket.set(year, count + 1)
            })
        })

        setYearBuckets(bucket)
    }, [commits])

    useEffect(() => {
        if (!yearBuckets) return

        const mapToD3: {
            year: number
            count: number
        }[] = []
        yearBuckets.forEach((value, key) => {
            mapToD3.push({
                year: key,
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
        const x = d3.scaleLinear().domain([0, yearBuckets.size + 1]).range([0, width])

        const keyMap = Array.from(yearBuckets.keys()).sort((a, b) => a - b)
        svg
            .append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(yearBuckets.size + 1)).selectAll("text").attr("transform", "translate(6 2) rotate(45)").style("text-anchor", "start").text((d) =>
                keyMap[d as number - 1] || ""
            )

        const maxCount = d3.max(mapToD3, d => d.count) || 0
        // Add Y axis
        const y = d3.scaleLinear().domain([0, maxCount]).range([height, 0])
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
            .attr("cx", function (d) {
                return x(keyMap.indexOf(d.year) + 1)
            })
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
            .text("Year")

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
            .text(`Commits by year`)

        // svg
        //     .append('path')
        //     .attr('d', curve(mapToD3.map(d => [x(keyMap.indexOf(d.year) + 1), y(d.count)])))
        //     .attr('stroke', 'var(--lighter-gray)')
        //     .attr('fill', 'none')
        //     .attr('stroke-width', '1px')

    }, [commits.length, height, margin.bottom, margin.left, margin.right, margin.top, yearBuckets, rawHeight, rawWidth, width, mouseOver, mouseMove, mouseLeave])

    const download = useDownload(svgRef, 'commits-by-year.svg')

    return (
        <>
            <div className={styles.titleWrapper}>
                <h2>Commits by year</h2>
                <button onClick={download}>Save as .svg</button>
            </div>
            <div className={styles.graphWrapper}>
                <svg ref={svgRef} />
            </div>
        </>
    )
}

export default YearScatterplot
