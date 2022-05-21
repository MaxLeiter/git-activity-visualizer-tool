import * as d3 from "d3"
import { useEffect, useState } from "react"

type Props = {
    transformFct: (d: any) => string
}

const useTooltip = ({ transformFct }: Props) => {
    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => {
        setIsMounted(true)
        return () => setIsMounted(false)
    }, [])

    if (!isMounted) return {
        tooltip: null,
        mouseOver: () => { },
        mouseMove: () => { },
        mouseLeave: () => { },
    }

    const mouseOver = function (event: MouseEvent, d: any) {
        if (!tooltip) return
        tooltip
            .html(`${transformFct(d)} - ${d.count} commits`)
            .style("left", event.pageX + "px")
            .style("top", event.pageY + "px")
            .style("opacity", 1)
    }

    const mouseMove = function (event: MouseEvent, d: any) {
        if (!tooltip) return
        tooltip
            .style("left", event.pageX + "px")
            .style("top", event.pageY + "px")
    }

    const mouseLeave = function () {
        if (!tooltip) return
        tooltip
            .style("opacity", 0)
            .transition()
            .duration(200)
    }

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("pointer-events", "none")
        .style("background-color", "var(--bg)")
        .style("color", "var(--fg)")
        .style("border-color", "var(--fg)")
    return {tooltip, mouseOver, mouseMove, mouseLeave }
}

export default useTooltip
