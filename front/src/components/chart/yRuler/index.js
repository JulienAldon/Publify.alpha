function YRuler({ yList, paddingTop, amplitude, maxHeight }) {
  return (
    <>
      {
        yList.map((el) => {
          return (
            <g transform={`translate(${30}, ${paddingTop - (el * amplitude / maxHeight)})`}>
              <text fill="white">{el}</text>
            </g>
          );
        })
      }
    </>
  );
}

export default YRuler;