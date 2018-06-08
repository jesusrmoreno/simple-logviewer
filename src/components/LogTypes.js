import React from "react";
import styled from "styled-components";
import { observer, inject } from "mobx-react";
import keyBy from "lodash/keyBy";

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
  color: ${props => (props.selected ? "#444444" : "rgba(0, 0, 0, .27)")};
  &:hover {
    background-color: #ebebeb;
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

      turnAllOffExcept = except => {
        const { store } = this.props;
        const { types } = store;
        const keyed = keyBy(types);
        Object.keys(keyed).forEach(k => {
          keyed[k] = k === except ? true : false;
        });
        store.selectedGroups = keyed;
      };

      isSelected = (selectedGroups, key) =>
        typeof selectedGroups[key] === "boolean" ? selectedGroups[key] : true;

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
                  selected={selected}
                  key={header}
                  onClick={() => this.toggleSelection(header)}
                  onContextMenu={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.turnAllOffExcept(header);
                  }}
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
