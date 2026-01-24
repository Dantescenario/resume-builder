/**********************
 * INPUT ELEMENTS
 **********************/
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const summaryInput = document.getElementById("summary");
const educationInput = document.getElementById("education");

const skillInput = document.getElementById("skill-input");
const skillsContainer = document.getElementById("skills-container");

const expTitleInput = document.getElementById("exp-title");
const expCompanyInput = document.getElementById("exp-company");
const expDurationInput = document.getElementById("exp-duration");
const expDescInput = document.getElementById("exp-desc");

/**********************
 * PREVIEW ELEMENTS
 **********************/
const previewName = document.getElementById("preview-name");
const previewEmail = document.getElementById("preview-email");
const previewPhone = document.getElementById("preview-phone");
const previewSummary = document.getElementById("preview-summary");
const previewEducation = document.getElementById("preview-education");
const previewSkills = document.getElementById("preview-skills");
const previewExperience = document.getElementById("preview-experience");

/**********************
 * STATE
 **********************/
let experiences = [];
let skills = [];
let currentTemplate = 'classic';

const resumePreview = document.getElementById('resume-preview');

/**********************
 * TOAST NOTIFICATIONS
 **********************/
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**********************
 * LIVE PREVIEW
 **********************/
nameInput.oninput = () => previewName.textContent = nameInput.value || "Your Name";
emailInput.oninput = () => previewEmail.textContent = emailInput.value || "email@example.com";
phoneInput.oninput = () => previewPhone.textContent = phoneInput.value || "+91 XXXXXXXX";
summaryInput.oninput = () => previewSummary.textContent = summaryInput.value || "Your professional summary will appear here...";
educationInput.oninput = () => previewEducation.textContent = educationInput.value || "Your education details will appear here...";

/**********************
 * SKILLS
 **********************/
function renderSkills() {
  // Render form skill tags
  skillsContainer.innerHTML = '';
  skills.forEach((skill, index) => {
    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.innerHTML = `
      ${skill}
      <button class="remove-skill" data-index="${index}" title="Remove skill">
        <i class="fas fa-times"></i>
      </button>
    `;
    skillsContainer.appendChild(tag);
  });

  // Render preview skills
  previewSkills.innerHTML = '';
  skills.forEach(skill => {
    const li = document.createElement('li');
    li.textContent = skill;
    previewSkills.appendChild(li);
  });
}

// Add skill
document.getElementById("add-skill").onclick = () => {
  const skill = skillInput.value.trim();
  if (!skill) {
    showToast('Please enter a skill', 'error');
    return;
  }

  if (skills.includes(skill)) {
    showToast('Skill already added', 'error');
    return;
  }

  skills.push(skill);
  renderSkills();
  skillInput.value = "";
  skillInput.focus();
};

// Allow Enter key to add skill
skillInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    document.getElementById("add-skill").click();
  }
});

// Remove skill (event delegation)
skillsContainer.addEventListener('click', (e) => {
  const removeBtn = e.target.closest('.remove-skill');
  if (removeBtn) {
    const index = parseInt(removeBtn.dataset.index);
    skills.splice(index, 1);
    renderSkills();
  }
});

/**********************
 * EXPERIENCE
 **********************/
document.getElementById("add-experience").onclick = () => {
  if (!expTitleInput.value.trim()) {
    showToast('Please enter a job title', 'error');
    return;
  }
  if (!expCompanyInput.value.trim()) {
    showToast('Please enter a company name', 'error');
    return;
  }

  experiences.push({
    title: expTitleInput.value.trim(),
    company: expCompanyInput.value.trim(),
    duration: expDurationInput.value.trim(),
    desc: expDescInput.value.trim()
  });

  renderExperience();
  showToast('Experience added!');

  expTitleInput.value = "";
  expCompanyInput.value = "";
  expDurationInput.value = "";
  expDescInput.value = "";
  expTitleInput.focus();
};

function renderExperience() {
  previewExperience.innerHTML = "";
  experiences.forEach((exp, index) => {
    const div = document.createElement("div");
    div.className = "experience-item";
    div.innerHTML = `
      <strong>${exp.title}</strong> – ${exp.company}<br>
      <em>${exp.duration}</em>
      <p>${exp.desc}</p>
    `;
    previewExperience.appendChild(div);
  });
}

/**********************
 * SAVE (LOCAL STORAGE)
 **********************/
document.getElementById("save-btn").onclick = () => {
  const data = {
    name: nameInput.value,
    email: emailInput.value,
    phone: phoneInput.value,
    summary: summaryInput.value,
    education: educationInput.value,
    skills: skills,
    experiences,
    template: currentTemplate
  };

  localStorage.setItem("resumeData", JSON.stringify(data));
  showToast('Resume saved successfully!');
};

