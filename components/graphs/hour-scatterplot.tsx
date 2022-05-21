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

const HourScatterplot = ({ commits }: Props) => {
    const [hourBuckets, setHourBuckets] = useState<Map<number, number>>()
    const svgRef = useRef(null)
    const  {mouseLeave, mouseMove, mouseOver} = useTooltip({transformFct: 
        (d) => `${d.hour}:00`})
    const { margin, rawWidth, rawHeight, width, height } = useGraphSize()

    useEffect(() => {
        d3.select('body').append('div').attr
        const bucket = new Map<number, number>()
        commits.forEach((c) => {
            c.commits.forEach((commitDate) => {
                const date = new Date(commitDate)
                const justHour = parseInt(date.toISOString().split('T')[1].split(':')[0])
                const count = bucket.get(justHour) || 0
                bucket.set(justHour, count + 1)
            })
        })

        setHourBuckets(bucket)
    }, [commits])

    useEffect(() => {
        if (!hourBuckets) return

        const mapToD3: {
            hour: number
            count: number
        }[] = []
        hourBuckets.forEach((value, key) => {
            mapToD3.push({
                hour: key,
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
        const x = d3.scaleLinear().domain([0, 23]).range([0, width])
        svg
            .append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(25)).selectAll("text").attr("transform", "translate(6 2) rotate(45)").style("text-anchor", "start")

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
            .attr("cx", function (d) { return x(d.hour) })
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
            .text("Hour")

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
            .text(`Commits by hour`)

        }, [height, hourBuckets, margin.bottom, margin.left, margin.right, margin.top, mouseLeave, mouseMove, mouseOver, rawHeight, rawWidth, width])
    const download = useDownload(svgRef, 'commits-by-hour.svg')

    return (
        <>
            <div className={styles.titleWrapper}>
                <h2>Commits by hour</h2>
                <button onClick={download}>Save as .svg</button>
            </div>
            <div className={styles.graphWrapper}>
                <svg ref={svgRef} />
            </div>
        </>
    )
}

export default HourScatterplot
