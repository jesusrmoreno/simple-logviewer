import React from "react";
import { render } from "react-dom";
import styled from "styled-components";
import _ from "lodash";
import "react-virtualized/styles.css";
import List from "react-virtualized/dist/commonjs/List";
import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";
import JSONTree from "react-json-tree";
import Resizable from "re-resizable";
import { Line } from "@nivo/line";
import Text from "./components/Typography";
import LogRow from "./components/LogRow";
import FileSelector from "./components/FileUpload";
import { Provider, inject, observer } from "mobx-react";
import appState from "./store";

const styles = {
  fontFamily: "sans-serif",
  overflow: "hidden",
  height: "100vh",
  display: "flex"
};

const Header = styled.div`
  display: flex;
  width: 100%;
  height: 32px;
  max-height: 32px;
  align-items: center;
  border-bottom: 1px solid #ebebeb;
  font-size: 12px;
  padding-left: 8px;
`;

const theme = {
  scheme: "flat",
  author: "chris kempson (http://chriskempson.com)",
  base00: "#2C3E50",
  base01: "#34495E",
  base02: "#7F8C8D",
  base03: "#95A5A6",
  base04: "#BDC3C7",
  base05: "#e0e0e0",
  base06: "#f5f5f5",
  base07: "#ECF0F1",
  base08: "#E74C3C",
  base09: "#E67E22",
  base0A: "#F1C40F",
  base0B: "#2ECC71",
  base0C: "#1ABC9C",
  base0D: "#3498DB",
  base0E: "#9B59B6",
  base0F: "#be643c"
};

const memGraphHeight = 200;
const memGraphWidth = 400;

const RowTypes = styled.div`
  flex: 1;
  overflow-y: scroll;
  border-bottom: 1px solid #ebebeb;
`;

const TypeSelector = inject("store")(
  observer(
    class Types extends React.Component {
      toggleSelection = key => {
        const { store } = this.props;
        const currentSelected = store.selectedGroups;
        store.selectedGroups = {
          ...currentSelected,
          [key]: !this.isSelected(currentSelected, key)
        };
      };

      isSelected = (selectedGroups, key) =>
        typeof selectedGroups[key] === "boolean" ? selectedGroups[key] : true;

      render() {
        const { types, store } = this.props;
        const { selectedGroups } = store;
        const headers = Object.keys(types).sort();
        return (
          <RowTypes>
            {headers.map(header => {
              const selected = this.isSelected(selectedGroups, header);
              return (
                <TypeGroup
                  selected={selected}
                  key={header}
                  onClick={() => this.toggleSelection(header)}
                >
                  {header}
                </TypeGroup>
              );
            })}
          </RowTypes>
        );
      }
    }
  )
);

const TypeGroup = styled.div`
  height: 32;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 8px;
  cursor: pointer;
  color: ${props => (props.selected ? "#444444" : "rgba(0, 0, 0, .27)")};
  &:hover {
    background-color: #ebebeb;
  }
`;

const FullHeightPanel = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  width: ${props => props.width}px;
  max-width: ${props => props.width}px;
  border-right: 1px solid #ebebeb;
`;

const Input = styled.input`
  outline: none;
  border: none;
  width: 100%;
  height: 100%;
  padding: 0px;
  font-size: 12px;
`;

const LogList = inject("store")(
  observer(({ store }) => {
    const { filteredLog } = store;
    return (
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            rowCount={filteredLog.length}
            rowHeight={32}
            style={{ outline: "none" }}
            rowRenderer={({ index, key, style }) => {
              const l = filteredLog[index];
              return (
                <LogRow
                  onClick={() => (store.selectedRow = l)}
                  log={l}
                  key={key}
                  style={style}
                />
              );
            }}
          />
        )}
      </AutoSizer>
    );
  })
);

const App = inject("store")(
  observer(
    class Main extends React.Component {
      render() {
        const { store } = this.props;
        const { memoryLogs, parsedLog } = store;
        const { types, meta } = parsedLog;

        const maxY = (_.maxBy(memoryLogs, m => m.y) || { y: 10 }).y;
        const minY = (_.minBy(memoryLogs, m => m.y) || { y: 0 }).y;

        return (
          <div style={styles}>
            <FullHeightPanel width={memGraphWidth}>
              <Header>
                <Text type="meta">Log Types</Text>
              </Header>
              <Header>
                <Input
                  style={{ paddingRight: 8 }}
                  value={store.searchTerm}
                  placeholder="Search Logs by Type..."
                  onChange={e => (store.searchTerm = e.target.value)}
                />
              </Header>
              <TypeSelector types={types} />
              <Header>
                <Text type="meta" style={{ paddingRight: 4 }}>
                  Memory Usage: totalJSHeapSize / jsHeapSizeLimit
                </Text>
              </Header>
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
              />
            </FullHeightPanel>
            <FullHeightPanel style={{ flex: 1 }}>
              <FileSelector />
              <LogList />
            </FullHeightPanel>
            <Resizable
              defaultSize={{
                width: 400
              }}
              enable={{
                top: false,
                right: false,
                bottom: false,
                left: true,
                topRight: false,
                bottomRight: false,
                bottomLeft: false,
                topLeft: false
              }}
              style={{
                backgroundColor: "#1d1f21"
              }}
            >
              <div
                style={{
                  overflow: "scroll",
                  height: "100vh",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <div
                  style={{
                    backgroundColor: "#2d3e4f"
                  }}
                >
                  <JSONTree
                    data={store.selectedRowJson}
                    invertTheme={false}
                    theme={theme}
                    hideRoot
                    shouldExpandNode={() => true}
                  />
                </div>
                <div style={{ background: "#1d1f21", flex: 1 }}>
                  <JSONTree
                    data={meta}
                    invertTheme={false}
                    theme={{
                      scheme: "tomorrow",
                      author: "chris kempson (http://chriskempson.com)",
                      base00: "#1d1f21",
                      base01: "#282a2e",
                      base02: "#373b41",
                      base03: "#969896",
                      base04: "#b4b7b4",
                      base05: "#c5c8c6",
                      base06: "#e0e0e0",
                      base07: "#ffffff",
                      base08: "#cc6666",
                      base09: "#de935f",
                      base0A: "#f0c674",
                      base0B: "#b5bd68",
                      base0C: "#8abeb7",
                      base0D: "#81a2be",
                      base0E: "#b294bb",
                      base0F: "#a3685a"
                    }}
                    hideRoot
                    shouldExpandNode={() => true}
                  />
                </div>
              </div>
            </Resizable>
          </div>
        );
      }
    }
  )
);

render(
  <Provider store={appState}>
    <App />
  </Provider>,
  document.getElementById("root")
);
