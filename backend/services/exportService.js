const ExcelJS = require("exceljs");
const { Parser } = require("json2csv");
const Log = require("../models/Log");
const logger = require("../utils/logger");

const getLogsForExport = async (sessionId) => {
  const logs = await Log.find({ sessionId }).sort({ frameNumber: 1 });
  return logs.map((l) => ({
    frameNumber:  l.frameNumber,
    timestamp:    new Date(l.timestamp).toLocaleString(),
    boxCount:     l.boxCount,
    fps:          l.fps,
    sessionId:    l.sessionId.toString(),
  }));
};

// Export as CSV
const exportCSV = async (sessionId) => {
  const data = await getLogsForExport(sessionId);
  if (!data.length) return null;
  const parser = new Parser({
    fields: ["frameNumber", "timestamp", "boxCount", "fps", "sessionId"],
  });
  return parser.parse(data);
};

// Export as Excel
const exportExcel = async (sessionId) => {
  const data = await getLogsForExport(sessionId);
  if (!data.length) return null;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AgniSight-AI";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Detection Logs");

  // Header row styling
  sheet.columns = [
    { header: "Frame #",    key: "frameNumber", width: 12 },
    { header: "Timestamp",  key: "timestamp",   width: 25 },
    { header: "Box Count",  key: "boxCount",    width: 12 },
    { header: "FPS",        key: "fps",         width: 10 },
    { header: "Session ID", key: "sessionId",   width: 28 },
  ];

  sheet.getRow(1).eachCell((cell) => {
    cell.fill = {
      type: "pattern", pattern: "solid",
      fgColor: { argb: "FF1F4E79" },
    };
    cell.font   = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  sheet.getRow(1).height = 22;

  // Data rows
  data.forEach((row, i) => {
    const r = sheet.addRow(row);
    r.eachCell((cell) => {
      cell.fill = {
        type: "pattern", pattern: "solid",
        fgColor: { argb: i % 2 === 0 ? "FFF0F7FF" : "FFFFFFFF" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });
  });

  logger.info(`Excel export prepared for session ${sessionId} — ${data.length} rows`);
  return workbook;
};

module.exports = { exportCSV, exportExcel };