"use client";

import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Home() {
  const [profileId, setProfileId] = useState("default");
  const [profiles, setProfiles] = useState([{ id: "default", name: "Default Profile" }]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");

  const [summary, setSummary] = useState("");
  const [education, setEducation] = useState("");
  
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);
  
  const [expTitle, setExpTitle] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [expDuration, setExpDuration] = useState("");
  const [expDesc, setExpDesc] = useState("");
  const [experiences, setExperiences] = useState([]);
  
  const [projTitle, setProjTitle] = useState("");
  const [projLink, setProjLink] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projects, setProjects] = useState([]);
  
  const [template, setTemplate] = useState("classic");
  const [themeColor, setThemeColor] = useState("#667eea");
  
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Drag and file input refs
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const fileInputRef = useRef(null);

  // AI Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [enhancingIndex, setEnhancingIndex] = useState(null);

  // Format Text helper for preview (bold and italic support)
  const formatText = (text) => {
    if (!text) return { __html: "" };
    // replace **bold** and *italic*
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // return formatted lines as continuous text with <br/>
    return { __html: formatted.replace(/\n/g, '<br/>') };
  };

  const normalizeUrl = (value, fallbackProtocol = "https://") => {
    if (!value || typeof value !== "string") return "";

    const trimmed = value.trim();
    if (!trimmed) return "";

    let normalized = trimmed.replace(/\s+/g, "");
    if (!normalized) return "";

    if (/^(mailto|tel):/i.test(normalized)) return normalized;

    normalized = normalized.replace(/^https?:?\/\//i, (match) => {
      return match.toLowerCase().startsWith("https") ? "https://" : "http://";
    });

    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `${fallbackProtocol}${normalized}`;
    }

    return normalized;
  };

  const insertFormatting = (setter, getter, prefix, suffix = prefix) => {
    setter(getter + prefix + "text" + suffix);
  };

  const loadProfileData = (savedData, pId) => {
    const data = savedData[pId];
    if (data) {
      if (data.name !== undefined) setName(data.name);
      if (data.email !== undefined) setEmail(data.email);
      if (data.phone !== undefined) setPhone(data.phone);
      if (data.linkedin !== undefined) setLinkedin(data.linkedin);
      if (data.github !== undefined) setGithub(data.github);
      if (data.portfolio !== undefined) setPortfolio(data.portfolio);
      if (data.summary !== undefined) setSummary(data.summary);
      if (data.education !== undefined) setEducation(data.education);
      if (data.skills !== undefined) setSkills(data.skills);
      if (data.experiences !== undefined) setExperiences(data.experiences);
      if (data.projects !== undefined) setProjects(data.projects);
      if (data.template !== undefined) setTemplate(data.template);
      if (data.themeColor !== undefined) setThemeColor(data.themeColor);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("resumeProfilesMap");
    const mode = localStorage.getItem("resumeDarkMode");
    if (mode === "true") setIsDarkMode(true);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfiles(parsed.profilesList || [{ id: "default", name: "Default Profile" }]);
        loadProfileData(parsed.map || {}, "default");
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
    localStorage.setItem("resumeDarkMode", isDarkMode);
  }, [isDarkMode]);

  const showToast = (msg, type = "success") => {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = "slideOut 0.3s ease-out forwards";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  const saveResume = () => {
    const saved = localStorage.getItem("resumeProfilesMap");
    let parsed = { map: {}, profilesList: profiles };
    if (saved) {
      try { parsed = JSON.parse(saved); } catch (e) { }
    }
    
    parsed.profilesList = profiles;
    parsed.map[profileId] = { name, email, phone, linkedin, github, portfolio, summary, education, skills, experiences, projects, template, themeColor };
    
    localStorage.setItem("resumeProfilesMap", JSON.stringify(parsed));
    showToast("Resume saved successfully!");
  };

  const createNewProfile = () => {
    const newId = Date.now().toString();
    const newName = prompt("Enter profile name:");
    if (!newName) return;
    setProfiles([...profiles, { id: newId, name: newName }]);
    setProfileId(newId);
    
    // Clear forms
    setName(""); setEmail(""); setPhone(""); setLinkedin(""); setGithub(""); setPortfolio("");
    setSummary(""); setEducation(""); setSkills([]); setExperiences([]); setProjects([]);
    
    showToast("New profile created!");
  };

  const switchProfile = (e) => {
    const selectedId = e.target.value;
    setProfileId(selectedId);
    const saved = localStorage.getItem("resumeProfilesMap");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        loadProfileData(parsed.map || {}, selectedId);
      } catch (err) {}
    }
  };

  const exportJSON = () => {
    const data = JSON.stringify({ name, email, phone, linkedin, github, portfolio, summary, education, skills, experiences, projects, template, themeColor }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${name || 'export'}.json`;
    a.click();
    showToast("Exported JSON Data");
  };

  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (data.name) setName(data.name);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
        if (data.linkedin) setLinkedin(data.linkedin);
        if (data.github) setGithub(data.github);
        if (data.portfolio) setPortfolio(data.portfolio);
        if (data.summary) setSummary(data.summary);
        if (data.education) setEducation(data.education);
        if (data.skills) setSkills(data.skills);
        if (data.experiences) setExperiences(data.experiences);
        if (data.projects) setProjects(data.projects);
        if (data.template) setTemplate(data.template);
        if (data.themeColor) setThemeColor(data.themeColor);
        showToast("Imported successfully!", "success");
      } catch (err) {
        showToast("Invalid JSON file", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const loadSampleData = () => {
    setName("Sarah Jenkins");
    setEmail("sarah.j@example.com");
    setPhone("+1 234 567 8900");
    setLinkedin("linkedin.com/in/sarahj");
    setGithub("github.com/sarahj");
    setPortfolio("sarahjenkins.dev");
    setSummary("**Dynamic Full-Stack Developer** with 5+ years of experience designing scalable web apps. Passionate about UI/UX, continuous integration, and improving app performance.");
    setEducation("B.S. Computer Science\nUniversity of Tech (2018 - 2022)\nGPA: 3.8/4.0");
    setSkills(["JavaScript", "React", "Next.js", "Python", "TailwindCSS", "SQL"]);
    setExperiences([
      { title: "Senior Frontend Engineer", company: "TechNova", duration: "Jan 2023 - Present", desc: "* Spearheaded the migration of a legacy dashboard to Next.js, improving page load speeds by 50%.\n* Mentored junior developers." },
      { title: "Software Developer", company: "Creative Web Agency", duration: "Jun 2022 - Dec 2022", desc: "* Built interactive REST APIs with Express and MongoDB.\n* Collaborated with designers to deliver pixel-perfect components." }
    ]);
    setProjects([
      { title: "E-Commerce CMS", link: "https://github.com/sarah/eco-cms", desc: "A headless CMS built with Node.js and React." },
      { title: "AI Resume Builder", link: "https://ai-gen-demo.com", desc: "A sleek frontend wrapping a complex ML backend." }
    ]);
    setThemeColor("#10b981");
    setTemplate("modern");
    showToast("Sample Data Loaded!");
  };

  const handleSort = (list, setList) => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const _list = [...list];
    const draggedItemContent = _list.splice(dragItem.current, 1)[0];
    _list.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setList(_list);
  };

  const addSkill = (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return showToast("Please enter a skill", "error");
    if (skills.includes(skillInput.trim())) return showToast("Skill already added", "error");
    setSkills([...skills, skillInput.trim()]);
    setSkillInput("");
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addExperience = (e) => {
    e.preventDefault();
    if (!expTitle.trim()) return showToast("Please enter a job title", "error");
    if (!expCompany.trim()) return showToast("Please enter a company name", "error");
    
    setExperiences([
      ...experiences,
      { title: expTitle.trim(), company: expCompany.trim(), duration: expDuration.trim(), desc: expDesc.trim() },
    ]);
    setExpTitle(""); setExpCompany(""); setExpDuration(""); setExpDesc("");
    showToast("Experience added!");
  };

  const removeExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const addProject = (e) => {
    e.preventDefault();
    if (!projTitle.trim()) return showToast("Please enter a project title", "error");
    
    setProjects([
      ...projects,
      { title: projTitle.trim(), link: projLink.trim(), desc: projDesc.trim() },
    ]);
    setProjTitle(""); setProjLink(""); setProjDesc("");
    showToast("Project added!");
  };

  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const enhanceExperienceDesc = async (index) => {
    const textToEnhance = experiences[index].desc;
    if (!textToEnhance?.trim()) return showToast("Add description first to enhance it", "error");
    
    setEnhancingIndex(index);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enhance", textToEnhance }),
      });
      if (!res.ok) throw new Error("Backend API failed");
      const data = await res.json();
      
      const updatedExp = [...experiences];
      updatedExp[index].desc = data.enhancedText;
      setExperiences(updatedExp);
      showToast("Enhanced with AI!");
    } catch (err) {
      console.error(err);
      showToast("AI enhancement failed", "error");
    } finally {
      setEnhancingIndex(null);
    }
  };

  const downloadPDF = async () => {
    if (!name?.trim()) {
      showToast("Name is required to generate a PDF", "error");
      return;
    }
    const element = document.getElementById("resume-preview");
    if (!element) return;
    
    const originalBorder = element.style.border;
    const originalShadow = element.style.boxShadow;
    const originalHeight = element.style.minHeight;
    
    element.style.border = "none";
    element.style.boxShadow = "none";
    element.style.minHeight = "auto";

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      
      const pdfWidthMm = 210;
      const pdfHeightMm = (canvas.height * pdfWidthMm) / canvas.width;

      const pdf = new jsPDF({
        orientation: pdfWidthMm > pdfHeightMm ? "l" : "p",
        unit: "mm",
        format: [pdfWidthMm, pdfHeightMm]
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidthMm, pdfHeightMm);

      const containerRect = element.getBoundingClientRect();
      const scale = pdfWidthMm / containerRect.width;
      const links = element.querySelectorAll("a");
      
      links.forEach(link => {
        const rect = link.getBoundingClientRect();
        const mmX = (rect.left - containerRect.left) * scale;
        const mmY = (rect.top - containerRect.top) * scale;
        const mmW = rect.width * scale;
        const mmH = rect.height * scale;
        pdf.link(mmX, mmY, mmW, mmH, { url: link.href });
      });

      pdf.save(`resume-${template}.pdf`);
      showToast("PDF Downloaded!");
    } catch (err) {
      console.error(err);
      showToast("Error generating PDF", "error");
    } finally {
      element.style.border = originalBorder;
      element.style.boxShadow = originalShadow;
      element.style.minHeight = originalHeight;
    }
  };

  const handleAIReview = async () => {
    setShowAiModal(true);
    setAiLoading(true);
    setAiResult(null);

    const resumeText = `
Name: ${name}
Email: ${email}
Phone: ${phone}
Summary: ${summary}
Education: ${education}
Skills: ${skills.join(", ")}
Experience: ${experiences.map(e => `${e.title} at ${e.company} (${e.duration}): ${e.desc}`).join(" | ")}
Projects: ${projects.map(p => `${p.title}: ${p.desc}`).join(" | ")}
    `.trim();

    const resumeData = {
      name,
      email,
      phone,
      linkedin,
      github,
      portfolio,
      summary,
      education,
      skills,
      experiences,
      projects
    };

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, resumeData, action: "review" }),
      });
      if (!res.ok) throw new Error("Backend API failed");
      const data = await res.json();
      setAiResult(data);
    } catch (err) {
      console.error(err);
      showToast("AI Review connection failed. Running local review...", "error");
      
      // Basic client-side fallback if the API is completely unreachable
      const feedback = [];
      let score = 100;
      if (!email) { feedback.push("Add an email address to your contact details."); score -= 10; }
      if (!phone) { feedback.push("Add a phone number to your contact details."); score -= 10; }
      if (!summary || summary.length < 20) { feedback.push("Write a professional summary (at least 20 chars)."); score -= 15; }
      if (skills.length === 0) { feedback.push("Add your technical skills."); score -= 15; }
      if (experiences.length === 0) { feedback.push("Add your work experience."); score -= 20; }
      setAiResult({
        score: Math.max(30, score),
        feedback: feedback.length ? feedback : ["Resume structure looks good. Ensure you double-check your API endpoint connectivity."]
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      <div id="toast-container"></div>
      
      <header className="app-header">
        <div className="header-controls" style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '10px' }}>
          <select value={profileId} onChange={switchProfile} className="profile-select" style={{ padding: '5px', borderRadius: '5px' }}>
            {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={createNewProfile} className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>+ New</button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="btn-secondary" style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i> {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
        <div className="logo">
          <i className="fas fa-file-alt"></i>
          <span>Resume Builder PRO</span>
        </div>
        <p className="tagline">Now with AI superpowers & rich text</p>
      </header>

      <main className="container">
        <section className="form-section glass-card">
          <div className="section-header">
            <i className="fas fa-user-edit"></i>
            <h2>Your Details</h2>
          </div>

          <div className="form-group">
            <label><i className="fas fa-user"></i> Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><i className="fas fa-envelope"></i> Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
            </div>
            <div className="form-group">
              <label><i className="fas fa-phone"></i> Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXXXXXXX" />
            </div>
          </div>

          <div className="section-header" style={{ marginTop: '20px' }}>
            <i className="fas fa-link"></i>
            <h3>Social Links</h3>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label><i className="fab fa-linkedin"></i> LinkedIn</label>
              <input type="text" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="linkedin.com/in/johndoe" />
            </div>
            <div className="form-group">
              <label><i className="fab fa-github"></i> GitHub</label>
              <input type="text" value={github} onChange={e => setGithub(e.target.value)} placeholder="github.com/johndoe" />
            </div>
          </div>
          <div className="form-group">
            <label><i className="fas fa-globe"></i> Portfolio / Website</label>
            <input type="text" value={portfolio} onChange={e => setPortfolio(e.target.value)} placeholder="johndoe.com" />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><i className="fas fa-align-left"></i> Summary</span>
              <div className="rich-toolbar">
                <button type="button" onClick={() => insertFormatting(setSummary, summary, "**")} title="Bold"><b>B</b></button>
                <button type="button" onClick={() => insertFormatting(setSummary, summary, "*")} title="Italic"><i>I</i></button>
              </div>
            </label>
            <textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Write a summary (use **bold** and *italic*)..."></textarea>
          </div>

          <div className="form-group">
            <label><i className="fas fa-tools"></i> Skills</label>
            <form className="input-with-button" onSubmit={addSkill}>
              <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add a skill" />
              <button type="submit" className="btn-secondary"><i className="fas fa-plus"></i></button>
            </form>
            <div className="skills-tags">
              {skills.map((s, i) => (
                <span 
                  key={i} 
                  className="skill-tag"
                  draggable
                  onDragStart={() => dragItem.current = i}
                  onDragEnter={() => dragOverItem.current = i}
                  onDragEnd={() => handleSort(skills, setSkills)}
                  style={{ cursor: 'grab' }}
                >
                  {s} <button className="remove-skill" onClick={() => removeSkill(i)}><i className="fas fa-times"></i></button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label><i className="fas fa-graduation-cap"></i> Education</label>
            <textarea value={education} onChange={e => setEducation(e.target.value)} placeholder="University Name..."></textarea>
          </div>

          <div className="experience-section">
            <div className="section-header">
              <i className="fas fa-briefcase"></i>
              <h3>Work Experience</h3>
            </div>
            {experiences.map((exp, i) => (
              <div 
                key={i} 
                className="experience-item ui-list-item" 
                draggable
                onDragStart={() => dragItem.current = i}
                onDragEnter={() => dragOverItem.current = i}
                onDragEnd={() => handleSort(experiences, setExperiences)}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <strong>{exp.title} at {exp.company}</strong>
                  <div style={{display: 'flex', gap: '10px'}}>
                    <button onClick={() => enhanceExperienceDesc(i)} type="button" className="action-icon ai-icon" title="Enhance with AI">
                      {enhancingIndex === i ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
                    </button>
                    <button onClick={() => removeExperience(i)} type="button" className="action-icon danger-icon"><i className="fas fa-trash"></i></button>
                  </div>
                </div>
                <p style={{fontSize: '0.875rem', marginTop: '4px', color: '#64748b'}}>{exp.duration}</p>
                <div style={{fontSize: '0.875rem', marginTop: '4px'}} dangerouslySetInnerHTML={formatText(exp.desc)}></div>
              </div>
            ))}
            <div className="form-group">
              <input type="text" value={expTitle} onChange={e => setExpTitle(e.target.value)} placeholder="Job Title" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <input type="text" value={expCompany} onChange={e => setExpCompany(e.target.value)} placeholder="Company" />
              </div>
              <div className="form-group">
                <input type="text" value={expDuration} onChange={e => setExpDuration(e.target.value)} placeholder="Duration" />
              </div>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{visibility: 'hidden'}}>Desc</span>
                <div className="rich-toolbar">
                  <button type="button" onClick={() => insertFormatting(setExpDesc, expDesc, "**")} title="Bold"><b>B</b></button>
                  <button type="button" onClick={() => insertFormatting(setExpDesc, expDesc, "*")} title="Italic"><i>I</i></button>
                </div>
              </label>
              <textarea value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="Description (use **bold** and *italic*)..."></textarea>
            </div>
            <button onClick={addExperience} className="btn-secondary btn-full"><i className="fas fa-plus-circle"></i> Add Experience</button>
          </div>

          <div className="experience-section">
            <div className="section-header">
              <i className="fas fa-project-diagram"></i>
              <h3>Projects</h3>
            </div>
            {projects.map((proj, i) => (
              <div 
                key={i} 
                className="experience-item ui-list-item" 
                draggable
                onDragStart={() => dragItem.current = i}
                onDragEnter={() => dragOverItem.current = i}
                onDragEnd={() => handleSort(projects, setProjects)}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <strong>{proj.title}</strong>
                  <button onClick={() => removeProject(i)} type="button" className="action-icon danger-icon"><i className="fas fa-trash"></i></button>
                </div>
              </div>
            ))}
            <div className="form-row">
              <div className="form-group">
                <input type="text" value={projTitle} onChange={e => setProjTitle(e.target.value)} placeholder="Project Title" />
              </div>
              <div className="form-group">
                <input type="url" value={projLink} onChange={e => setProjLink(e.target.value)} placeholder="Project Link (Optional)" />
              </div>
            </div>
            <div className="form-group">
              <textarea value={projDesc} onChange={e => setProjDesc(e.target.value)} placeholder="Project Description..."></textarea>
            </div>
            <button onClick={addProject} className="btn-secondary btn-full"><i className="fas fa-plus-circle"></i> Add Project</button>
          </div>

          <div className="action-buttons">
            <button onClick={loadSampleData} className="btn-secondary"><i className="fas fa-magic"></i> Load Sample</button>
            <button onClick={saveResume} className="btn-primary"><i className="fas fa-save"></i> Save</button>
            <button onClick={exportJSON} className="btn-secondary"><i className="fas fa-download"></i> Export JSON</button>
            <button onClick={() => fileInputRef.current.click()} className="btn-secondary"><i className="fas fa-upload"></i> Import JSON</button>
            <input type="file" ref={fileInputRef} onChange={importJSON} style={{display: 'none'}} accept=".json" />
            <button onClick={handleAIReview} className="btn-primary ai-sparkle" style={{ gridColumn: 'span 2' }}><i className="fas fa-wand-magic-sparkles"></i> Overall AI Review</button>
            <button onClick={downloadPDF} className="btn-gradient" style={{ gridColumn: 'span 2' }}><i className="fas fa-file-pdf"></i> Download PDF</button>
          </div>
        </section>

        <section className="preview-section glass-card">
          <div className="preview-header">
            <i className="fas fa-eye"></i>
            <span>Live Preview</span>
          </div>

          <div className="template-selector">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
              <p className="template-label" style={{marginBottom: 0}}><i className="fas fa-palette"></i> Choose Template</p>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span style={{fontSize: '0.875rem', color: '#64748b'}}>Color: </span>
                <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} style={{border: 'none', width: '25px', height: '25px', padding: 0, cursor: 'pointer', background: 'transparent'}} />
              </div>
            </div>
            <div className="template-options">
              {['classic', 'modern', 'minimal', 'creative'].map(t => (
                <button key={t} className={`template-option ${template === t ? 'active' : ''}`} onClick={() => setTemplate(t)}>
                  <div className={`template-preview template-preview-${t}`}>
                    <div className={t === 'modern' ? 'tp-sidebar' : 'tp-header'}></div>
                    <div className={t === 'creative' ? 'tp-accent' : (t === 'modern' ? 'tp-content' : 'tp-line')}></div>
                    {t === 'modern' && <div className="tp-line"></div>}
                  </div>
                  <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>

          <div id="resume-preview" data-template={template} style={{ '--theme-color': template !== 'classic' ? themeColor : '#1e293b' }}>
            <div className="resume-header">
              <h2>{name || "Your Name"}</h2>
              <p className="contact-info">
                <span>{email || "email@example.com"}</span> <span className="separator">|</span> <span>{phone || "+91 XXXXXXXXXX"}</span>
              </p>
              <p className="contact-socials">
                {linkedin && <a href={normalizeUrl(linkedin)} target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i> {linkedin}</a>}
                {github && <a href={normalizeUrl(github)} target="_blank" rel="noopener noreferrer"><i className="fab fa-github"></i> {github}</a>}
                {portfolio && <a href={normalizeUrl(portfolio)} target="_blank" rel="noopener noreferrer"><i className="fas fa-globe"></i> {portfolio}</a>}
              </p>
            </div>
            <div className="resume-section">
              <h3>Summary</h3>
              <p dangerouslySetInnerHTML={formatText(summary || "Your summary details...")}></p>
            </div>
            <div className="resume-section">
              <h3>Skills</h3>
              <ul>{skills.length ? skills.map((s, i) => <li key={i}>{s}</li>) : <li>Your skills...</li>}</ul>
            </div>
            <div className="resume-section">
              <h3>Experience</h3>
              <div>
                {experiences.map((exp, i) => (
                  <div key={i} className="experience-item">
                    <strong>{exp.title}</strong> – {exp.company}<br />
                    <em>{exp.duration}</em>
                    <p dangerouslySetInnerHTML={formatText(exp.desc)}></p>
                  </div>
                ))}
              </div>
            </div>
            {projects.length > 0 && (
              <div className="resume-section">
                <h3>Projects</h3>
                <div>
                  {projects.map((proj, i) => (
                    <div key={i} className="experience-item">
                      <strong>{proj.title}</strong> {proj.link && <a href={normalizeUrl(proj.link)} target="_blank" rel="noopener noreferrer" style={{color: '#3b82f6', textDecoration: 'none', marginLeft: '5px'}}><i className="fas fa-external-link-alt" style={{fontSize: '0.8em'}}></i></a>}
                      <p>{proj.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="resume-section">
              <h3>Education</h3>
              <p>{education || "Education details..."}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>
          <a 
            href="https://my-portfolio-7rvu.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            RISHABH BHARDWAJ
          </a>
        </p>
      </footer>

      {/* AI Modal */}
      <div id="ai-modal" className={`modal ${!showAiModal ? 'hidden' : ''}`}>
        <div className="modal-content glass-card">
          <div className="modal-header">
            <h3><i className="fas fa-robot"></i> AI Resume Review Backend</h3>
            <button onClick={() => setShowAiModal(false)} className="close-btn"><i className="fas fa-times"></i></button>
          </div>
          
          <div className="ai-section">
            {aiLoading ? (
              <div className="loader-container">
                <div className="ai-scanner"></div>
                <p>Analyzing with Server-Side Gemini API...</p>
              </div>
            ) : aiResult ? (
              <>
                <div className="score-container">
                  <div 
                    className="score-dial" 
                    style={{
                      '--score-pct': aiResult.score,
                      '--score-color': aiResult.score >= 80 ? 'var(--success)' : aiResult.score >= 60 ? 'var(--warning)' : 'var(--danger)'
                    }}
                  >
                    <span>{aiResult.score}</span><span style={{fontSize: '1rem'}}>/100</span>
                  </div>
                </div>
                <div className="feedback-container">
                  <h4><i className="fas fa-lightbulb"></i> Recommendations</h4>
                  <ul id="ai-feedback-list">
                    {aiResult.feedback.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
