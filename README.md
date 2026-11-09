# EduManage — Advanced Student Management System

A React + Vite administrator dashboard demonstrating the nine requested React event-handling requirements.

## Requirements
- Node.js 18 or newer
- npm

## Run locally
1. Extract `advanced-student-management-system.zip`.
2. Open the extracted folder in VS Code.
3. Open the VS Code terminal in the project folder.
4. Run:

```bash
npm install
npm run dev
```

5. Open the local URL printed by Vite (normally `http://localhost:5173`).

To create a production build:

```bash
npm run build
npm run preview
```

## Functional requirements demonstrated

| # | Requirement | Where it is implemented |
|---|---|---|
| 1 | Register students with controlled components | Registration form state and `value` / `onChange` in `src/App.jsx` |
| 2 | Display students using dynamic lists and `map()` | Student table, stats, filters and select options |
| 3 | Search students with debouncing | `useDebounce` custom hook in `src/hooks/useDebounce.js` |
| 4 | Delete students with event handling and `filter()` | `handleDelete` and `students.filter()` in `src/App.jsx` |
| 5 | View student details by passing arguments | `handleRowClick(student)` and `setSelected(student)` |
| 6 | Validate registration form events | `handleSubmit(event)`, `preventDefault()` and `validate()` |
| 7 | Detect keyboard shortcuts with custom hooks | `useKeyboardShortcuts`; Ctrl/Cmd + K focuses search, Escape closes details |
| 8 | Handle nested clicks / event bubbling | Row click opens details; action buttons use `stopPropagation()` |
| 9 | Prevent repeated actions with throttling | `useThrottle` custom hook protects delete actions |

## Features
- Add, edit, view and delete student records
- Search by student name, ID, email or course
- Filter by status and course
- Registration validation
- CSV export
- Responsive dashboard layout
- Student data saved in browser `localStorage`

## Demo data and storage
The app starts with five sample students. Records are saved in the browser where the app is running. This is a frontend learning project: it does not include a real login system, shared multi-user database, or server API. For production use, connect it to a secure backend and database, and add authentication and authorization.

## Keyboard shortcuts
- `Ctrl + K` on Windows/Linux or `⌘ + K` on macOS: focus the student search.
- `Escape`: close the student details panel.
