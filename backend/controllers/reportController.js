const fs = require("fs");
const path = require("path");
const Session = require("../models/Session");
const User = require("../models/User");
const { generateChallan } = require("../services/pdfService");
const { exportCSV, exportExcel } = require("../services/exportService");
const logger = require("../utils/logger");

// @route  GET /api/report/:sessionId
// @access Operator+
const downloadReport = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    if (
      req.user.role === "operator" &&
      session.operatorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const operator = await User.findById(session.operatorId);

    // Reuse existing report if already generated
    if (session.reportPath && fs.existsSync(session.reportPath)) {
      return res.download(session.reportPath);
    }

    const reportPath = await generateChallan(session, operator);

    // Save report path to session
    session.reportPath = reportPath;
    await session.save();

    res.download(reportPath);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/export/:sessionId/csv
// @access Manager+
const exportSessionCSV = async (req, res, next) => {
  try {
    const csv = await exportCSV(req.params.sessionId);
    if (!csv) {
      return res.status(404).json({ success: false, message: "No logs found for this session" });
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=session-${req.params.sessionId}-logs.csv`
    );
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/export/:sessionId/excel
// @access Manager+
const exportSessionExcel = async (req, res, next) => {
  try {
    const workbook = await exportExcel(req.params.sessionId);
    if (!workbook) {
      return res.status(404).json({ success: false, message: "No logs found for this session" });
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=session-${req.params.sessionId}-logs.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

module.exports = { downloadReport, exportSessionCSV, exportSessionExcel };