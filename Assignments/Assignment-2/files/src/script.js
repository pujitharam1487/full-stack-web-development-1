// Student Performance Dashboard - script.js
// Phase 2: student management (add, edit, delete, search, filter, validate)
// Phase 3: dynamic dashboard statistics
// Phase 4: analytics and charts
// Phase 5: saving data in localStorage
// Phase 6: sidebar navigation and final polish

/* ---------- Settings ---------- */
const PASS_MARKS = 40;        // overall marks needed to pass
const LOW_MARKS = 50;         // below this is highlighted as low
const LOW_ATTENDANCE = 75;    // below this is highlighted as low

// The four subjects every student has marks for
const SUBJECTS = [
  { key: "maths",    label: "Maths" },
  { key: "science",  label: "Science" },
  { key: "english",  label: "English" },
  { key: "computer", label: "Computer" }
];

const GRADES = ["A", "B", "C", "D", "F"];
const DEPARTMENTS = ["Computer Science", "Electronics", "Mechanical", "Civil"];

// The key under which students are saved in the browser
const STORAGE_KEY = "studentDashboard.students";

/* ---------- Data ---------- */

// Overall marks = average of the four subject marks (rounded)
function calcOverall(subjects) {
  let sum = 0;
  SUBJECTS.forEach((s) => { sum += subjects[s.key]; });
  return Math.round(sum / SUBJECTS.length);
}

// Build one student record from simple values
function makeStudent(id, name, department, marksList, attendance) {
  const subjects = {};
  SUBJECTS.forEach((s, i) => { subjects[s.key] = marksList[i]; });
  return { id, name, department, subjects, marks: calcOverall(subjects), attendance };
}

// Original sample data, shown when the app first opens
// Order of marks: Maths, Science, English, Computer
const SAMPLE_STUDENTS = [
  makeStudent("S101", "Ananya Reddy", "Computer Science", [95, 90, 88, 95], 95),
  makeStudent("S102", "Rahul Verma",  "Electronics",      [80, 75, 72, 85], 88),
  makeStudent("S103", "Priya Sharma", "Mechanical",       [60, 70, 62, 68], 82),
  makeStudent("S104", "Kiran Kumar",  "Civil",            [45, 50, 40, 57], 70),
  makeStudent("S105", "Sneha Patel",  "Computer Science", [88, 82, 80, 90], 92),
  makeStudent("S106", "Arjun Nair",   "Electronics",      [30, 38, 28, 40], 58),
  makeStudent("S107", "Meera Iyer",   "Civil",            [70, 75, 68, 71], 90),
  makeStudent("S108", "Vikram Singh", "Mechanical",       [90, 85, 86, 91], 85)
];

// The working list that the app changes. It is filled by loadStudents() at startup.
const students = [];

// Make a fresh copy of the sample data, so the originals are never changed
function copySamples() {
  return SAMPLE_STUDENTS.map((s) => ({ ...s, subjects: { ...s.subjects } }));
}

let editingId = null;   // ID of the student being edited (null = adding a new one)
let deletingId = null;  // ID of the student waiting for delete confirmation

/* ---------- Page elements ---------- */
const tableBody     = document.getElementById("student-body");
const searchInput   = document.getElementById("search-input");
const deptFilter    = document.getElementById("dept-filter");
const gradeFilter   = document.getElementById("grade-filter");
const addBtn        = document.getElementById("add-btn");
const restoreBtn    = document.getElementById("restore-btn");

// Statistic card values
const statTotal = document.getElementById("stat-total");
const statAvg   = document.getElementById("stat-avg");
const statPass  = document.getElementById("stat-pass");
const statAtt   = document.getElementById("stat-att");

// Analytics areas
const gradeChart   = document.getElementById("grade-chart");
const subjectChart = document.getElementById("subject-chart");
const topList      = document.getElementById("top-list");
const alertList    = document.getElementById("alert-list");

const studentDialog = document.getElementById("student-dialog");
const studentForm   = document.getElementById("student-form");
const dialogTitle   = document.getElementById("dialog-title");
const cancelBtn     = document.getElementById("cancel-btn");

