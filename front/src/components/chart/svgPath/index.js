
function SvgPath(props) {
    const {color, paddingLeft, paddingTop, width, result, amplitude, maxHeight} = props
    return (
        <>
            <path 
                fill="transparent" 
                stroke={color}
                d={`M${paddingLeft + 0 * (width) / result.length},${paddingTop - result[0].tracks.length * amplitude / maxHeight}`+result.reduce((previous, current, index, tab) => { 
                    if (typeof previous === "object") {
                        return ` L${paddingLeft+ index * (width) / tab.length},${paddingTop-(current.tracks.length * amplitude / maxHeight)}`;
                    } else {
                        return previous + ` L${paddingLeft+ index * (width) / tab.length},${paddingTop-current.tracks.length * amplitude / maxHeight}`;
                    }
                }
            )}/>
        </>
    );
}
export default SvgPath;