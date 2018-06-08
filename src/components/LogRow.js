import React from "react";
import Text from "./Typography";
import styled from "styled-components";
import { getRowType, createMoment } from "../util";
import { observer, inject } from "mobx-react";
import get from "lodash/get";
import ColorHash from "color-hash";

const colorHash = new ColorHash();
const Row = styled.div`
  height: 32px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  background-color: ${props => {
    if (props.selected) {
      return "#1a80fb";
    }
    if (props.selectedFromGroup) {
      console.log(colorHash);
      return colorHash.hex(props.type);
    }
  }};

  &:hover {
    background-color: ${props =>
      !props.selected && !props.selectedFromGroup && "#ebebeb"};
  }

  div {
    padding: 8px;
  }
`;

const formatTimeStamp = time => time.format("hh:mm:ss A");

const ShowIf = ({ condition, children }) => (condition ? children() : null);

// Convoluted way to prevent every single row from re-rendering when we click on one
const IsSelected = inject("store")(
  observer(
    class Selected extends React.Component {
      render() {
        const { store, log, ...props } = this.props;
        const { selectedRowJson, selectedGroups } = store;
        const selected = log.id === selectedRowJson.id;
        const selectedFromGroup = selectedGroups[getRowType(log)];
        return (
          <LogRow
            {...props}
            selected={selected}
            selectedFromGroup={selectedFromGroup}
            log={log}
          />
        );
      }
    }
  )
);

const isEqual = (a, b) => a === b;
class LogRow extends React.PureComponent {
  render() {
    const { log, style, selected, selectedFromGroup, ...props } = this.props;
    const time = log.time
      ? formatTimeStamp(createMoment(log.time))
      : formatTimeStamp(createMoment(log.startTime));
    const type = log.action ? log.action.type : getRowType(log);
    const useLightText = selected || selectedFromGroup;

    return (
      <Row
        {...props}
        style={style}
        selected={selected}
        selectedFromGroup={selectedFromGroup}
        type={getRowType(log)}
      >
        <Text type="meta" light={useLightText}>
          {time}
        </Text>
        <Text type="meta" light={useLightText}>
          {type}
        </Text>
        <ShowIf condition={isEqual(type, "memory")}>
          {() => (
            <Text type="meta" light={useLightText}>
              {log.data.jsHeapSizeLimit}
            </Text>
          )}
        </ShowIf>
        <ShowIf type={type} condition={isEqual(type, "memory")}>
          {() => (
            <Text type="meta" light={useLightText}>
              {log.data.totalJSHeapSize}
            </Text>
          )}
        </ShowIf>
        <ShowIf type={type} condition={isEqual(type, "memory")}>
          {() => (
            <Text type="meta" light={useLightText}>
              {log.data.usedJSHeapSize}
            </Text>
          )}
        </ShowIf>
        <ShowIf type={type} condition={isEqual(type, "event")}>
          {() => (
            <Text type="meta" light={useLightText}>
              {log.eventType}
            </Text>
          )}
        </ShowIf>
        <ShowIf type={type} condition={isEqual(type, "log/ADD_LOG")}>
          {() => (
            <Text type="meta" light={useLightText}>
              {get(log, "action.payload.logEntry.description", "")}
            </Text>
          )}
        </ShowIf>
        <ShowIf type={type} condition={isEqual(type, "log")}>
          {() => (
            <Text type="meta" light={useLightText}>
              {get(log, "data", []).join(" - ")}
            </Text>
          )}
        </ShowIf>
        <ShowIf
          type={type}
          condition={isEqual(type, "@@router/LOCATION_CHANGE")}
        >
          {() => (
            <Text type="meta" light={useLightText}>
              {get(log, "action.payload.pathname", "")}
            </Text>
          )}
        </ShowIf>
      </Row>
    );
  }
}

export default IsSelected;
