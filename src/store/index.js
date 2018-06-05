import { decorate, observable, computed, toJS } from "mobx";
import _ from "lodash";
import { getRowType, createMoment } from "../util";
import crossfilter from "crossfilter2";
import groupBy from "lodash/groupBy";
import uniq from "lodash/uniq";

const parseText = text => {
  try {
    const rawLog = JSON.parse(text) || {};
    const log = rawLog.log || [];
    const types = _.groupBy(_.uniq(log.map(getRowType)), type => type);
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
  file = {
    name: ""
  };
  selectedRow = {};
  selectedGroups = {
    ajax: false,
    time: false
  };
  parsing = false;

  get parsedLog() {
    return parseText(this.text);
  }

  get selectedRowJson() {
    const res = toJS(this.selectedRow);
    return res;
  }

  get memoryLogs() {
    const log = this.parsedLog.log;
    return log.filter(l => getRowType(l) === "memory").map(l => ({
      ...l.data,
      time: createMoment(l.time),
      x: createMoment(l.time)
        .unix()
        .toString(),
      y: Math.floor((l.data.totalJSHeapSize / l.data.jsHeapSizeLimit) * 100),
      id: l.id.toString()
    }));
  }

  get crossfilter() {
    return crossfilter(this.parsedLog.log);
  }

  get actionDimension() {
    return this.crossfilter.dimension(l => {
      // We need these to be sorted by time but sorting after filtering is
      // mad slow.
      // Luckily crossfilter sorts in natural order by key (in this case type)
      // so we can just prefix the type with the unix timestamp
      const timestamp = createMoment(l.time ? l.time : l.startTime).unix();
      const type = `${timestamp}+${l.action ? l.action.type : getRowType(l)}`;
      return type;
    });
  }

  get types() {
    return groupBy(uniq(log.map(getRowType)), type => type);
  }

  get filteredLog() {
    const searchTerm = this.searchTerm;
    const selectedGroups = this.selectedGroups;
    this.actionDimension.filter(type => {
      if (searchTerm !== "") {
        return type.toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        const baseType = type.split("+")[1];
        return typeof selectedGroups[baseType] === "boolean"
          ? selectedGroups[baseType]
          : true;
      }
    });

    return this.actionDimension.bottom(Infinity);
  }
}

const UIStore = decorate(UI, {
  searchTerm: observable,
  text: observable,
  selectedRow: observable,
  selectedGroups: observable,
  parsedLog: computed,
  filteredLog: computed,
  selectedRowJson: computed,
  file: observable,
  crossfilter: computed,
  actionDimension: computed,
  parsing: observable,
  types: computed
});

export default new UIStore();
