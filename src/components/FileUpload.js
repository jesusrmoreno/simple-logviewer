import React from "react";
import styled from "styled-components";
import { observer, inject } from "mobx-react";
import worker from "../util/worker";

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
    border-bottom: 1px solid #1a80fb;
    color: white;
  }

  i {
    position: relative;
    top: 3px;
  }
  overflow: hidden;
`;

const ConnectedFileSelector = inject("store")(
  observer(
    class FileSelector extends React.Component {
      constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
      }
      componentDidMount() {
        worker.onmessage;
      }
      handleChange = e => {
        if (e.target.files.length) {
          const reader = new FileReader();
          const file = e.target.files[0];
          this.props.store.file = file;
          this.props.store.parsing = true;
          reader.readAsText(file);
          reader.onload = () => {
            // worker.postMessage({ type: "parseText", payload: reader.result });
            this.props.store.text = reader.result;
            this.props.store.parsing = false;
          };
        }
      };

      render() {
        const { store } = this.props;
        return (
          <FileUpload onClick={() => this.fileInput.click()}>
            <i className="fa fa-upload fa-fw" aria-hidden="true" />
            <span>
              {store.parsing
                ? "Reading file..."
                : `Click to Open ${store.text !== "" ? "New" : ""} Log File`}
            </span>
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
  )
);

export default ConnectedFileSelector;
