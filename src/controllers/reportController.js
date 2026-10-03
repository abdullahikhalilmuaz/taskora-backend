const Task = require('../models/Task');
const User = require('../models/User');
const { buildReportPDF } = require('../utils/pdfGenerator');

const getReportData = async (reportType, startDate, endDate) => {
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const query = {};
  if (Object.keys(dateFilter).length) query.createdAt = dateFilter;

  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email department')
    .populate('createdBy', 'name email');

  if (reportType === 'employee') {
    const employees = await User.find({ userType: 'employee' }).select('-password');
    const rows = employees
      .map((emp) => {
        const empTasks = tasks.filter((t) => t.assignedTo && t.assignedTo._id.toString() === emp._id.toString());
        const completed = empTasks.filter((t) => t.status === 'Completed').length;
        return {
          name: emp.name,
          department: emp.department,
          assigned: empTasks.length,
          completed,
          inProgress: empTasks.filter((t) => t.status === 'In Progress').length,
          pending: empTasks.filter((t) => t.status === 'Pending').length,
          rate: empTasks.length ? ((completed / empTasks.length) * 100).toFixed(1) : '0.0',
        };
      })
      .filter((r) => r.assigned > 0);
    return { type: 'Employee Performance Report', rows };
  }

  if (reportType === 'department') {
    const depts = [...new Set(tasks.map((t) => t.department))];
    const rows = depts.map((d) => {
      const dTasks = tasks.filter((t) => t.department === d);
      const completed = dTasks.filter((t) => t.status === 'Completed').length;
      return {
        department: d,
        total: dTasks.length,
        completed,
        inProgress: dTasks.filter((t) => t.status === 'In Progress').length,
        pending: dTasks.filter((t) => t.status === 'Pending').length,
        rate: dTasks.length ? ((completed / dTasks.length) * 100).toFixed(1) : '0.0',
      };
    });
    return { type: 'Department Performance Report', rows };
  }

  // default: completion
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  const summary = {
    total,
    completed,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
    pending: tasks.filter((t) => t.status === 'Pending').length,
    overdue: tasks.filter((t) => new Date(t.deadline) < new Date() && t.status !== 'Completed').length,
    completionRate: total ? ((completed / total) * 100).toFixed(1) : '0.0',
    byPriority: {
      low: tasks.filter((t) => t.priority === 'Low').length,
      medium: tasks.filter((t) => t.priority === 'Medium').length,
      high: tasks.filter((t) => t.priority === 'High').length,
      critical: tasks.filter((t) => t.priority === 'Critical').length,
    },
  };
  return { type: 'Task Completion Report', summary, tasks };
};

const getReport = async (req, res, next) => {
  try {
    const { type = 'completion', startDate, endDate } = req.query;
    const data = await getReportData(type, startDate, endDate);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

const exportReportPDF = async (req, res, next) => {
  try {
    const { type = 'completion', startDate, endDate } = req.query;
    const data = await getReportData(type, startDate, endDate);
    const period =
      (startDate ? new Date(startDate).toLocaleDateString() : 'Beginning') +
      ' to ' +
      (endDate ? new Date(endDate).toLocaleDateString() : 'Today');

    const sections = [];

    if (type === 'completion' && data.summary) {
      const s = data.summary;
      sections.push({
        type: 'kv',
        heading: 'Summary',
        data: [
          { label: 'Total Tasks', value: s.total },
          { label: 'Completed', value: s.completed },
          { label: 'In Progress', value: s.inProgress },
          { label: 'Pending', value: s.pending },
          { label: 'Overdue', value: s.overdue },
          { label: 'Completion Rate', value: s.completionRate + '%' },
        ],
      });
      sections.push({
        type: 'table',
        heading: 'Tasks by Priority',
        columns: ['Priority', 'Count'],
        rows: [
          ['Low', s.byPriority.low],
          ['Medium', s.byPriority.medium],
          ['High', s.byPriority.high],
          ['Critical', s.byPriority.critical],
        ],
      });
    } else if (type === 'employee') {
      sections.push({
        type: 'table',
        heading: 'Employee Performance',
        columns: ['Name', 'Dept', 'Assigned', 'Completed', 'Progress', 'Pending', 'Rate'],
        rows: data.rows.map((r) => [r.name, r.department, r.assigned, r.completed, r.inProgress, r.pending, r.rate + '%']),
      });
    } else if (type === 'department') {
      sections.push({
        type: 'table',
        heading: 'Department Overview',
        columns: ['Department', 'Total', 'Completed', 'Progress', 'Pending', 'Rate'],
        rows: data.rows.map((r) => [r.department, r.total, r.completed, r.inProgress, r.pending, r.rate + '%']),
      });
    }

    buildReportPDF(res, { title: data.type, period, sections });
  } catch (err) {
    next(err);
  }
};

module.exports = { getReport, exportReportPDF };
