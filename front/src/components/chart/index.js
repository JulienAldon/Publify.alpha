import { useMemo, useRef, useEffect, useState } from "preact/hooks";
import SvgPath from "./svgPath";
import style from './style.css';
import SvgCircles from "./svgCircles";
import UserList from "./userList";
import YRuler from "./yRuler";
import XRuler from "./xRuler";
import { set } from "js-cookie";

function createRangeDates(start, end) {
  var current = new Date(start);
  var arr = new Array();
  while (current <= end) {
    current.setMonth(current.getMonth() + 1);
    if (current.getMonth() > 11) {
      current.setFullYear(current.getFullYear() + 1);
    }
    arr.push(new Date(current.getFullYear(), current.getMonth()));
  }
  return arr;
}

function fillAnalyticObj(analytic, dates) {
  const added = [...analytic.map(el => el.added_at)]
  const date = [...dates.map(el => el.getFullYear() + '-' + ('0' + (el.getMonth() + 1)).slice(-2))]
  date.forEach((elem, index) => {
    if (!added.includes(elem)) {
      analytic.push({
        added_at: elem,
        added_by: "*",
        tracks: []
      });
    }
  });
}

function createLegend(users, colors) {
  users.map((el, index) => {
    el.color = colors[index]
  })
  return users
}

function createOrdScale(end, step) {
  let start = 0;
  let arr = []
  for (let i = start; i <= end; i += step) {
    arr.push(i);
  }
  arr.push(end)
  return arr;
}

function useOrd(maxHeight) {
  const [ord, setOrd] = useState(createOrdScale(maxHeight, 5))

  useEffect(() => {
    setOrd(createOrdScale(maxHeight, 5))
  }, [maxHeight])
  return ord
}

function useDimensions(svgRef) {
  const [dimensions, setDimensions] = useState({ 'width': 800, 'height': 600 });
  const [paddingLeft, setPaddingLeft] = useState(80);
  const [paddingTop, setPaddingTop] = useState(dimensions.height - 170);
  const [amplitude, setAmplitude] = useState(dimensions.height / 1.5);

  useEffect(() => {
    let rect = svgRef.current?.getBoundingClientRect?.();
    const resizeHandler = () => {
      let rect = svgRef.current?.getBoundingClientRect?.();
      setDimensions({ 'width': rect?.width, 'height': rect?.height });
    }
    setDimensions({ 'width': rect?.width, 'height': rect?.height });
    setPaddingTop(dimensions.height - 170);
    setAmplitude(dimensions.height / 1.5);
    setPaddingLeft(80)
    window.addEventListener('resize', resizeHandler);
    return () => {
      window.removeEventListener('resize', resizeHandler);
    }
  }, [svgRef]);

  return [dimensions, paddingLeft, paddingTop, amplitude]
}

function useResult(selectedUsers, analytic, dates) {
  const [results, setResults] = useState([...selectedUsers.map((user) => {
    return [...analytic.data.filter((elem) => elem.added_by === user.display_name)]
  })]);
  results.forEach((el) => {
    fillAnalyticObj(el, dates);
    el?.sort((a, b) => new Date(a?.added_at) - new Date(b?.added_at))
  })
  useEffect(() => {
    setResults([...selectedUsers.map((user) => {
      return [...analytic.data.filter((elem) => elem.added_by === user.display_name)]
    })]);
    results.forEach((el) => {
      fillAnalyticObj(el, dates);
      el?.sort((a, b) => new Date(a?.added_at) - new Date(b?.added_at))
    })
  }, [selectedUsers, analytic]);
  return [results, setResults];
}

function randomHsl() {
  return 'hsla(' + (Math.random() * 360) + ', 100%, 50%, 1)';
}

function Chart({ analytic, users }) {
  const svgRef = useRef();
  const colors = useMemo(() => [...users.map(el => randomHsl())], [])
  const [selectedUsers, setSelectedUsers] = useState(createLegend(users, colors));
  const [maxHeight, setMaxHeight] = useState(50)
  const [dimensions, paddingLeft, paddingTop, amplitude] = useDimensions(svgRef);
  const dates = useMemo(() => createRangeDates(new Date(analytic.dates.min), new Date(analytic.dates.max)), [analytic]);
  const [results, setResults] = useResult(selectedUsers, analytic, dates);
  const ord = useOrd(maxHeight)

  useEffect(() => {
    analytic?.data?.sort((a, b) => new Date(a?.added_at) - new Date(b?.added_at));
  }, [analytic])

  useEffect(() => {
    setMaxHeight(Math.max(...analytic.data.map(el => selectedUsers.find(t => t.display_name === el.added_by) ? el.tracks.length : 1)));
  }, [selectedUsers])

  return (
    <>
      <UserList
        users={users}
        selected={selectedUsers}
        setSelected={setSelectedUsers}
      />
      <svg class={style.svgBox} height={dimensions.height} ref={svgRef}>
        <YRuler
          yList={ord}
          paddingTop={paddingTop}
          amplitude={amplitude}
          maxHeight={maxHeight}
        />
        <XRuler
          xList={dates}
          paddingLeft={paddingLeft}
          dimensions={dimensions}
        />
        {
          results.map((user) => {
            const usr = user?.filter(el => el?.added_by !== '*')[0];
            const color = selectedUsers?.find(el => el?.display_name === usr?.added_by)
            return (
              <>
                <SvgPath
                  color={color?.color}
                  paddingLeft={paddingLeft}
                  paddingTop={paddingTop}
                  width={dimensions.width - 100}
                  result={user}
                  amplitude={amplitude}
                  maxHeight={maxHeight}
                />
                <SvgCircles
                  color={color?.color}
                  result={user}
                  paddingLeft={paddingLeft}
                  paddingTop={paddingTop}
                  width={dimensions.width - 100}
                  amplitude={amplitude}
                  maxHeight={maxHeight}
                />
              </>
            );
          })
        }
      </svg>
    </>
  );
}

export default Chart;