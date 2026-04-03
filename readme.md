# 🚀 Next.js AI Resume Builder

A modern, highly interactive React application that allows users to seamlessly build, customize, and generate professional resumes with zero cost. Built with Next.js 16 and a suite of powerful front-end tools.

## ✨ Features

- **Dynamic Live Preview:** See your resume update instantly as you type. Real-time DOM interaction leveraging React hooks.
- **Advanced PDF Generation:** Takes a 2x-scaled high-res snapshot via `html2canvas` and maps it perfectly into `jsPDF` at A4 millimeters, guaranteeing an edge-to-edge, single-page professional export without formatting loss.
- **Link Preservation Engine:** Intelligently calculates HTML layout coordinates and overlays transparent clickable PDF hyperlinks onto the rasterized output. 
- **Native Drag & Drop:** Easily re-order Work Experience and Project sections natively, supported by React state synchronization.
- **Custom Theming:** Use CSS variables seamlessly integrated into React inline styles to dynamically change the accent colors of both the UI and the exported PDF.
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
