import { useEffect, useState } from "react";

function App() {
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("password123");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<Record<number, string>>({});
  const [questions, setQuestions] = useState<Record<number, string>>({});
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("charEngineToken");

    if (savedToken) {
      setToken(savedToken);
      setMessage("Session restored.");
    }
  }, []);

  async function login() {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.token) {
        setToken(data.token);
        localStorage.setItem("charEngineToken", data.token);
        setMessage("Login successful.");
      } else {
        setMessage(data.message || "Login failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server error.");
    }
  }

  function logout() {
    setToken("");
    setDocuments([]);
    setSummaries({});
    setQuestions({});
    setAnswers({});
    localStorage.removeItem("charEngineToken");
    setMessage("Logged out.");
  }

  async function fetchDocuments() {
    try {
      const res = await fetch("http://localhost:5000/api/documents", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load documents.");
    }
  }

  async function createDocument() {
    try {
      const res = await fetch("http://localhost:5000/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle, content: newContent })
      });

      const data = await res.json();

      if (data.id) {
        setMessage("Document created.");
        setNewTitle("");
        setNewContent("");
        fetchDocuments();
      } else {
        setMessage(data.message || "Failed to create document.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to create document.");
    }
  }

  async function summarizeDocument(id: number) {
    try {
      const res = await fetch(`http://localhost:5000/api/documents/${id}/summarize`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      setSummaries({
        ...summaries,
        [id]: data.summary || data.error || data.message || "Summary failed."
      });
    } catch (error) {
      console.error(error);
      setMessage("Failed to summarize document.");
    }
  }

  async function askDocument(id: number) {
    try {
      const res = await fetch(`http://localhost:5000/api/documents/${id}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          question: questions[id] || ""
        })
      });

      const data = await res.json();

      setAnswers({
        ...answers,
        [id]: data.answer || data.error || data.message || "Answer failed."
      });
    } catch (error) {
      console.error(error);
      setMessage("Failed to ask document.");
    }
  }

  return (
    <main
  style={{
    maxWidth: "900px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: "Arial, sans-serif"
  }}
>
      <h1>Char Engine</h1>
      <p>AI-assisted workflow, document, and archival system.</p>

      <section style={{ marginTop: "2rem" }}>
        <h2>Login</h2>

        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ display: "block", marginBottom: "0.5rem", padding: "0.5rem", width: "300px" }} />

        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" style={{ display: "block", marginBottom: "0.5rem", padding: "0.5rem", width: "300px" }} />

        <button onClick={login}>Login</button>
        <p>{message}</p>
      </section>

      {token && (
        <section style={{ marginTop: "2rem" }}>
          <h2>Documents</h2>

          <button onClick={logout} style={{ marginBottom: "1rem" }}>
            Logout
          </button>

          <div style={{ marginBottom: "1rem" }}>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Document title" style={{ display: "block", marginBottom: "0.5rem", padding: "0.5rem", width: "300px" }} />

            <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Document content" style={{ display: "block", marginBottom: "0.5rem", padding: "0.5rem", width: "500px", height: "120px" }} />

            <button onClick={createDocument}>Create Document</button>
          </div>

          <button onClick={fetchDocuments}>Load Documents</button>

          <ul style={{ marginTop: "1rem", paddingLeft: 0, listStyle: "none" }}>
            {documents.map((doc) => (
              <li key={doc.id} style={{ marginBottom: "1rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
                <h3>{doc.title}</h3>
                <p>{doc.content}</p>
                <small>Created: {new Date(doc.createdAt).toLocaleString()}</small>

                <br />

                <button onClick={() => summarizeDocument(doc.id)} style={{ marginTop: "0.5rem" }}>
                  Summarize
                </button>

                {summaries[doc.id] && (
                  <p><strong>Summary:</strong> {summaries[doc.id]}</p>
                )}

                <div style={{ marginTop: "1rem" }}>
                  <input
                    value={questions[doc.id] || ""}
                    onChange={(e) =>
                      setQuestions({
                        ...questions,
                        [doc.id]: e.target.value
                      })
                    }
                    placeholder="Ask this document a question"
                    style={{ padding: "0.5rem", width: "350px" }}
                  />

                  <button onClick={() => askDocument(doc.id)} style={{ marginLeft: "0.5rem" }}>
                    Ask
                  </button>

                  {answers[doc.id] && (
                    <p><strong>Answer:</strong> {answers[doc.id]}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

export default App;