const restoreDialog = document.getElementById("restore-dialog");
const restoreCancel = document.getElementById("restore-cancel");
const restoreConfirm = document.getElementById("restore-confirm");

const confirmDialog = document.getElementById("confirm-dialog");
const confirmText   = document.getElementById("confirm-text");
const confirmCancel = document.getElementById("confirm-cancel");
const confirmDelete = document.getElementById("confirm-delete");

// Form inputs and their error message areas
const fields = {
  id:   { input: document.getElementById("f-id"),   error: document.getElementById("err-id") },
  name: { input: document.getElementById("f-name"), error: document.getElementById("err-name") },
  dept: { input: document.getElementById("f-dept"), error: document.getElementById("err-dept") },
  att:  { input: document.getElementById("f-att"),  error: document.getElementById("err-att") }
};
SUBJECTS.forEach((s) => {
  fields[s.key] = {
    input: document.getElementById("f-" + s.key),
    error: document.getElementById("err-" + s.key)
  };
});

/* ---------- Helpers ---------- */

// Convert marks to a grade letter
function getGrade(marks) {
  if (marks >= 85) return "A";
  if (marks >= 70) return "B";
  if (marks >= 55) return "C";
  if (marks >= 40) return "D";
  return "F";
}

// A student is "at risk" when marks or attendance are low
function isLowMarks(s) { return s.marks < LOW_MARKS; }
function isLowAttendance(s) { return s.attendance < LOW_ATTENDANCE; }

// Make text safe before putting it into HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Show a small success or error message that disappears after 3 seconds
function showToast(message, type) {
  const toast = document.createElement("div");
  toast.className = "toast " + type;
  toast.textContent = message;
  document.getElementById("toast-container").appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ---------- Saving and loading (localStorage) ---------- */

// Is this value a number from 0 to 100?
function isScore(value) {
  return typeof value === "number" && isFinite(value) && value >= 0 && value <= 100;
}

// Check one stored record. Returns true only if it has everything we need.
function isValidStudent(s) {
  if (!s || typeof s !== "object") return false;
  if (typeof s.id !== "string" || s.id.trim() === "") return false;
  if (typeof s.name !== "string" || s.name.trim() === "") return false;
  if (!DEPARTMENTS.includes(s.department)) return false;
  if (!isScore(s.attendance)) return false;
  if (!s.subjects || typeof s.subjects !== "object") return false;
  return SUBJECTS.every((subject) => isScore(s.subjects[subject.key]));
}

// Save the current students. Shows an error if the browser blocks storage.
function saveStudents() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    return true;
  } catch (error) {
    showToast("Could not save changes in this browser.", "error");
    return false;
  }
}

// Replace the contents of the students array
function setStudents(list) {
  students.splice(0, students.length, ...list);
}

// Load students when the page opens
function loadStudents() {
  let raw = null;

  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    // Storage is blocked (for example in private mode): use samples without saving
    setStudents(copySamples());
    return;
  }

  // First visit: nothing saved yet, so start with the sample data
  if (raw === null) {
    setStudents(copySamples());
    saveStudents();
    return;
  }

  // Try to read the saved text
  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    data = null;
  }

  // Saved data must be a list
  if (!Array.isArray(data)) {
    setStudents(copySamples());
    saveStudents();
    showToast("Saved data was damaged, so sample data was loaded.", "error");
    return;
  }

  // Keep valid records only, skip duplicate IDs, and recalculate overall marks
  const seen = new Set();
  const clean = [];
  data.forEach((s) => {
    if (!isValidStudent(s)) return;
    const key = s.id.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    clean.push({
      id: s.id,
      name: s.name,
      department: s.department,
      subjects: { ...s.subjects },
      marks: calcOverall(s.subjects),
      attendance: s.attendance
    });
  });

  // A saved list that had records but none were usable counts as damaged
  if (data.length > 0 && clean.length === 0) {
    setStudents(copySamples());
    saveStudents();
    showToast("Saved data was invalid, so sample data was loaded.", "error");
    return;
  }

  setStudents(clean);

  // Some records were removed: save the cleaned list and tell the user
  if (clean.length < data.length) {
    saveStudents();
    showToast("Some invalid saved records were removed.", "error");
  }
}

