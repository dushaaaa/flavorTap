# Flavor Tap  
Listen. Look. Tap.

Flavor Tap is a fast-paced web game where players identify soda flavors through audio cues and tap the correct can before time runs out.

---

## Live Demo  
https://flavor-tap.vercel.app/

---

## How to Play

- A flavor name is announced  
- Find the matching can  
- Tap it before time runs out  

- Get 5 correct answers to clear a round  
- Complete both rounds to win  

---

## Features

- Audio-driven gameplay  
- Responsive, mobile-friendly UI  
- Smooth animations and feedback  
- Progressive Web App (works without continuous internet)

---

## Project Structure
```bash
flavor-tap/
│── index.html
│── style.css
│── script.js
│── sw.js
│── README.md
```


---
## Run Locally

### Option 1: Direct Open  
1. Download and extract the files  
2. Open `index.html` in your browser  

---

### Option 2: Local Server (Recommended)

**Using VS Code (Live Server):**
1. Open the folder in VS Code  
2. Install Live Server  
3. Right-click `index.html` → Open with Live Server  

**Using Python:**
```bash
python -m http.server 8000
```

Then open:
```bash
http://localhost:8000
```

---

## Tech Stack

- HTML, CSS, JavaScript  
- Web Audio API  
- Speech Synthesis API  
- Service Workers  

---

## Notes

- Audio might starts after first user interaction for mobile
- Voice output may vary depending on the device  

---

## Credits

Developed for a client project (One Atomik) under QT Solutions, focusing on interactive and sensory-driven web experiences.