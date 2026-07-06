import { useEffect, useMemo, useState } from 'react';
import {
  getApplications,
  getStats,
  createApplication,
  updateApplication,
  deleteApplication,
} from './api';

const STATUSES = ['Applied', 'Under Review', 'Interview', 'Offer', 'Rejected'];

const emptyForm = {
  company: '',
  role: '',
  location: '',
  status: 'Applied',
  dateApplied: new Date().toISOString().slice(0, 10),
  notes: '',
};

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  return <span className={`badge badge-${status.replace(/\s+/g, '-').toLowerCase()}`}>{status}</span>;
}

export default function App() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [apps, statsData] = await Promise.all([getApplications(), getStats()]);
      setApplications(apps);
      setStats(statsData);
    } catch (err) {
      setError('Could not reach the API. Is the backend running on port 4000?');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      const matchesSearch =
        a.company.toLowerCase().includes(search.toLowerCase()) ||
        a.role.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  function openNewForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(app) {
    setForm(app);
    setEditingId(app.id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateApplication(editingId, form);
      } else {
        await createApplication(form);
      }
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError('Could not save the application.');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this application?')) return;
    try {
      await deleteApplication(id);
      await loadData();
    } catch (err) {
      setError('Could not delete the application.');
    }
  }

  async function handleStatusChange(app, newStatus) {
    try {
      await updateApplication(app.id, { ...app, status: newStatus });
      await loadData();
    } catch (err) {
      setError('Could not update the status.');
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Job Application Tracker</h1>
        <button className="btn btn-primary" onClick={openNewForm}>
          + Add Application
        </button>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {stats && (
        <div className="stats-row">
          <StatCard label="Total Applications" value={stats.total} />
          <StatCard label="Response Rate" value={`${stats.responseRate}%`} />
          {STATUSES.map((s) => (
            <StatCard key={s} label={s} value={stats.byStatus[s] || 0} />
          ))}
        </div>
      )}

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by company or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="empty-state">Loading applications...</p>
      ) : filtered.length === 0 ? (
        <p className="empty-state">No applications found. Add your first one!</p>
      ) : (
        <table className="apps-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Location</th>
              <th>Applied On</th>
              <th>Status</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((app) => (
              <tr key={app.id}>
                <td>{app.company}</td>
                <td>{app.role}</td>
                <td>{app.location}</td>
                <td>{app.dateApplied}</td>
                <td>
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app, e.target.value)}
                    className={`status-select status-${app.status.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="notes-cell">{app.notes}</td>
                <td className="actions-cell">
                  <button className="btn-link" onClick={() => openEditForm(app)}>
                    Edit
                  </button>
                  <button className="btn-link btn-danger" onClick={() => handleDelete(app.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <h2>{editingId ? 'Edit Application' : 'New Application'}</h2>

            <label>
              Company
              <input
                required
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </label>

            <label>
              Role
              <input
                required
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
            </label>

            <label>
              Location
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </label>

            <label>
              Date Applied
              <input
                type="date"
                value={form.dateApplied}
                onChange={(e) => setForm({ ...form, dateApplied: e.target.value })}
              />
            </label>

            <label>
              Status
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Notes
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>

            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
