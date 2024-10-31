import React, { useRef, useState, useEffect } from 'react';
import { Group } from '@visx/group';
import { LineRadial } from '@visx/shape';
import { scaleTime, scaleLog } from '@visx/scale';
import { curveBasisOpen } from '@visx/curve';
import appleStock from '@visx/mock-data/lib/mocks/appleStock';
import { LinearGradient } from '@visx/gradient';
import { AxisLeft } from '@visx/axis';
import { GridRadial, GridAngle } from '@visx/grid';
import { animated, useSpring } from '@react-spring/web';

// Theme colors and constants
const green = '#e5fd3d';
const blue = '#aeeef8';
const background = '#744cca';
const strokeColor = '#744cca';
const springConfig = { tension: 20 };
const padding = 20;

// Data accessors
const date = (d) => new Date(d.date).valueOf();
const close = (d) => d.close;

// Scales setup
const xScale = scaleTime({
  range: [0, Math.PI * 2],
  domain: [Math.min(...appleStock.map(date)), Math.max(...appleStock.map(date))],
});
const yScale = scaleLog({
  range: [0, 1], // Placeholder, will be updated later
  domain: [Math.min(...appleStock.map(close)), Math.max(...appleStock.map(close))],
});

const angle = (d) => xScale(date(d)) ?? 0;
const radius = (d) => yScale(close(d)) ?? 0;

// Component definition
export default function RadialChart({ width, height, animate = true }) {
  const lineRef = useRef(null);
  const [lineLength, setLineLength] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  
  // Use spring animation
  const spring = useSpring({
    from: { frame: 1 },
    to: { frame: 0 },
    config: springConfig,
    onRest: () => setShouldAnimate(false),
  });

  // On component mount, start the initial animation if animate is true
  useEffect(() => {
    if (animate) {
      setShouldAnimate(true);
    }
  }, [animate]);

  // Set the range for yScale based on the chart dimensions
  yScale.range([0, height / 2 - padding]);
  
  useEffect(() => {
    if (lineRef.current) {
      setLineLength(lineRef.current.getTotalLength());
    }
  }, [lineRef.current]);

  if (width < 10) return null;

  return (
    <>
      <svg width={width} height={height}>
        <LinearGradient from={green} to={blue} id="line-gradient" />
        <rect width={width} height={height} fill={background} rx={14} />
        <text x={10} y={20} fill={green}>Lines of code</text>
        <text x={10} y={35} fill={blue}>/mock</text>
        <Group top={height / 2} left={width / 2}>
          <GridAngle
            scale={xScale}
            outerRadius={height / 2 - padding}
            stroke={green}
            strokeWidth={1}
            strokeOpacity={0.3}
            strokeDasharray="5,2"
            numTicks={20}
          />
          <GridRadial
            scale={yScale}
            numTicks={5}
            stroke={blue}
            strokeWidth={1}
            fill={blue}
            fillOpacity={0.1}
            strokeOpacity={0.2}
          />
          <AxisLeft
            top={-height / 2 + padding}
            scale={yScale.copy().range(yScale.range().reverse())}
            numTicks={5}
            hideAxisLine
          />
          <LineRadial angle={angle} radius={radius} curve={curveBasisOpen}>
            {({ path }) => {
              const d = path(appleStock) ?? '';
              return (
                <>
                  <path
                    d={d}
                    ref={lineRef}
                    strokeWidth={2}
                    strokeOpacity={0.8}
                    strokeLinecap="round"
                    fill="none"
                    stroke={strokeColor}
                  />
                  {shouldAnimate && (
                    <animated.path
                      d={d}
                      strokeWidth={2}
                      strokeOpacity={0.8}
                      strokeLinecap="round"
                      fill="none"
                      stroke="url(#line-gradient)"
                      strokeDashoffset={spring.frame.interpolate((v) => v * lineLength)}
                      strokeDasharray={lineLength}
                    />
                  )}
                </>
              );
            }}
          </LineRadial>
        </Group>
      </svg>
    </>
  );
}