/**********************
 * LOAD SAVED DATA
 **********************/
function loadSavedData() {
  const saved = localStorage.getItem("resumeData");
  if (!saved) return;

  try {
    const data = JSON.parse(saved);

    if (data.name) {
      nameInput.value = data.name;
      previewName.textContent = data.name;
    }
    if (data.email) {
      emailInput.value = data.email;
      previewEmail.textContent = data.email;
    }
    if (data.phone) {
      phoneInput.value = data.phone;
      previewPhone.textContent = data.phone;
    }
    if (data.summary) {
      summaryInput.value = data.summary;
      previewSummary.textContent = data.summary;
    }
    if (data.education) {
      educationInput.value = data.education;
      previewEducation.textContent = data.education;
    }
    if (data.skills && Array.isArray(data.skills)) {
      skills = data.skills;
      renderSkills();
    }
    if (data.experiences && Array.isArray(data.experiences)) {
      experiences = data.experiences;
      renderExperience();
    }
    if (data.template) {
      setTemplate(data.template);
    }
  } catch (e) {
    console.error('Error loading saved data:', e);
  }
}

/**********************
 * TEMPLATE SWITCHING
 **********************/
function setTemplate(templateName) {
  currentTemplate = templateName;
  resumePreview.setAttribute('data-template', templateName);

  // Update active state on buttons
  document.querySelectorAll('.template-option').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.template === templateName) {
      btn.classList.add('active');
    }
  });
}

// Template selector click handler
document.querySelectorAll('.template-option').forEach(btn => {
  btn.addEventListener('click', () => {
    const template = btn.dataset.template;
    setTemplate(template);
    showToast(`Template changed to ${template.charAt(0).toUpperCase() + template.slice(1)}`);
  });
});

// Load saved data on page load
document.addEventListener('DOMContentLoaded', loadSavedData);

/**********************
 * PDF DOWNLOAD
 **********************/
