// src/App.js
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [logs, setLogs] = useState([]);
  const [radio, setRadio] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20); // rows per page
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const fetchLogs = async (opts = {}) => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (radio) params.radio = radio;
      if (from) params.from = from;
      if (to) params.to = to;
      if (opts.page) params.page = opts.page;

      const res = await axios.get("http://localhost:5000/api/logs", { params });
      setLogs(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setLogs([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  // initial load and when page changes
 useEffect(() => {
  // fetch immediately
  fetchLogs();

  // auto-refresh every 10 seconds
  const interval = setInterval(() => {
    fetchLogs();
  }, 10000);

  // cleanup when component unmounts
  return () => clearInterval(interval);

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [page]);
;

  // debounce search input to avoid too many calls
  const onRadioChange = (e) => {
    const val = e.target.value;
    setRadio(val);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchLogs({ page: 1 });
    }, 400);
  };

  const onApplyFilters = () => {
    setPage(1);
    fetchLogs({ page: 1 });
  };

  const onReset = () => {
    setRadio("");
    setFrom("");
    setTo("");
    setPage(1);
    fetchLogs({ page: 1 });
  };

  const prevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };
  const nextPage = () => {
    if (meta && page < meta.totalPages) setPage(p => p + 1);
  };

  const formatDateTime = (dt) => {
    if (!dt) return "-";
    const d = new Date(dt);
    return d.toLocaleString();
  };

  return (
    <div className="container">
      <h1>📻 Radio Logs</h1>

      <div className="controls">
        <input
          className="search-input"
          placeholder="Search..."
          value={radio}
          onChange={onRadioChange}
        />
        <label>
          From
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </label>
        <label>
          To
          <input type="date" value={to} onChange={e => setTo(e.target.value)} />
        </label>
        <button onClick={onApplyFilters}>Apply</button>
        <button onClick={onReset}>Reset</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <>
          <table className="logs-table">
            <thead>
              <tr>
                <th className="hidden-id">ID</th> {/* still exists but hidden */}
                <th>Date & Time</th>
                <th>Radio</th>
                <th>Status</th>
                <th>Issue</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan="5">No logs found</td></tr>
              ) : logs.map(log => (
                <tr key={log.id}>
                  <td className="hidden-id">{log.id}</td>
                  <td>{formatDateTime(log.date_time)}</td>
                  <td>{log.radio}</td>
                  <td>{log.status}</td>
                  <td>{log.issue || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button onClick={prevPage} disabled={page <= 1}>Prev</button>
            <span>Page {meta?.page ?? page} of {meta?.totalPages ?? "?"} — {meta?.total ?? 0} records</span>
            <button onClick={nextPage} disabled={meta ? page >= meta.totalPages : true}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;

