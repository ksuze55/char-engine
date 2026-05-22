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
    <main className="max-w-5xl mx-auto p-8 text-gray-800">
      <h1 className="text-5xl font-bold text-blue-600 mb-2">
        Char Engine
      </h1>

      <p className="text-gray-600 mb-8">
        AI-assisted workflow, document, and archival system.
      </p>

      <section className="bg-white shadow rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="border rounded-lg px-3 py-2 w-full max-w-sm mb-3 block"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="border rounded-lg px-3 py-2 w-full max-w-sm mb-3 block"
        />

        <button
          onClick={login}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Login
        </button>

        <p className="mt-3 text-sm text-gray-600">{message}</p>
      </section>

      {token && (
        <section className="bg-white shadow rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Documents</h2>

            <button
              onClick={logout}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Logout
            </button>
          </div>

          <div className="mb-6">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Document title"
              className="border rounded-lg px-3 py-2 w-full max-w-sm mb-3 block"
            />

            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Document content"
              className="border rounded-lg px-3 py-2 w-full h-32 mb-3 block"
            />

            <button
              onClick={createDocument}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Document
            </button>
          </div>

          <button
            onClick={fetchDocuments}
            className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 mb-4"
          >
            Load Documents
          </button>

          <ul className="mt-4 space-y-4">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="bg-gray-50 border border-gray-200 rounded-xl p-5"
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  {doc.title}
                </h3>

                <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                  {doc.content}
                </p>

                <small className="block mt-2 text-gray-500">
                  Created: {new Date(doc.createdAt).toLocaleString()}
                </small>

                <button
                  onClick={() => summarizeDocument(doc.id)}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Summarize
                </button>

                {summaries[doc.id] && (
                  <p className="mt-3 text-gray-700">
                    <strong>Summary:</strong> {summaries[doc.id]}
                  </p>
                )}

                <div className="mt-4">
                  <input
                    value={questions[doc.id] || ""}
                    onChange={(e) =>
                      setQuestions({
                        ...questions,
                        [doc.id]: e.target.value
                      })
                    }
                    placeholder="Ask this document a question"
                    className="border rounded-lg px-3 py-2 w-full max-w-md"
                  />

                  <button
                    onClick={() => askDocument(doc.id)}
                    className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Ask
                  </button>

                  {answers[doc.id] && (
                    <p className="mt-3 text-gray-700">
                      <strong>Answer:</strong> {answers[doc.id]}
                    </p>
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