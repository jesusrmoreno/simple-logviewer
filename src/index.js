import React from "react";
import { render } from "react-dom";
import styled from "styled-components";
import "react-virtualized/styles.css";
import List from "react-virtualized/dist/commonjs/List";
import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";
import Text from "./components/Typography";
import LogRow from "./components/LogRow";
import LogTypes from "./components/LogTypes";
import FileSelector from "./components/FileUpload";
import ObjectInspector from "./components/ObjectInspector";
import MemoryGraph, { memGraphWidth } from "./components/MemoryGraph";

import { Provider, inject, observer } from "mobx-react";

import appState from "./store";

const styles = {
  fontFamily: "sans-serif",
  overflow: "hidden",
  height: "100vh",
  display: "flex"
};

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
        const { searchTerm } = store;

        return (
          <div style={styles}>
            <FullHeightPanel width={memGraphWidth}>
              <SectionHeader>
                <Text type="meta">Log Types</Text>
              </SectionHeader>
              <SectionHeader>
                <Input
                  style={{ paddingRight: 8 }}
                  value={searchTerm}
                  placeholder="Search Logs by Type..."
                  onChange={e => (store.searchTerm = e.target.value)}
                />
              </SectionHeader>
              <LogTypes />
              <MemoryGraph />
            </FullHeightPanel>
            <FullHeightPanel style={{ flex: 1 }}>
              <FileSelector />
              <LogList />
            </FullHeightPanel>
            <ObjectInspector />
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
