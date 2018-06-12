import React from "react";
import styled from "styled-components";
import { observer, inject } from "mobx-react";

import ColorHash from "color-hash";
const colorHash = new ColorHash();

const RowTypes = styled.div`
  flex: 1;
  overflow-y: scroll;
  border-bottom: 1px solid #ebebeb;
`;

const TypeGroup = styled.div`
  height: 32;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  color: #444444;
  display: flex;
  align-items: center;
  overflow: hidden;
  background-color: ${props => {
    return props.selected ? colorHash.hex(props.type) : null;
  }}
  color: ${props => (props.selected ? "white" : "#444444")};
  &:hover {
    background-color: ${props => (props.selected ? null : "#ebebeb")};
  }
`;

const CBWrapper = styled.div`
  display: flex;
  height: 32px;
  width: 32px;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: rgba(0, 0, 0, 0.27);
  }
`;

const Checkbox = inject("store")(
  observer(({ store, type }) => {
    const { shownGroups } = store;
    const checked =
      typeof shownGroups[type] === "boolean" ? shownGroups[type] : true;

    // console.log(shownGroups);
    return (
      <CBWrapper
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          store.shownGroupsIsDirty = true;
          store.shownGroups = {
            ...shownGroups,
            [type]: !checked
          };
        }}
      >
        {checked && (
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              backgroundColor: "rgba(0, 0, 0, 0.27)"
            }}
          />
        )}
      </CBWrapper>
    );
  })
);

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

      isSelected = (selectedGroups, key) => selectedGroups[key];

      render() {
        const { store } = this.props;
        const { types } = store;
        const { selectedGroups } = store;
        const headers = Object.keys(types).sort();
        return (
          <RowTypes>
            {headers.map(header => {
              const selected = this.isSelected(selectedGroups, header);
              return (
                <TypeGroup
                  type={header}
                  selected={selected}
                  key={header}
                  onClick={() => this.toggleSelection(header)}
                >
                  <Checkbox type={header} />
                  <div style={{ paddingLeft: 2, maxWidth: 400 - 32 }}>
                    {header}
                  </div>
                </TypeGroup>
              );
            })}
          </RowTypes>
        );
      }
    }
  )
);

export default TypeSelector;
