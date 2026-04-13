# How to Run the MineHR Application

Because the project is now a "Full Stack" application, it consists of two distinct parts that must run simultaneously for everything to work:

1. **The Backend Server** (Node.js/Express + MySQL Database)
2. **The Frontend App** (React.js/Vite)

---

### Running Both Servers Simultaneously (The Easy Way)
We have configured a command that runs **both the Frontend and Backend** in the same terminal window simultaneously!

Open your VS Code terminal, ensure you are in the main project folder (`hrms-master`), and simply run:
```bash
npm start
```

*This will boot up the Node/Express backend on port 5001 and the Vite frontend on port 5173 concurrently.*

### Open the Website
Once the terminal shows both are running, open your web browser and go to:
**👉 http://localhost:5173**
