import * as d3 from 'd3'

const useDownload = (svgRef: React.RefObject<SVGSVGElement>, name: string) => {
    const download = () => {
        const svgEl = d3.select(svgRef.current)
        // TODO: fix typing
        const svg = svgEl.node() as any
        const serializer = new XMLSerializer()
        const source = serializer.serializeToString(svg)
        const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = name
        a.click()
        setTimeout(() => {
            URL.revokeObjectURL(url)
        }, 100)
    }

    return download
}

export default useDownload