// Put the original sample data back
function restoreSamples() {
  setStudents(copySamples());
  saveStudents();

  // Clear search and filters so all students are visible
  searchInput.value = "";
  deptFilter.value = "";
  gradeFilter.value = "";

  restoreDialog.close();
  refreshAll();
  showToast("Sample data restored.", "success");
}

/* ---------- Dashboard statistics ---------- */

// Recalculate every stat card from the students array
function updateStats() {
  const total = students.length;

  // No students: show zeros instead of dividing by zero
  if (total === 0) {
    statTotal.textContent = "0";
    statAvg.textContent   = "0";
    statPass.textContent  = "0%";
    statAtt.textContent   = "0%";
    return;
  }

  let marksSum = 0;
  let attendanceSum = 0;
  let passed = 0;

  students.forEach((s) => {
    marksSum += s.marks;
    attendanceSum += s.attendance;
    if (s.marks >= PASS_MARKS) passed++;
  });

  statTotal.textContent = total;
  statAvg.textContent   = (marksSum / total).toFixed(1);
  statPass.textContent  = ((passed / total) * 100).toFixed(1) + "%";
  statAtt.textContent   = (attendanceSum / total).toFixed(1) + "%";
}

/* ---------- Analytics and charts ---------- */

// Bar chart: how many students got each grade
function renderGradeChart() {
  const counts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  students.forEach((s) => { counts[getGrade(s.marks)]++; });

  const maxCount = Math.max(1, ...GRADES.map((g) => counts[g]));
  const maxHeight = 120; // tallest bar in pixels

  gradeChart.innerHTML = GRADES.map((g) => {
    const height = Math.max(3, Math.round((counts[g] / maxCount) * maxHeight));
    return `
      <div class="bar-col">
        <span class="bar-count">${counts[g]}</span>
        <div class="bar grade-${g.toLowerCase()}" style="height:${height}px"></div>
        <span class="bar-label">${g}</span>
      </div>`;
  }).join("");
}

// Horizontal bars: average marks of each subject
function renderSubjectChart() {
  if (students.length === 0) {
    subjectChart.innerHTML = '<p class="empty-note">No data to show.</p>';
    return;
  }

  subjectChart.innerHTML = SUBJECTS.map((subject) => {
    let sum = 0;
    students.forEach((s) => { sum += s.subjects[subject.key]; });
    const avg = sum / students.length;
    return `
      <div class="h-row">
        <span>${subject.label}</span>
        <div class="h-track"><div class="h-fill" style="width:${avg}%"></div></div>
        <span class="h-value">${avg.toFixed(1)}</span>
      </div>`;
  }).join("");
}

// Top 3 students by overall marks
function renderTopList() {
  if (students.length === 0) {
    topList.innerHTML = '<li class="empty-note">No students yet.</li>';
    return;
  }

  // slice() makes a copy so sorting does not change the original order
  const top = students.slice().sort((a, b) => b.marks - a.marks).slice(0, 3);

  topList.innerHTML = top.map((s, i) => `
    <li>
      <span class="rank-no">${i + 1}</span>
      <div class="item-main">
        <div class="item-name">${escapeHtml(s.name)}</div>
        <div class="item-sub">${escapeHtml(s.department)}</div>
      </div>
      <span class="item-score">${s.marks}</span>
    </li>`).join("");
}

// Students with low marks or low attendance
function renderAlertList() {
  const atRisk = students.filter((s) => isLowMarks(s) || isLowAttendance(s));

  if (atRisk.length === 0) {
    alertList.innerHTML = '<li class="empty-note">No students need attention.</li>';
    return;
  }

  alertList.innerHTML = atRisk.map((s) => {
    const reasons = [];
    if (isLowMarks(s)) reasons.push("Low marks (" + s.marks + ")");
    if (isLowAttendance(s)) reasons.push("Low attendance (" + s.attendance + "%)");
    return `
      <li>
        <div class="item-main">
          <div class="item-name">${escapeHtml(s.name)} (${escapeHtml(s.id)})</div>
          <div class="item-sub">${reasons.join(", ")}</div>
        </div>
      </li>`;
  }).join("");
}

