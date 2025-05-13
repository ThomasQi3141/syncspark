# SyncSpark

A modern, real-time collaborative code editor and chat platform. Instantly create or join coding rooms, collaborate with others, and chat—all in a beautiful, responsive UI.

---

## 🚀 Features

- **Real-time collaborative code editing** (Monaco Editor, Socket.IO)
- **Room-based sessions** with unique codes
- **Live user list** with color-coded participants
- **Language and theme selection** for the editor
- **Modern chat sidebar** with notifications for unseen messages
- **Responsive, beautiful UI** (Next.js, Tailwind CSS, Framer Motion)
- **No account required**—just pick a nickname and join!
- **Automatic room cleanup** (rooms deleted after 1 minute of inactivity)

---

## 🛠️ Tech Stack

**Frontend:**

- Next.js (App Router, TypeScript)
- Tailwind CSS
- Redux Toolkit & RTK Query
- Monaco Editor (`@monaco-editor/react`)
- Framer Motion (animations)
- Socket.IO Client

**Backend:**

- Express.js (TypeScript)
- Socket.IO
- Swagger (API docs)
- In-memory room management (singleton)

---

## ✨ Usage

- **Create a room:** Click "Create a Room" and set a name and privacy.
- **Join a room:** Enter a room code or pick from the public rooms list.
- **Collaborate:** Code together, chat, and see who's online in real time.
- **Chat:** Click the chat icon to open the sidebar and send messages.

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repo
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit and push (`git commit -am 'Add new feature' && git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

MIT

---

## 👤 Author

Built with ❤️ by [Thomas Qi](https://github.com/ThomasQi3141)