document.getElementById("download-btn").onclick = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  // Template-specific configurations
  const templates = {
    classic: {
      primaryColor: [30, 41, 59],      // #1e293b
      accentColor: [30, 41, 59],
      headerFont: "Times",
      bodyFont: "Times",
      headerAlign: "center",
      sidebarWidth: 0
    },
    modern: {
      primaryColor: [102, 126, 234],   // #667eea
      accentColor: [118, 75, 162],     // #764ba2
      headerFont: "Helvetica",
      bodyFont: "Helvetica",
      headerAlign: "left",
      sidebarWidth: 6
    },
    minimal: {
      primaryColor: [100, 116, 139],   // #64748b
      accentColor: [100, 116, 139],
      headerFont: "Helvetica",
      bodyFont: "Helvetica",
      headerAlign: "left",
      sidebarWidth: 0
    },
    creative: {
      primaryColor: [249, 115, 22],    // #f97316
      accentColor: [236, 72, 153],     // #ec4899
      headerFont: "Helvetica",
      bodyFont: "Helvetica",
      headerAlign: "center",
      sidebarWidth: 0
    }
  };

  const config = templates[currentTemplate] || templates.classic;
  let y = 15;
  let leftMargin = 10 + config.sidebarWidth;
  let contentWidth = 190 - config.sidebarWidth;

  // Draw sidebar for Modern template
  if (config.sidebarWidth > 0) {
    doc.setFillColor(...config.primaryColor);
    doc.rect(0, 0, config.sidebarWidth, 297, 'F');
  }

  // Draw top accent bar for Creative template
  if (currentTemplate === 'creative') {
    const gradientSteps = 70;
    const barHeight = 4;
    for (let i = 0; i < gradientSteps; i++) {
      const ratio = i / gradientSteps;
      const r = Math.round(249 + (236 - 249) * ratio);
      const g = Math.round(115 + (72 - 115) * ratio);
      const b = Math.round(22 + (153 - 22) * ratio);
      doc.setFillColor(r, g, b);
      doc.rect((210 / gradientSteps) * i, 0, (210 / gradientSteps) + 1, barHeight, 'F');
    }
    y = 12;
  }

  // Section header function
  const sectionHeader = (title) => {
    y += 4;

    if (currentTemplate === 'creative') {
      // Pill-shaped header for creative
      doc.setFillColor(...config.primaryColor);
      const textWidth = doc.getTextWidth(title) + 10;
      doc.roundedRect(leftMargin, y - 4, textWidth, 7, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont(config.headerFont, "Bold");
      doc.setFontSize(9);
      doc.text(title, leftMargin + 5, y);
      y += 10;
      doc.setTextColor(0, 0, 0);
    } else if (currentTemplate === 'minimal') {
      // Subtle header for minimal
      doc.setTextColor(...config.primaryColor);
      doc.setFont(config.headerFont, "Normal");
      doc.setFontSize(9);
      doc.text(title, leftMargin, y);
      y += 8;
      doc.setTextColor(0, 0, 0);
    } else if (currentTemplate === 'modern') {
      // Colored header for modern
      doc.setTextColor(...config.primaryColor);
      doc.setFont(config.headerFont, "Bold");
      doc.setFontSize(10);
      doc.text(title, leftMargin, y);
      y += 2;
      doc.setDrawColor(...config.primaryColor);
      doc.setLineWidth(0.8);
      doc.line(leftMargin, y, leftMargin + 50, y);
      y += 8;
      doc.setTextColor(0, 0, 0);
    } else {
      // Classic header
      doc.setFont(config.headerFont, "Bold");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(title, leftMargin, y);
      y += 2;
      doc.setLineWidth(0.4);
      doc.setDrawColor(0, 0, 0);
      doc.line(leftMargin, y, 200, y);
      y += 8;
    }
  };

  // Header: Name
  doc.setFont(config.headerFont, "Bold");

  if (currentTemplate === 'creative') {
    doc.setFontSize(22);
    doc.setTextColor(...config.primaryColor);
  } else if (currentTemplate === 'minimal') {
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.setFont(config.headerFont, "Normal");
  } else if (currentTemplate === 'modern') {
    doc.setFontSize(20);
    doc.setTextColor(...config.primaryColor);
  } else {
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
  }

  if (config.headerAlign === 'center') {
    doc.text(previewName.textContent, 105, y, { align: "center" });
  } else {
    doc.text(previewName.textContent, leftMargin, y);
  }
  y += 8;

  // Header: Email | Phone
  doc.setFont(config.bodyFont, "Normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);

  const contactText = `${previewEmail.textContent}  |  ${previewPhone.textContent}`;
  if (config.headerAlign === 'center') {
    doc.text(contactText, 105, y, { align: "center" });
  } else {
    doc.text(contactText, leftMargin, y);
  }
  y += 10;
  doc.setTextColor(0, 0, 0);

  // Summary Section
  sectionHeader("SUMMARY");
  doc.setFont(config.bodyFont, "Normal");
  doc.setFontSize(10);
  let summaryLines = doc.splitTextToSize(previewSummary.textContent, contentWidth);
  doc.text(summaryLines, leftMargin, y);
  y += summaryLines.length * 5 + 8;

  // Skills Section
  sectionHeader("SKILLS");
  doc.setFont(config.bodyFont, "Normal");
  doc.setFontSize(10);

  if (currentTemplate === 'creative' || currentTemplate === 'modern') {
    // Inline skills with colored text
    doc.setTextColor(...config.primaryColor);
    const skillText = skills.join('  •  ');
    const skillLines = doc.splitTextToSize(skillText, contentWidth);
    doc.text(skillLines, leftMargin, y);
    y += skillLines.length * 5 + 8;
    doc.setTextColor(0, 0, 0);
  } else {
    // Bullet list
    skills.forEach(skill => {
      doc.text("•  " + skill, leftMargin, y);
      y += 5;
    });
    y += 6;
  }

  // Experience Section
  sectionHeader("EXPERIENCE");
  experiences.forEach(exp => {
    if (currentTemplate === 'modern' || currentTemplate === 'creative') {
      doc.setTextColor(...config.primaryColor);
    }
    doc.setFont(config.bodyFont, "Bold");
    doc.setFontSize(11);
    doc.text(`${exp.title} – ${exp.company}`, leftMargin, y);
    y += 5;

    doc.setTextColor(100, 100, 100);
    doc.setFont(config.bodyFont, "Italic");
    doc.setFontSize(9);
    doc.text(exp.duration, leftMargin, y);
    y += 5;

    doc.setTextColor(0, 0, 0);
    doc.setFont(config.bodyFont, "Normal");
    doc.setFontSize(10);
    let expLines = doc.splitTextToSize(exp.desc, contentWidth);
    doc.text(expLines, leftMargin, y);
    y += expLines.length * 5 + 8;
  });

  // Education Section
  sectionHeader("EDUCATION");
  doc.setFont(config.bodyFont, "Normal");
  doc.setFontSize(10);
  let eduLines = doc.splitTextToSize(previewEducation.textContent, contentWidth);
  doc.text(eduLines, leftMargin, y);

  // Save PDF
  doc.save(`resume-${currentTemplate}.pdf`);
  showToast('PDF downloaded!');
};

