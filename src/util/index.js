import moment from "moment";

function createMoment(time) {
  return moment.utc(time.replace("@d@ ", "").replace("Z #d#", "")).local();
}

const getRowType = row => {
  if (row.action) {
    return row.action.type;
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
