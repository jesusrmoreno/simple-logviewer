// We define this here, otherwise webpack with complain.
// It'll get overriden once we import from the cdn
const _ = null;

const worker = self => {
  const getRowType = () => "hello";
  self.importScripts(
    "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.10/lodash.min.js"
  );
  const parseText = action => {
    const text = action.payload;
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
        type: "parsedText",
        payload: {
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
        }
      };
    } catch (e) {
      return {
        type: "parsedText",
        payload: { log: [], types: [], meta: {} }
      };
    }
  };

  function createReducer(h) {
    return action =>
      typeof h[action.type] === "function"
        ? h[action.type](action)
        : console.log(action);
  }

  const HANDLERS = {
    parseText
  };

  const reducer = createReducer(HANDLERS);

  self.onmessage = e => {
    const action = e.data;
    const res = reducer(action);
    if (res && res.type) {
      self.postMessage(res);
    }
  };
};

let code = worker.toString();
code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));

const blob = new Blob([code], { type: "application/javascript" });
const worker_script = URL.createObjectURL(blob);

export default worker_script;
