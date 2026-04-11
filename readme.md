# 🚀 Next.js AI Resume Builder PRO

A modern, highly interactive React application that allows users to seamlessly build, customize, and generate professional resumes. Built with Next.js 16, Google Gemini AI, and a suite of powerful front-end tools.

## ✨ Features

- **Dynamic Live Preview:** See your resume update instantly as you type. Real-time DOM interaction leveraging React hooks.
- **AI Bullet Enhancer (New):** Click the "AI Magic Wand" on any experience bullet point. The backend Gemini AI will automatically rewrite and enhance your text to sound more professional and results-oriented.
- **Multi-Profile Management (New):** Save multiple variants of your resume to local storage and switch between them instantly using the top profile switcher.
- **Advanced PDF Generation:** Takes a high-res snapshot via `html2canvas` and maps it perfectly into `jsPDF` at A4 size without formatting loss.
- **Link Preservation Engine:** Intelligently calculates layout coordinates and overlays transparent clickable PDF hyperlinks. Now supports **LinkedIn, GitHub, and Portfolio integration**.
- **Native Drag & Drop:** Easily re-order your Skills, Work Experience, and Project sections natively using HTML5 drag-and-drop APIs.
- **Rich Text Formatting:** Pseudo-markdown support allows you to easily inject `**bold**` and `*italic*` text dynamically into the PDF renderer.
- **Dark Mode & Glassmorphism:** Sleek UI with a real-time dark mode toggle, hover micro-animations, and custom built-in typography (`Inter` & `Outfit`).
- **JSON Data Portability:** Full data-ownership — export your resume raw data as a JSON file, and import it later to pick up right where you left off.
- **Fallback-Proof AI Reviews:** Built-in Next.js Route Handlers (`/api/review`) supporting Gemini AI, equipped with graceful fallbacks if API keys are absent.

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** CSS variables + Glassmorphism UI
- **PDF Generation:** `jsPDF` & `html2canvas`
- **Generative AI:** Google Gemini SDK

## 🚀 Quick Start

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

## 💡 Engineering Highlights

The PDF generation solves strict browser-print limitations by rasterizing the HTML container into a canvas, measuring scaling ratios, and writing the element forcefully into a strictly dimensioned 210mm `jsPDF` canvas. 

Because `html2canvas` turns elements into flat images (which disables hyperlinks), this app includes a custom engine that calculates relative UI node coordinates (`<a>` tags) and dynamically restores them as clickable, transparent overlay boxes directly over the final PDF output.

---
*Built and engineered to showcase advanced front-end state formatting and problem-solving.*
