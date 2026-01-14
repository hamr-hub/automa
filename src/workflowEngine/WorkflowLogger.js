import dbLogs, { defaultLogItem } from '@/db/logs';

class WorkflowLogger {
  async add({ detail, history, ctxData, data }) {
    const logDetail = { ...defaultLogItem, ...detail };

    await Promise.all([
      dbLogs.logsData.add(data),
      dbLogs.ctxData.add(ctxData),
      dbLogs.items.add(logDetail),
      dbLogs.histories.add(history),
    ]);
  }
}

export default WorkflowLogger;
