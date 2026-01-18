# LIVE DEMO LINK : https://sensational-longma-d93e41.netlify.app/


# Professional Resume Builder (HTML/JS)

Create a clean, professional resume instantly with this ready-to-use web application. Perfect for students, job seekers, and professionals who want a modern resume without spending hours formatting.

---

## Features

- **Live Preview**: See your resume update in real-time as you type.  
- **Add Multiple Skills**: Showcase all your abilities with ease.  
- **Add Work Experience**: Add multiple job entries with title, company, duration, and description.  
- **Download as PDF**: Generate a professional-looking resume in PDF format.  
- **Classic Professional Template**: Elegant and clean design suitable for any industry.  
- **Customizable Website Background**: Supports background images with adjustable opacity.  
- **Offline Ready**: No internet connection or login required.  
- **Local Storage Support**: Save your resume data for later editing.

---

## Demo

![Demo Screenshot](screenshot.png)  


---

## How to Use

1. Open `index.html` in a browser.
2. Fill in your **name, email, phone, summary, skills, education, and experience**.
3. Click **Add Skill** to add skills.
4. Click **Add Experience** to add job experiences.
5. Click **Save** to store your data in local storage.
6. Click **Download PDF** to generate your resume.

---

## Customization

- **Change Background Image**: Replace `background.jpg` in the folder and edit `style.css`:

```css
body {
  background-image: url('background.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.8; /* adjust transparency */
}
