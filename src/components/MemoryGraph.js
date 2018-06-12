import React, { Fragment } from "react";
import _ from "lodash";
import styled from "styled-components";
import Text from "./Typography";
import { inject, observer } from "mobx-react";
import LineChart from "react-linechart";
import "../../node_modules/react-linechart/dist/styles.css";

const memGraphHeight = 200;
export const memGraphWidth = 400;

const SectionHeader = styled.div`
  display: flex;
  width: 100%;
  height: 32px;
  max-height: 32px;
  align-items: center;
  border-bottom: 1px solid #ebebeb;
  font-size: 12px;
  padding-left: 8px;
`;

const GraphContainer = styled.div`
  position: relative;
`;

class MemGraph extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.memoryLogs.length !== this.props.memoryLogs.length;
  }
  render() {
    const { memoryLogs, minY, maxY, minX, maxX, onPointClick } = this.props;
    return (
      <LineChart
        width={memGraphWidth}
        height={memGraphHeight}
        hideXLabel
        hideYLabel
        hideYAxis
        hideXAxis
        pointRadius={3}
        onPointClick={(e, p) => onPointClick(p.x)}
        yMin={minY}
        yMax={maxY}
        xMin={minX}
        xMax={maxX}
        margins={{
          // Passing in zero means that it'll apply the default value...
          top: 8,
          left: 1,
          right: 1,
          bottom: 8
        }}
        data={[
          {
            color: "#1a80fb",
            points: memoryLogs.map(l => ({ x: l.x, y: l.y }))
          }
        ]}
      />
    );
  }
}

const MemoryGraph = inject("store")(
  observer(({ store }) => {
    const memoryLogs = store.memoryLogs;
    const maxY = (_.maxBy(memoryLogs, m => m.y) || { y: 10 }).y;
    const minY = (_.minBy(memoryLogs, m => m.y) || { y: 0 }).y;
    const maxX = (_.maxBy(memoryLogs, m => m.x) || { x: 10 }).x;
    const minX = (_.minBy(memoryLogs, m => m.x) || { x: 10 }).x;

    return (
      <Fragment>
        <SectionHeader>
          <Text type="meta" style={{ paddingRight: 4 }}>
            Memory Usage: totalJSHeapSize / jsHeapSizeLimit
          </Text>
        </SectionHeader>
        <GraphContainer>
          <MemGraph
            onPointClick={value => (store.timeValue = value)}
            memoryLogs={memoryLogs}
            maxY={maxY}
            minY={minY}
            maxX={maxX}
            minX={minX}
          />
        </GraphContainer>
      </Fragment>
    );
  })
);
export default MemoryGraph;
