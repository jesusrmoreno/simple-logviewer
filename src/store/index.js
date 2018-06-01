import { decorate, observable, computed, toJS } from "mobx";
import _ from "lodash";
import { getRowType, createMoment } from "../util";

const parseText = text => {
  try {
    const rawLog = JSON.parse(text) || {};
    const log = rawLog.log || [];
    const types = _.groupBy(
      _.uniq(log.map(getRowType)),
      type => type.split("/")[0]
    );
    const {
      cabSessionID,
      cabLoginID,
      loginName,
      database,
      userAgent,
      appUrl,
      sessionStartTime,
      status,
      statusTime,
      numErrors,
      buildCommitHash,
      buildTime,
      logUploadPending
    } = rawLog;
    return {
      log,
      types,
      meta: {
        cabSessionID,
        cabLoginID,
        loginName,
        database,
        userAgent,
        appUrl,
        sessionStartTime,
        status,
        statusTime,
        numErrors,
        buildCommitHash,
        buildTime,
        logUploadPending
      }
    };
  } catch (e) {
    return { log: [], types: [], meta: {} };
  }
};

class UI {
  searchTerm = "";
  text = "";
  selectedRow = {};
  selectedGroups = {};

  get parsedLog() {
    return parseText(this.text);
  }

  get selectedRowJson() {
    return toJS(this.selectedRow);
  }

  get memoryLogs() {
    const log = this.parsedLog.log;
    return log.filter(l => getRowType(l) === "memory").map(l => ({
      ...l.data,
      time: createMoment(l.time),
      x: createMoment(l.time)
        .unix()
        .toString(),
      y: Math.floor(l.data.totalJSHeapSize / l.data.jsHeapSizeLimit * 100),
      id: l.id.toString()
    }));
  }

  get filteredLog() {
    const searchTerm = this.searchTerm;
    const selectedGroups = this.selectedGroups;
    return this.parsedLog.log.filter(l => {
      if (searchTerm !== "") {
        return getRowType(l)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      } else {
        return typeof selectedGroups[getRowType(l)] === "boolean"
          ? selectedGroups[getRowType(l)]
          : true;
      }
    });
  }
}

const UIStore = decorate(UI, {
  searchTerm: observable,
  text: observable,
  selectedRow: observable,
  selectedGroups: observable,
  parsedLog: computed,
  filteredLog: computed,
  selectedRowJson: computed
});

export default new UIStore();
