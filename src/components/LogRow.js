import React from "react";
import Text from "./Typography";
import styled from "styled-components";
import { getRowType, createMoment } from "../util";
import { observer, inject } from "mobx-react";
import get from "lodash/get";

const Row = styled.div`
  height: 32px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  background-color: ${props => props.selected && "#1a80fb"};

  &:hover {
    background-color: ${props => !props.selected && "#ebebeb"};
  }

  div {
    padding: 8px;
  }
`;

const formatTimeStamp = time => time.format("hh:mm:ss A");

const ShowWhen = ({ type, condition, children }) =>
  type === condition ? children() : null;

// Convoluted way to prevent every single row from re-rendering when we click on one
const IsSelected = inject("store")(
  observer(
    class Selected extends React.Component {
      render() {
        const { store, log, ...props } = this.props;
        const { selectedRowJson } = store;
        const selected = log.id === selectedRowJson.id;
        return <LogRow {...props} selected={selected} log={log} />;
      }
    }
  )
);

class LogRow extends React.PureComponent {
  render() {
    const { log, style, selected, ...props } = this.props;
    const time = log.time
      ? formatTimeStamp(createMoment(log.time))
      : formatTimeStamp(createMoment(log.startTime));
    const type = log.action ? log.action.type : getRowType(log);
    return (
      <Row {...props} style={style} selected={selected}>
        <Text type="meta" light={selected}>
          {time}
        </Text>
        <Text type="meta" light={selected}>
          {type}
        </Text>
        <ShowWhen type={type} condition="memory">
          {() => (
            <Text type="meta" light={selected}>
              {log.data.jsHeapSizeLimit}
            </Text>
          )}
        </ShowWhen>
        <ShowWhen type={type} condition="memory">
          {() => (
            <Text type="meta" light={selected}>
              {log.data.totalJSHeapSize}
            </Text>
          )}
        </ShowWhen>
        <ShowWhen type={type} condition="memory">
          {() => (
            <Text type="meta" light={selected}>
              {log.data.usedJSHeapSize}
            </Text>
          )}
        </ShowWhen>
        <ShowWhen type={type} condition="event">
          {() => (
            <Text type="meta" light={selected}>
              {log.eventType}
            </Text>
          )}
        </ShowWhen>
        <ShowWhen type={type} condition="log/ADD_LOG">
          {() => (
            <Text type="meta" light={selected}>
              {get(log, "action.payload.logEntry.description", "")}
            </Text>
          )}
        </ShowWhen>
        <ShowWhen type={type} condition="log">
          {() => (
            <Text type="meta" light={selected}>
              {get(log, "data", []).join(' - ')}
            </Text>
          )}
        </ShowWhen>
        <ShowWhen type={type} condition="@@router/LOCATION_CHANGE">
          {() => (
            <Text type="meta" light={selected}>
              {get(log, "action.payload.pathname", "")}
            </Text>
          )}
        </ShowWhen>
      </Row>
    );
  }
}

export default IsSelected;
