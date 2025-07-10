import React, { useState, useReducer, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

// --- START: Type Definitions (Duplicated as needed) ---
/**
 * @typedef {object} KPI
 * @property {string} label
 * @property {number} value
 */

/**
 * @typedef {object} ChartDataPoint
 * @property {string} name
 * @property {number} value
 */
// --- END: Type Definitions ---

function AnalyticsDashboard() {
  // --- START: State Management ---
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // 7 days ago
  const [endDate, setEndDate] = useState(new Date());

  const [kpis, setKpis] = useState([
    { label: 'Total Revenue', value: 123456 },
    { label: 'New Users', value: 789 },
    { label: 'Conversion Rate', value: 0.05 },
  ]);

  const [lineChartData, setLineChartData] = useState([
    { name: 'Day 1', value: 100 },
    { name: 'Day 2', value: 120 },
    { name: 'Day 3', value: 150 },
    { name: 'Day 4', value: 130 },
    { name: 'Day 5', value: 160 },
    { name: 'Day 6', value: 140 },
    { name: 'Day 7', value: 170 },
  ]);

  const [barChartData, setBarChartData] = useState([
    { name: 'Category A', value: 50 },
    { name: 'Category B', value: 80 },
    { name: 'Category C', value: 60 },
    { name: 'Category D', value: 90 },
  ]);

  const [pieChartData, setPieChartData] = useState([
    { name: 'Segment 1', value: 30 },
    { name: 'Segment 2', value: 40 },
    { name: 'Segment 3', value: 30 },
  ]);
  // --- END: State Management ---

  // --- START: Utility Functions (Duplicated as needed) ---
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  // --- END: Utility Functions ---

  // --- START: Handlers ---
  const handleStartDateChange = (e) => {
    setStartDate(new Date(e.target.value));
  };

  const handleEndDateChange = (e) => {
    setEndDate(new Date(e.target.value));
  };
  // --- END: Handlers ---

  // --- START: Chart Colors (Duplicated as needed) ---
  const pieChartColors = ['#0088FE', '#00C49F', '#FFBB28'];
  // --- END: Chart Colors ---

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>

      {/* Date Range Picker */}
      <div className="mb-4 flex items-center space-x-4">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
            Start Date:
          </label>
          <input
            type="date"
            id="start-date"
            className="mt-1 p-2 border rounded-md shadow-sm focus:ring focus:ring-indigo-200 focus:border-indigo-300"
            value={formatDate(startDate)}
            onChange={handleStartDateChange}
          />
        </div>
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
            End Date:
          </label>
          <input
            type="date"
            id="end-date"
            className="mt-1 p-2 border rounded-md shadow-sm focus:ring focus:ring-indigo-200 focus:border-indigo-300"
            value={formatDate(endDate)}
            onChange={handleEndDateChange}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white shadow-md rounded-md p-4">
            <h2 className="text-lg font-semibold">{kpi.label}</h2>
            <p className="text-2xl font-bold">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4">
        {/* Line Chart */}
        <div className="bg-white shadow-md rounded-md p-4">
          <h3 className="text-xl font-semibold mb-2">Daily Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white shadow-md rounded-md p-4">
          <h3 className="text-xl font-semibold mb-2">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white shadow-md rounded-md p-4">
          <h3 className="text-xl font-semibold mb-2">Segment Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieChartColors[index % pieChartColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;