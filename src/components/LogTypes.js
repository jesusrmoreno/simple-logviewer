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
  padding: 8px;
  cursor: pointer;
  color: #444444;
  background-color: ${props => {
    return props.selected ? colorHash.hex(props.type) : null;
  }}
  color: ${props => (props.selected ? "white" : "#444444")};
  &:hover {
    background-color: ${props => (props.selected ? null : "#ebebeb")};
  }
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

export default TypeSelector;
