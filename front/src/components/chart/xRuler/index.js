function XRuler({ xList, paddingLeft, dimensions }) {
  return (
    <g>
      {
        xList.map((elem, index, tab) => {
          return (
            <g transform={`translate(${paddingLeft + (index * (dimensions.width - 100)) / tab.length}, ${dimensions.height - 80})`}>
              <text style="transform:rotate(70deg)"
                fill="white">
                {
                  elem.getFullYear() + "-" + ("0" + (elem.getMonth() + 1)).slice(-2)
                }
              </text>
            </g>
          )
        })
      }
    </g>
  );
}

export default XRuler;