function renderAnalytics() {
  renderGradeChart();
  renderSubjectChart();
  renderTopList();
  renderAlertList();
}

/* ---------- Table display ---------- */

// Return only the students that match the search box and filters
function getVisibleStudents() {
  const query = searchInput.value.trim().toLowerCase();
  const dept  = deptFilter.value;
  const grade = gradeFilter.value;

  return students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(query) || s.id.toLowerCase().includes(query);
    const matchesDept   = dept === "" || s.department === dept;
    const matchesGrade  = grade === "" || getGrade(s.marks) === grade;
    return matchesSearch && matchesDept && matchesGrade;
  });
}

// Draw the table rows
function renderTable() {
  const list = getVisibleStudents();

  if (list.length === 0) {
    tableBody.innerHTML = '<tr class="empty-row"><td colspan="7">No students found.</td></tr>';
    return;
  }

  tableBody.innerHTML = list.map((s) => {
    const grade = getGrade(s.marks);
    const rowClass = (isLowMarks(s) || isLowAttendance(s)) ? "at-risk" : "";
    return `
      <tr class="${rowClass}">
        <td>${escapeHtml(s.id)}</td>
        <td>${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.department)}</td>
        <td class="${isLowMarks(s) ? "low" : ""}">${s.marks}</td>
        <td><span class="badge grade-${grade.toLowerCase()}">${grade}</span></td>
        <td class="${isLowAttendance(s) ? "low" : ""}">${s.attendance}%</td>
        <td>
          <div class="row-actions">
            <button type="button" class="btn btn-small btn-ghost" data-action="edit" data-id="${escapeHtml(s.id)}">Edit</button>
            <button type="button" class="btn btn-small btn-danger" data-action="delete" data-id="${escapeHtml(s.id)}">Delete</button>
          </div>
        </td>
      </tr>`;
  }).join("");
}

// Refresh everything that depends on the student data
function refreshAll() {
  renderTable();
  updateStats();
  renderAnalytics();
}

/* ---------- Form validation ---------- */

function setError(key, message) {
  fields[key].error.textContent = message;
  fields[key].input.classList.toggle("invalid", message !== "");
}

function clearErrors() {
  Object.keys(fields).forEach((key) => setError(key, ""));
}

// Check that a field holds a number from 0 to 100. Returns true if valid.
function checkNumber(key, message) {
  const value = fields[key].input.value.trim();
  if (value === "" || isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100) {
    setError(key, message);
    return false;
  }
  setError(key, "");
  return true;
}

