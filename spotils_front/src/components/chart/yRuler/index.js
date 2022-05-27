import { useEffect } from "preact/hooks";

function YRuler({ yList, paddingTop, amplitude, maxHeight }) {
  useEffect(() => {
    if (maxHeight <= 0) {
      maxHeight = 1;
    }
  });
  return (
    <g>
      {
        yList.map((el) => {
          return (
            <g transform={`translate(${30}, ${paddingTop - (el * amplitude / maxHeight)})`}>
              <text fill="white">{el}</text>
            </g>
          );
        })
      }
    </g>
  );
}

export default YRuler;