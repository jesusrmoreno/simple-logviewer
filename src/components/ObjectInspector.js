import React from "react";
import { inject, observer } from "mobx-react";
import JSONTree from "react-json-tree";
import Resizable from "re-resizable";

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

const ObjectInspector = inject("store")(
  observer(({ store }) => {
    return (
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
              data={store.parsedLog.meta}
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
    );
  })
);

export default ObjectInspector;
