import React from "react";
import styled from "styled-components";
import get from "lodash/get";
import omit from "lodash/omit";

class Text extends React.Component {
  render() {
    const { as = "div", children, className, ...props } = this.props;
    const DynamicTag = as;
    return (
      <DynamicTag className={className} {...omit(props, ["light"])}>
        {children}
      </DynamicTag>
    );
  }
}

const regular = 400;
const semibold = 600;

const typo = {
  body: {
    fontSize: "12px",
    fontWeight: regular
  },
  meta: {
    fontSize: "11px",
    fontWeight: semibold
  },
};

const StyledText = styled(Text)`
  font-size: ${props => get(typo, [props.type, "fontSize"], "15px")};
  font-weight: ${props => get(typo, [props.type, "fontWeight"], regular)};
  color: ${props => (props.light ? "white" : "#444444")};
  text-transform: ${props => (props.transform ? props.transform : null)};
`;

export default StyledText;
