import React from "react";
import { render } from "react-dom";
import styled from "styled-components";
import _ from "lodash";
import moment from "moment";
import "react-virtualized/styles.css";
import List from "react-virtualized/dist/commonjs/List";
import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";
import JSONTree from "react-json-tree";
import Resizable from "re-resizable";
function createMoment(time) {
  return moment(time.replace("@d@ ", "").replace("Z #d#", ""));
}

const styles = {
  fontFamily: "sans-serif",
  overflow: "hidden",
  height: "100vh",
  display: "flex"
};

const FileUpload = styled.button`
  border: 0;
  outline: 0;
  height: 32px;
  min-height: 32px;
  max-height: 32px;
  position: relative;
  width: 100%;
  display: flex;
  vertical-align: middle;
  padding: 0px 8px;

  transition: all 50ms;
  cursor: pointer;
  border-bottom: 1px solid #ebebeb;
  &:hover {
    background-color: #1a80fb;
    color: white;
  }

  i {
    position: relative;
    top: 3px;
  }
  overflow: hidden;
`;

class FileSelector extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = e => {
    if (e.target.files.length) {
      const reader = new FileReader();
      reader.readAsText(e.target.files[0]);
      reader.onload = () => {
        this.props.onRead(reader.result);
      };
    }
  };

  render() {
    return (
      <FileUpload onClick={() => this.fileInput.click()}>
        <i className="fa fa-upload fa-fw" aria-hidden="true" />
        <span>Upload Log File</span>
        <input
          style={{
            width: "100%",
            height: "100%",
            opacity: 0,
            position: "absolute",
            zIndex: -1
          }}
          ref={r => (this.fileInput = r)}
          type="file"
          onChange={this.handleChange}
        />
      </FileUpload>
    );
  }
}

const getRowType = row => {
  if (row.action) {
    return row.action.type;
  }
  if (row.data && row.data.jsHeapSizeLimit) {
    return "memory";
  }
  return row.type;
};

const parseText = _.memoize(text => {
  const rawLog = JSON.parse(text) || {};
  const log = rawLog.log || [];
  const types = _.groupBy(
    _.uniq(log.map(getRowType)),
    type => type.split("/")[0]
  );

  return {
    log,
    types
  };
});

const LogView = styled.div`
  max-height: calc(100vh - 64px);
  min-height: calc(100vh - 64px);
  overflow: hidden;
  width: 100vw;
`;

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

const Footer = styled.div`
  display: flex;
  width: 100vw;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #ebebeb;
  padding: 0px 16px;
`;

const TextButton = styled.div`
  display: block;
  outline: 0;
  border: 0;
  color: #1a80fb;
  background-color: transparent;
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

const logRowCount = 150;

const Type = styled.div`
  height: 32;
  font-size: 0.8em;
  border-bottom: 1px solid #ebebeb;
`;

const RowTypes = styled.div`
  /* padding-top: 32px; */
  overflow-y: scroll;
  max-width: 300px;
  height: 100vh;
  min-width: 300px;
  border-right: 1px solid #ebebeb;
  /* background-color: #ebebeb; */
`;

class TypeSelector extends React.Component {
  render() {
    const { types } = this.props;
    const headers = Object.keys(types).sort();

    /**
     * TODO: Add drilldown into specific types
     */
    return (
      <RowTypes>
        <Header>Log Types</Header>
        {headers.map(header => (
          <TypeGroup
            selected={this.props.isSelected(header)}
            key={header}
            onClick={() => this.props.toggleSelection(header)}
          >
            {header}
          </TypeGroup>
        ))}
      </RowTypes>
    );
  }
}

const TypeGroup = styled.div`
  height: 32;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 8px;
  cursor: pointer;
  color: ${props => (props.selected ? "#444444" : "rgba(0, 0, 0, .27)")};
`;

class App extends React.Component {
  state = {
    text: null,
    page: 0,
    selectedRow: {},
    selectedGroups: {}
  };

  isSelected = key => {
    // Default to selected
    if (typeof this.state.selectedGroups[key] === "boolean") {
      return this.state.selectedGroups[key];
    } else {
      return true;
    }
  };

  toggleSelection = key => {
    this.setState(state => ({
      selectedGroups: {
        ...this.state.selectedGroups,
        [key]: !this.isSelected(key)
      }
    }));
  };

  increasePage = max => {
    this.setState(state => ({ page: state.page < max ? state.page + 1 : max }));
  };

  decreasePage = () => {
    this.setState(state => ({ page: state.page !== 0 ? state.page - 1 : 0 }));
  };

  render() {
    const { log, types } = parseText(this.state.text);
    const filteredLog = log.filter(l => this.isSelected(getRowType(l)));
    return (
      <div style={styles}>
        <TypeSelector
          types={types}
          isSelected={this.isSelected}
          toggleSelection={this.toggleSelection}
        />
        <div style={{ flex: 1 }}>
          <FileSelector onRead={text => this.setState({ text })} />
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                width={width}
                rowCount={filteredLog.length}
                rowHeight={32}
                style={{ outline: "none" }}
                rowRenderer={({
                  index, // Index of row
                  isScrolling, // The List is currently being scrolled
                  isVisible, // This row is visible within the List (eg it is not an overscanned row)
                  key, // Unique key within array of rendered rows
                  parent, // Reference to the parent List (instance)
                  style // Style object to be applied to row (to position it);
                  // This must be passed through to the rendered row element.
                }) => {
                  const l = filteredLog[index];
                  return (
                    <LogRow
                      onClick={() => {
                        this.setState({ selectedRow: l });
                      }}
                      log={l}
                      key={key}
                      style={style}
                      selected={this.state.selectedRow.id === l.id}
                    />
                  );
                }}
              />
            )}
          </AutoSizer>
        </div>
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
            background: "#2d3e4f"
          }}
        >
          <div style={{ padding: "0px 8px" }}>
            <JSONTree
              data={this.state.selectedRow}
              invertTheme={false}
              theme={theme}
            />
          </div>
        </Resizable>
      </div>
    );
  }
}

const Row = styled.div`
  height: 32px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  &:hover {
    background-color: #ebebeb;
  }

  div {
    padding: 8px;
  }
`;

const LogRow = ({ log, style, selected, ...props }) => {
  const time = log.time
    ? createMoment(log.time).format("hh:mm:ss")
    : createMoment(log.startTime).format("hh:mm:ss");

  return (
    <Row
      style={{
        ...style,
        backgroundColor: selected && "#1a80fb",
        color: selected && "white"
      }}
      {...props}
    >
      <div>{time}</div>
      <div>{log.action ? log.action.type : log.type}</div>
    </Row>
  );
};

render(<App />, document.getElementById("root"));