// Check every field. Returns true only when everything is valid.
function validateForm() {
  let valid = true;

  const id   = fields.id.input.value.trim();
  const name = fields.name.input.value.trim();
  const dept = fields.dept.input.value;

  // ID: required, letters/numbers only, must be unique
  if (id === "") {
    setError("id", "Student ID is required."); valid = false;
  } else if (!/^[A-Za-z0-9]+$/.test(id)) {
    setError("id", "Use only letters and numbers."); valid = false;
  } else if (id !== editingId && students.some((s) => s.id.toLowerCase() === id.toLowerCase())) {
    setError("id", "This ID already exists."); valid = false;
  } else {
    setError("id", "");
  }

  // Name: required, at least 2 characters, letters and spaces only
  if (name === "") {
    setError("name", "Name is required."); valid = false;
  } else if (name.length < 2) {
    setError("name", "Name must be at least 2 characters."); valid = false;
  } else if (!/^[A-Za-z][A-Za-z .'-]*$/.test(name)) {
    setError("name", "Name can only contain letters and spaces."); valid = false;
  } else {
    setError("name", "");
  }

  // Department: must be chosen
  if (dept === "") {
    setError("dept", "Please select a department."); valid = false;
  } else {
    setError("dept", "");
  }

  // Subject marks and attendance: numbers between 0 and 100
  SUBJECTS.forEach((s) => {
    if (!checkNumber(s.key, "Enter 0 to 100.")) valid = false;
  });
  if (!checkNumber("att", "Enter attendance between 0 and 100.")) valid = false;

  return valid;
}

/* ---------- Add / Edit ---------- */

function openAddForm() {
  editingId = null;
  studentForm.reset();
  clearErrors();
  fields.id.input.disabled = false;
  dialogTitle.textContent = "Add Student";
  studentDialog.showModal();
}

function openEditForm(id) {
  const student = students.find((s) => s.id === id);
  if (!student) return;

  editingId = id;
  clearErrors();
  fields.id.input.value    = student.id;
  fields.id.input.disabled = true;          // the ID cannot be changed
  fields.name.input.value  = student.name;
  fields.dept.input.value  = student.department;
  fields.att.input.value   = student.attendance;
  SUBJECTS.forEach((s) => { fields[s.key].input.value = student.subjects[s.key]; });
  dialogTitle.textContent = "Edit Student";
  studentDialog.showModal();
}

function saveStudent(event) {
  event.preventDefault();

  if (!validateForm()) {
    showToast("Please fix the highlighted fields.", "error");
    return;
  }

  // Collect the subject marks, then work out the overall marks
  const subjects = {};
  SUBJECTS.forEach((s) => { subjects[s.key] = Number(fields[s.key].input.value); });

  const data = {
    id: editingId || fields.id.input.value.trim().toUpperCase(),
    name: fields.name.input.value.trim(),
    department: fields.dept.input.value,
    subjects: subjects,
    marks: calcOverall(subjects),
    attendance: Number(fields.att.input.value)
  };

  if (editingId) {
    const index = students.findIndex((s) => s.id === editingId);
    students[index] = data;
    showToast("Student updated successfully.", "success");
  } else {
    students.push(data);
    showToast("Student added successfully.", "success");
  }

  saveStudents();
  studentDialog.close();
  refreshAll();
}

/* ---------- Delete ---------- */

function askDelete(id) {
  const student = students.find((s) => s.id === id);
  if (!student) return;

  deletingId = id;
  confirmText.textContent = "Are you sure you want to delete " + student.name + " (" + student.id + ")? This cannot be undone.";
  confirmDialog.showModal();
}

function deleteStudent() {
  const index = students.findIndex((s) => s.id === deletingId);
  if (index === -1) {
    showToast("Student not found.", "error");
  } else {
    students.splice(index, 1);
    showToast("Student deleted successfully.", "success");
  }
  deletingId = null;
  saveStudents();
  confirmDialog.close();
  refreshAll();
}

/* ---------- Event listeners ---------- */

addBtn.addEventListener("click", openAddForm);
cancelBtn.addEventListener("click", () => studentDialog.close());
studentForm.addEventListener("submit", saveStudent);

confirmCancel.addEventListener("click", () => confirmDialog.close());
confirmDelete.addEventListener("click", deleteStudent);

restoreBtn.addEventListener("click", () => restoreDialog.showModal());
restoreCancel.addEventListener("click", () => restoreDialog.close());
restoreConfirm.addEventListener("click", restoreSamples);

// Search and filters only change the table, not the dashboard totals
searchInput.addEventListener("input", renderTable);
deptFilter.addEventListener("change", renderTable);
gradeFilter.addEventListener("change", renderTable);

// One listener handles all Edit / Delete buttons in the table
tableBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  if (button.dataset.action === "edit") openEditForm(button.dataset.id);
  if (button.dataset.action === "delete") askDelete(button.dataset.id);
});

// Sidebar links: highlight the clicked link and close the mobile menu
const navLinks = document.querySelectorAll(".nav-link");
const menuToggle = document.getElementById("menu-toggle");
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((other) => other.classList.remove("active"));
    link.classList.add("active");
    menuToggle.checked = false;
  });
});

/* ---------- Start ---------- */
loadStudents();
refreshAll();
