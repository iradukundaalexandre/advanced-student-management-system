import { useCallback, useMemo, useRef, useState } from 'react'
import {
  GraduationCap, LayoutDashboard, Users, UserPlus, Search, Bell, Settings,
  MoreHorizontal, Eye, Trash2, Pencil, X, ChevronDown, Download, Filter,
  ArrowUpRight, BookOpen, UserCheck, Clock3, Menu, CheckCircle2, AlertCircle
} from 'lucide-react'
import { initialStudents } from './data/initialStudents'
import { useDebounce } from './hooks/useDebounce'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useThrottle } from './hooks/useThrottle'

const blankForm = { firstName: '', lastName: '', email: '', phone: '', gender: '', course: '', year: '', address: '' }
const readStudents = () => {
  try { return JSON.parse(localStorage.getItem('edumanage_students')) || initialStudents }
  catch { return initialStudents }
}
const fullName = (student) => `${student.firstName} ${student.lastName}`

function App() {
  const [students, setStudents] = useState(readStudents)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [courseFilter, setCourseFilter] = useState('All')
  const [activeTab, setActiveTab] = useState('Students')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(blankForm)
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState('')
  const searchRef = useRef(null)
  const debouncedQuery = useDebounce(query, 350)

  const persist = (next) => {
    setStudents(next)
    localStorage.setItem('edumanage_students', JSON.stringify(next))
  }
  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }
  const openSearch = useCallback(() => searchRef.current?.focus(), [])
  const closeDetails = useCallback(() => setSelected(null), [])
  useKeyboardShortcuts({ onSearch: openSearch, onEscape: closeDetails })

  const filteredStudents = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase()
    return students.filter((student) => {
      const matchesText = !term || [student.id, fullName(student), student.email, student.course].some(v => v.toLowerCase().includes(term))
      const matchesStatus = statusFilter === 'All' || student.status === statusFilter
      const matchesCourse = courseFilter === 'All' || student.course === courseFilter
      return matchesText && matchesStatus && matchesCourse
    })
  }, [students, debouncedQuery, statusFilter, courseFilter])

  const activeCount = students.filter(s => s.status === 'Active').length
  const courses = [...new Set(students.map(s => s.course))]

  const openAdd = () => { setEditingId(null); setForm(blankForm); setErrors({}); setShowForm(true) }
  const openEdit = (student) => {
    setEditingId(student.id)
    setForm({ firstName: student.firstName, lastName: student.lastName, email: student.email, phone: student.phone, gender: student.gender, course: student.course, year: student.year, address: student.address })
    setErrors({})
    setShowForm(true)
  }
  const validate = () => {
    const next = {}
    if (!form.firstName.trim()) next.firstName = 'First name is required'
    if (!form.lastName.trim()) next.lastName = 'Last name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address'
    if (!form.phone.trim()) next.phone = 'Phone number is required'
    if (!form.gender) next.gender = 'Choose a gender'
    if (!form.course) next.course = 'Choose a course'
    if (!form.year) next.year = 'Choose a level'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  // Form submit event + controlled inputs.
  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validate()) return
    if (editingId) {
      persist(students.map(s => s.id === editingId ? { ...s, ...form } : s))
      notify('Student record updated successfully')
    } else {
      const student = { ...form, id: `STU-${Date.now().toString().slice(-6)}`, status: 'Active', joined: new Date().toISOString().slice(0, 10) }
      persist([student, ...students])
      notify('Student registered successfully')
    }
    setShowForm(false)
  }

  // Throttling prevents rapid repeated delete actions.
  const throttledDelete = useThrottle((id) => {
    const target = students.find(s => s.id === id)
    persist(students.filter(s => s.id !== id))
    if (selected?.id === id) setSelected(null)
    notify(`${target ? fullName(target) : 'Student'} deleted`)
  }, 1000)

  const handleDelete = (event, id) => {
    event.stopPropagation()
    if (window.confirm('Delete this student record? This action cannot be undone.')) {
      if (!throttledDelete(id)) notify('Please wait before repeating this action')
    }
  }

  // Demonstrates event bubbling: clicking the row opens details, while action buttons stop propagation.
  const handleRowClick = (student) => setSelected(student)

  const exportCsv = () => {
    const headers = ['ID', 'First name', 'Last name', 'Email', 'Phone', 'Course', 'Level', 'Status']
    const rows = filteredStudents.map(s => [s.id, s.firstName, s.lastName, s.email, s.phone, s.course, s.year, s.status])
    const csv = [headers, ...rows].map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const link = document.createElement('a'); link.href = url; link.download = 'students.csv'; link.click()
    URL.revokeObjectURL(url)
    notify('Student list exported')
  }

  const statCards = [
    { label: 'Total students', value: students.length, note: 'All registered records', icon: Users, tone: 'violet' },
    { label: 'Active students', value: activeCount, note: 'Currently enrolled', icon: UserCheck, tone: 'green' },
    { label: 'Courses', value: courses.length, note: 'Programs available', icon: BookOpen, tone: 'blue' },
    { label: 'Inactive / graduated', value: students.length - activeCount, note: 'Not currently active', icon: Clock3, tone: 'orange' }
  ]

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><GraduationCap size={23}/></div><div><strong>EduManage</strong><small>ADMIN PORTAL</small></div></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          <button className={`nav-item ${activeTab === 'Overview' ? 'active' : ''}`} onClick={() => setActiveTab('Overview')}><LayoutDashboard size={18}/> Overview</button>
          <button className={`nav-item ${activeTab === 'Students' ? 'active' : ''}`} onClick={() => setActiveTab('Students')}><Users size={18}/> Students <span className="nav-count">{students.length}</span></button>
          <button className="nav-item" onClick={openAdd}><UserPlus size={18}/> Register student</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon">✦</div><strong>Need a hand?</strong><p>Use the keyboard shortcuts to work faster.</p><span>Ctrl / ⌘ + K&nbsp; Search</span><span>Esc&nbsp; Close details</span></div>
          <button className="nav-item"><Settings size={18}/> Settings</button>
          <div className="profile"><div className="avatar admin-avatar">AD</div><div><strong>Administrator</strong><small>System admin</small></div><MoreHorizontal size={19}/></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="slash">/</span><strong>{activeTab}</strong></div>
          <div className="top-actions"><span className="date-label">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span><button className="icon-button" aria-label="Notifications"><Bell size={19}/><i/></button><div className="avatar admin-avatar">AD</div></div>
        </header>

        <section className="page-heading">
          <div><div className="eyebrow">SCHOOL ADMINISTRATION</div><h1>{activeTab === 'Overview' ? 'Dashboard overview' : 'Student management'}</h1><p>Manage student records, enrollment and academic information.</p></div>
          <button className="primary-button" onClick={openAdd}><UserPlus size={17}/> Register student</button>
        </section>

        <section className="stats-grid">
          {statCards.map(({ label, value, note, icon: Icon, tone }) => <article className="stat-card" key={label}><div className={`stat-icon ${tone}`}><Icon size={20}/></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></article>)}
        </section>

        <section className="content-card">
          <div className="card-heading"><div><h2>All students <span className="count-pill">{filteredStudents.length}</span></h2><p>View and manage your student directory</p></div><button className="outline-button" onClick={exportCsv}><Download size={16}/> Export CSV</button></div>
          <div className="toolbar">
            <div className="search-box"><Search size={17}/><input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, ID, email or course..." /><kbd>⌘ K</kbd></div>
            <div className="filter-wrap"><Filter size={16}/><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Filter by status"><option>All</option><option>Active</option><option>Inactive</option><option>Graduated</option></select><ChevronDown size={14}/></div>
            <div className="filter-wrap course-filter"><select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} aria-label="Filter by course"><option>All</option>{courses.map(c => <option key={c}>{c}</option>)}</select><ChevronDown size={14}/></div>
          </div>

          <div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>STUDENT ID</th><th>COURSE / LEVEL</th><th>ENROLLMENT DATE</th><th>STATUS</th><th className="actions-heading">ACTIONS</th></tr></thead>
            <tbody>
              {filteredStudents.map(student => <tr key={student.id} onClick={() => handleRowClick(student)} className="student-row" tabIndex="0" onKeyDown={e => e.key === 'Enter' && handleRowClick(student)}>
                <td><div className="student-cell"><div className={`avatar student-avatar avatar-${student.firstName.charCodeAt(0) % 5}`}>{student.firstName[0]}{student.lastName[0]}</div><div><strong>{fullName(student)}</strong><small>{student.email}</small></div></div></td>
                <td><span className="id-text">{student.id}</span></td><td><strong className="course-name">{student.course}</strong><small className="table-sub">{student.year}</small></td>
                <td className="date-cell">{new Date(`${student.joined}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td><span className={`status status-${student.status.toLowerCase()}`}><i/>{student.status}</span></td>
                <td><div className="row-actions"><button title="View details" onClick={e => { e.stopPropagation(); setSelected(student) }}><Eye size={16}/></button><button title="Edit student" onClick={e => { e.stopPropagation(); openEdit(student) }}><Pencil size={16}/></button><button title="Delete student" className="delete-action" onClick={e => handleDelete(e, student.id)}><Trash2 size={16}/></button></div></td>
              </tr>)}
              {filteredStudents.length === 0 && <tr><td colSpan="6"><div className="empty-state"><Search size={26}/><strong>No students found</strong><span>Try another search term or change your filters.</span></div></td></tr>}
            </tbody>
          </table></div>
          <div className="table-footer"><span>Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> students</span><span>Changes are saved automatically <CheckCircle2 size={14}/></span></div>
        </section>
        <footer className="footer"><span>© 2026 EduManage. Student administration portal.</span><span>Built with React <span className="footer-dot">•</span> Local demo</span></footer>
      </main>

      {showForm && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setShowForm(false)}><section className="modal form-modal"><div className="modal-header"><div><div className="eyebrow">STUDENT RECORD</div><h2>{editingId ? 'Edit student' : 'Register new student'}</h2><p>Enter the student's information below.</p></div><button className="close-button" onClick={() => setShowForm(false)}><X size={20}/></button></div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-section-title">Personal information</div><div className="form-grid">
            <Field label="First name" error={errors.firstName}><input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} placeholder="e.g. Aline"/></Field>
            <Field label="Last name" error={errors.lastName}><input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} placeholder="e.g. Uwase"/></Field>
            <Field label="Email address" error={errors.email}><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="student@example.com"/></Field>
            <Field label="Phone number" error={errors.phone}><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+250 7XX XXX XXX"/></Field>
            <Field label="Gender" error={errors.gender}><select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}><option value="">Select gender</option><option>Female</option><option>Male</option><option>Other</option></select></Field>
            <Field label="Address"><input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="City, country"/></Field>
          </div>
          <div className="form-section-title second-section">Academic information</div><div className="form-grid">
            <Field label="Course" error={errors.course}><select value={form.course} onChange={e => setForm({...form, course: e.target.value})}><option value="">Select course</option><option>Software Development</option><option>Computer Science</option><option>Networking</option><option>Information Technology</option><option>Computer Systems</option><option>Accounting</option></select></Field>
            <Field label="Academic level" error={errors.year}><select value={form.year} onChange={e => setForm({...form, year: e.target.value})}><option value="">Select level</option>{['Level 1','Level 2','Level 3','Level 4','Level 5','Level 6'].map(v => <option key={v}>{v}</option>)}</select></Field>
          </div>
          <div className="form-actions"><button type="button" className="outline-button" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="primary-button">{editingId ? 'Save changes' : 'Register student'}</button></div>
        </form>
      </section></div>}

      {selected && <div className="detail-backdrop" onMouseDown={e => e.target === e.currentTarget && setSelected(null)}><aside className="detail-panel"><div className="detail-top"><span>STUDENT PROFILE</span><button className="close-button" onClick={() => setSelected(null)}><X size={20}/></button></div><div className="detail-person"><div className="avatar detail-avatar">{selected.firstName[0]}{selected.lastName[0]}</div><h2>{fullName(selected)}</h2><p>{selected.id}</p><span className={`status status-${selected.status.toLowerCase()}`}><i/>{selected.status}</span></div><div className="detail-actions"><button className="outline-button" onClick={() => { openEdit(selected); setSelected(null) }}><Pencil size={16}/> Edit profile</button><button className="outline-button" onClick={e => handleDelete(e, selected.id)}><Trash2 size={16}/> Delete</button></div><div className="detail-section"><h3>Contact information</h3><Detail label="Email address" value={selected.email}/><Detail label="Phone number" value={selected.phone}/><Detail label="Address" value={selected.address || 'Not provided'}/><Detail label="Gender" value={selected.gender}/></div><div className="detail-section"><h3>Academic information</h3><Detail label="Course" value={selected.course}/><Detail label="Academic level" value={selected.year}/><Detail label="Enrollment date" value={selected.joined}/></div><div className="detail-note"><AlertCircle size={16}/> Student records are stored in this browser's local storage for this demo.</div></aside></div>}

      {toast && <div className="toast"><CheckCircle2 size={17}/>{toast}</div>}
    </div>
  )
}

function Field({ label, error, children }) {
  return <label className="field"><span>{label}</span>{children}{error && <small className="field-error">{error}</small>}</label>
}
function Detail({ label, value }) {
  return <div className="detail-row"><span>{label}</span><strong>{value || 'Not provided'}</strong></div>
}

export default App
