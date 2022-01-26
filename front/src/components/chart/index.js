import { useMemo, useRef, useEffect, useState } from "preact/hooks";
import SvgPath from "./svgPath";
import style from './style.css';
import SvgCircles from "./svgCircles";
import UserList from "./userList";
import YRuler from "./yRuler";
import XRuler from "./xRuler";

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

function randomHsl() {
  return 'hsla(' + (Math.random() * 360) + ', 100%, 50%, 1)';
}

function Chart({ analytic, users_p }) {
  const colors = ['#FF4F00', '#64C800', '#FFD700', '#E100FF', '#860DFF', '#40FFB5', '#0000FF']
  // if (users.length > colors.length) {
  //   // TODO: add colors to colors until selectedUsers.length < colors.length
  // }

  const [users, setUsers] = useState(users_p);
  // const colors = useMemo(() => [...users.map(el => randomHsl())])
  const [selectedUsers, setSelectedUsers] = useState(createLegend(users, colors));
  const [maxHeight, setMaxHeight] = useState(50)
  const [dimensions, setDimensions] = useState({ 'width': 800, 'height': 600 });
  const [ord, setOrd] = useState(createOrdScale(maxHeight, 5))
  const [paddingLeft, setPaddingLeft] = useState(80);
  const [paddingTop, setPaddingTop] = useState(dimensions.height - 100);
  const [amplitude, setAmplitude] = useState(dimensions.height / 1.5);
  const dates = useMemo(() => createRangeDates(new Date(analytic.dates.min), new Date(analytic.dates.max)), [analytic]);
  const svgRef = useRef();

  useEffect(() => {
    let rect = svgRef.current?.getBoundingClientRect?.();
    setDimensions({ 'width': rect?.width, 'height': rect?.height });
    fillAnalyticObj(analytic?.data, dates);
    analytic?.data?.sort((a, b) => new Date(a?.added_at) - new Date(b?.added_at));
    setOrd(createOrdScale(maxHeight, 5));
    setPaddingTop(dimensions.height - 100);
    setAmplitude(dimensions.height / 1.5);
    setPaddingLeft(80)
  }, [users, maxHeight, dimensions])
  useEffect(() => {
    setMaxHeight(Math.max(...analytic.data.map(el => selectedUsers.find(t => t.display_name === el.added_by) ? el.tracks.length : 1)));
  }, [selectedUsers])
  useEffect(() => {
    window.addEventListener('resize', () => {
      let rect = svgRef.current?.getBoundingClientRect?.();
      setDimensions({ 'width': rect?.width, 'height': rect?.height });
    })
  }, [svgRef])

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
          selectedUsers.map((user) => {
            const result = analytic.data.filter(obj => obj.added_by === user.display_name || obj.added_by === '*')
            return (
              <>
                <SvgPath
                  color={user.color}
                  paddingLeft={paddingLeft}
                  paddingTop={paddingTop}
                  width={dimensions.width - 100}
                  result={result}
                  amplitude={amplitude}
                  maxHeight={maxHeight}
                />
                <SvgCircles
                  color={user.color}
                  result={result}
                  paddingLeft={paddingLeft}
                  paddingTop={paddingTop}
                  width={dimensions.width - 100}
                  amplitude={amplitude}
                  selectedUser={user}
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