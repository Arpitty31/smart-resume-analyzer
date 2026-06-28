const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const analyzeBtn = document.getElementById('analyzeBtn');
const loader = document.getElementById('loader');
const results = document.getElementById('results');
const themeToggle = document.getElementById('themeToggle');

let selectedFile = null;
let currentData = null;

// Theme Toggle
themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  if (html.getAttribute('data-theme') === 'dark') {
    html.setAttribute('data-theme', 'light');
    themeToggle.textContent = '☀️ Light';
  } else {
    html.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '🌙 Dark';
  }
});

// File select via browse
fileInput.addEventListener('change', (e) => {
  handleFile(e.target.files[0]);
});

// Drag & Drop
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  handleFile(e.dataTransfer.files[0]);
});

function handleFile(file) {
  if (!file || file.type !== 'application/pdf') {
    alert('Please upload a PDF file!');
    return;
  }
  selectedFile = file;
  fileName.textContent = `📄 ${file.name}`;
  analyzeBtn.disabled = false;
}

// Analyze button
analyzeBtn.addEventListener('click', async () => {
  if (!selectedFile) return;

  const jobRole = document.getElementById('jobRole').value || 'Software Engineer';

  loader.classList.remove('hidden');
  results.classList.add('hidden');
  analyzeBtn.disabled = true;

  const formData = new FormData();
  formData.append('file', selectedFile);
  formData.append('job_role', jobRole);

  try {
    const response = await fetch('http://127.0.0.1:8000/analyze', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    currentData = data;
    displayResults(data);
  } catch (error) {
    alert('Error connecting to server! Make sure backend is running.');
    console.error(error);
  } finally {
    loader.classList.add('hidden');
    analyzeBtn.disabled = false;
  }
});

function displayResults(data) {
  // Animated ATS Score
  animateScore(data.ats_score);

  document.getElementById('grade').textContent = data.grade;
  document.getElementById('summary').textContent = data.summary;

  fillList('strengthsList', data.strengths);
  fillList('weaknessesList', data.weaknesses);
  fillList('skillsGapList', data.skills_gap);
  fillList('suggestionsList', data.suggestions);

  results.classList.remove('hidden');
  results.scrollIntoView({ behavior: 'smooth' });
}

function animateScore(score) {
  const circle = document.getElementById('circleBar');
  const scoreEl = document.getElementById('atsScore');
  const circumference = 326.56;
  const offset = circumference - (score / 100) * circumference;

  // Animate number
  let current = 0;
  const interval = setInterval(() => {
    current += 1;
    scoreEl.textContent = current;
    if (current >= score) clearInterval(interval);
  }, 15);

  // Animate circle
  setTimeout(() => {
    circle.style.strokeDashoffset = offset;
  }, 100);
}

function fillList(id, items) {
  const ul = document.getElementById(id);
  ul.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  });
}

// PDF Download
document.getElementById('downloadBtn').addEventListener('click', () => {
  if (!currentData) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor(102, 126, 234);
  doc.text('Smart Resume Analyzer Report', 20, 20);

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`ATS Score: ${currentData.ats_score}/100`, 20, 40);
  doc.text(`Grade: ${currentData.grade}`, 20, 50);
  doc.text(`Summary: ${currentData.summary}`, 20, 60, { maxWidth: 170 });

  let y = 80;

  const sections = [
    { title: 'Strengths', items: currentData.strengths },
    { title: 'Weaknesses', items: currentData.weaknesses },
    { title: 'Skills Gap', items: currentData.skills_gap },
    { title: 'Suggestions', items: currentData.suggestions },
  ];

  sections.forEach(section => {
    doc.setFontSize(13);
    doc.setTextColor(102, 126, 234);
    doc.text(section.title, 20, y);
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    section.items.forEach(item => {
      const lines = doc.splitTextToSize(`• ${item}`, 170);
      doc.text(lines, 20, y);
      y += lines.length * 7;
    });
    y += 5;
  });

  doc.save('Resume_Analysis_Report.pdf');
});