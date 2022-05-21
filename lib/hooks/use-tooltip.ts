import * as d3 from "d3"

const useTooltip = () => {
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

    return tooltip
}

export default useTooltip
