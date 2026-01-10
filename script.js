/**********************
 * INPUT ELEMENTS
 **********************/
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const summaryInput = document.getElementById("summary");
const educationInput = document.getElementById("education");

const skillInput = document.getElementById("skill-input");

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

/**********************
 * LIVE PREVIEW
 **********************/
nameInput.oninput = () => previewName.textContent = nameInput.value || "Your Name";
emailInput.oninput = () => previewEmail.textContent = emailInput.value || "email@example.com";
phoneInput.oninput = () => previewPhone.textContent = phoneInput.value || "+91 XXXXXXXX";
summaryInput.oninput = () => previewSummary.textContent = summaryInput.value || "Your professional summary will appear here.";
educationInput.oninput = () => previewEducation.textContent = educationInput.value || "Your education details";

/**********************
 * SKILLS
 **********************/
document.getElementById("add-skill").onclick = () => {
  const skill = skillInput.value.trim();
  if (!skill) return;

  const li = document.createElement("li");
  li.textContent = skill;
  previewSkills.appendChild(li);

  skillInput.value = "";
};

/**********************
 * EXPERIENCE
 **********************/
document.getElementById("add-experience").onclick = () => {
  if (!expTitleInput.value || !expCompanyInput.value) return;

  experiences.push({
    title: expTitleInput.value,
    company: expCompanyInput.value,
    duration: expDurationInput.value,
    desc: expDescInput.value
  });

  renderExperience();

  expTitleInput.value = "";
  expCompanyInput.value = "";
  expDurationInput.value = "";
  expDescInput.value = "";
};

function renderExperience() {
  previewExperience.innerHTML = "";
  experiences.forEach(exp => {
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
    skills: [...document.querySelectorAll("#preview-skills li")].map(li => li.textContent),
    experiences
  };

  localStorage.setItem("resumeData", JSON.stringify(data));
  alert("Resume saved successfully!");
};

/**********************
 * PDF DOWNLOAD
 **********************/
document.getElementById("download-btn").onclick = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  let y = 15;

  // Function to create section header with line
  const sectionHeader = (title) => {
    doc.setFont("Times", "Bold");
    doc.setFontSize(12);
    doc.text(title, 10, y);
    y += 3;
    doc.setLineWidth(0.5);
    doc.line(10, y, 200, y);
    y += 8;
  };

  // Header: Name
  doc.setFont("Times", "Bold");
  doc.setFontSize(18);
  doc.text(previewName.textContent, 105, y, { align: "center" });
  y += 8;

  // Header: Email | Phone
  doc.setFont("Times", "Normal");
  doc.setFontSize(11);
  doc.text(`${previewEmail.textContent} | ${previewPhone.textContent}`, 105, y, { align: "center" });
  y += 12;

  // Summary Section
  sectionHeader("SUMMARY");
  doc.setFont("Times", "Normal");
  let summaryLines = doc.splitTextToSize(previewSummary.textContent, 180);
  doc.text(summaryLines, 10, y);
  y += summaryLines.length * 6 + 10;

  // Skills Section
  sectionHeader("SKILLS");
  document.querySelectorAll("#preview-skills li").forEach(skill => {
    doc.text("• " + skill.textContent, 10, y);
    y += 6;
  });
  y += 8;

  // Experience Section
  sectionHeader("EXPERIENCE");
  experiences.forEach(exp => {
    doc.setFont("Times", "Bold");
    doc.text(`${exp.title} – ${exp.company}`, 10, y);
    y += 6;

    doc.setFont("Times", "Italic");
    doc.text(exp.duration, 10, y);
    y += 5;

    doc.setFont("Times", "Normal");
    let expLines = doc.splitTextToSize(exp.desc, 180);
    doc.text(expLines, 10, y);
    y += expLines.length * 6 + 6;
  });

  // Education Section
  sectionHeader("EDUCATION");
  let eduLines = doc.splitTextToSize(previewEducation.textContent, 180);
  doc.text(eduLines, 10, y);

  // Save PDF
  doc.save("resume.pdf");
};
