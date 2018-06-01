import moment from "moment";

function createMoment(time) {
  return moment(time.replace("@d@ ", "").replace("Z #d#", ""));
}

const getRowType = row => {
  if (row.action) {
    return row.action.type.split("/")[0];
  }
  if (row.data) {
    if (row.data.jsHeapSizeLimit) {
      return "memory";
    }
  }
  if (row.level) {
    return row.level;
  }
  return row.type;
};

export { getRowType, createMoment };
