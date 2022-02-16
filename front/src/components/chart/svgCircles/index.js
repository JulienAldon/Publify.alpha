function SvgCircles(props) {
  const { color, result, paddingLeft, paddingTop, width, amplitude, maxHeight } = props
  return (
    <>
      {
        result.map((elem, index, tab) => {
          const cy = paddingTop - (elem.tracks.length * amplitude) / maxHeight
          const cx = paddingLeft + (index * width) / tab.length
          return (
            <>
              <circle cy={cy} cx={cx} fill={color} r="3" />
              <circle class="graphPoint"
                fill="transparent"
                cy={cy}
                cx={cx} r="3" />

              <text class="graphLabel" fill={color} x={cx} y={cy - 20}>{elem.tracks.length}</text>
            </>
          )
        })
      }
    </>
  )
}

export default SvgCircles;