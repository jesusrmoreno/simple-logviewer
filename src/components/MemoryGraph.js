import React, { Fragment } from "react";
import { Line } from "@nivo/line";
import _ from "lodash";
import styled from "styled-components";
import Text from "./Typography";
import { inject, observer } from "mobx-react";
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

const MemoryGraph = inject("store")(
  observer(({ store }) => {
    const memoryLogs = store.memoryLogs;
    const maxY = (_.maxBy(memoryLogs, m => m.y) || { y: 10 }).y;
    const minY = (_.minBy(memoryLogs, m => m.y) || { y: 0 }).y;

    return (
      <Fragment>
        <SectionHeader>
          <Text type="meta" style={{ paddingRight: 4 }}>
            Memory Usage: totalJSHeapSize / jsHeapSizeLimit
          </Text>
        </SectionHeader>
        <Line
          data={[
            {
              id: "totalJSHeapSize/jsHeapSizeLimit",
              data: memoryLogs
            }
          ]}
          animate={false}
          minY={minY - 5}
          maxY={maxY + 5}
          height={memGraphHeight}
          width={memGraphWidth}
          enableGridX={false}
          enableGridY={false}
          curve="natural"
          enableDots={false}
          enableStackTooltip={false}
          margin={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        />
      </Fragment>
    );
  })
);
export default MemoryGraph;
