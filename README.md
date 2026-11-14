# 🛡️ TrustHire

> **AI & Vision-Powered Recruitment Fraud Shield**  
> *Developed by Team **AlgoNex** for **FirstCommit '26 National Level Hackathon***

---

## 📌 Problem Statement
Every year, thousands of college students and freshers fall prey to predatory recruitment fraud:
- **Upfront Fee Extortion:** Fraudsters demand non-refundable "registration fees", "training charges", or "laptop deposits" before absconding.
- **Corporate Impersonation:** Bad actors masquerade as hiring managers from tech leaders (Google, Amazon, TCS) using lookalike domains or free `@gmail.com` accounts.
- **Identity Phishing:** Applicants are coerced into surrendering Aadhaar cards, PAN details, bank credentials, and OTPs under the pressure of "immediate joining with no interview."
- **The Chat Blindspot:** A critical mass of fraudulent offers circulate inside private **WhatsApp and Telegram screenshots**, bypassing traditional web-scraping filters.

---

## 💡 Solution & What It Does
**TrustHire** is an automated threat intelligence and verification engine built to protect candidates before they fall victim to hiring scams.

Users submit job links, recruiter profiles, offer letters, or chat screenshots. TrustHire cross-examines the evidence, assigns an explainable **0–100 Risk Assessment Score**, generates an interactive SVG **Recruitment Trust Graph**, and provides tailored safety directives.

---

## ⚙️ How It Works

```
[ User Upload: URLs / Documents / Screenshots ]
                       │
                       ▼
             [ React 19 Frontend ]
                       │ (Vite Proxy)
                       ▼
            [ FastAPI Backend Engine ]
 ┌─────────────────────┼─────────────────────┐
 │                     │                     │
 ▼                     ▼                     ▼
[Tesseract OCR]   [PyMuPDF / DOCX]   [DNS / SSRF / TLD]
 (Screenshots)       (Documents)      (Network Security)
 └─────────────────────┬─────────────────────┘
                       ▼
       [ Naive Bayes NLP & Heuristics ]
     (Fees, Phishing, Urgency, Mismatches)
                       │
                       ▼
      [ 0–100 Risk Engine & SQLite DB ]
                       │
                       ▼
 [ Dashboard • Risk Gauge • SVG Trust Graph • Threat Intel ]
```

1. **Multi-Modal Evidence Intake:** Accepts job URLs, recruiter links, company websites, documents (`.pdf`, `.docx`, `.txt`), and chat screenshots (`.png`, `.jpg`).
2. **Vision & Text Extraction:**
   - **Tesseract OCR & Pillow** parse raw text from WhatsApp/Telegram screenshots and scanned documents.
   - **PyMuPDF & XML parsers** extract content from PDFs and Word documents.
3. **Dual-Layer Intelligence Engine:**
   - **Machine Learning (NLP):** An in-engine **Multinomial Naive Bayes Classifier** with Laplace smoothing classifies intent across 5 threat vectors: fee extortion, identity theft, artificial urgency, salary anomalies, and recruiter legitimacy.
   - **Network Heuristics:** Validates live **DNS resolution**, flags disposable top-level domains (`.xyz`, `.top`, `.click`), and executes SSRF-safe page inspection.
4. **Scoring & Entity Graph Generation:** Blends Bayesian confidence with weighted heuristic penalties into a final status (**High Risk**, **Needs Review**, or **Verified**) while mapping entity relationships on an SVG **Trust Graph**.

---

## 🛠️ Tech Stack Used

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router v7, Lucide Icons |
| **Backend & APIs** | Python 3, FastAPI, Uvicorn (ASGI), Pydantic v2 |
| **OCR & Vision** | Tesseract OCR (`pytesseract`), Pillow (`PIL`) |
| **AI / ML & NLP** | Custom Multinomial Naive Bayes Classifier, Bayesian Log-Likelihood Engine |
| **Document Processing** | PyMuPDF (`fitz`), PyPDF, DOCX XML parser |
| **Database & ORM** | SQLite, SQLAlchemy 2.0 |
| **Security & Network** | Python `socket` (DNS resolution), `ipaddress` (SSRF Filter), Entity Graph Modeling |

---

## 🚀 How to Run

### 1. Clone the Repository
```bash
git clone https://github.com/vishwath26/TrustHire.git
cd TrustHire
```

### 2. Start the Backend (Terminal 1)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*API Swagger docs live at: `http://127.0.0.1:8000/docs`*

### 3. Start the Frontend (Terminal 2)
```powershell
npm install
npm run dev
```
*Application live at: `http://localhost:5173/`*

*(Windows users can also double-click `start_backend.bat` and `start_frontend.bat` in the root folder).*

---

## PPT Google Slide link:
https://docs.google.com/presentation/d/1EMzS3Gjm_Ohfun2CFuaPiIUuGo_2K6EI/edit?usp=sharing

---

## 👥 Team: AlgoNex

* **Anugraha Pradaa** — *AI/ML and Intelligent Systems Engineer*  
* **Shawn Williams Mc Connell** — *Backend & API Engineer*  
* **Vishwath Kathir. M** — *Frontend Engineering Lead*  

---

## 📄 License
This project is open-source and developed for the **FirstCommit '26 National Level Hackathon**.
