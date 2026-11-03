

import { useState } from "react";

function AIAssistant() {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const [complaintId, setComplaintId] = useState("");
    const [categoryResult, setCategoryResult] = useState(null);
    const [categoryLoading, setCategoryLoading] = useState(false);

    const sendQuestion = async (e) => {
        e.preventDefault();

        if (!question.trim() || loading) return;

        const userQuestion = question.trim();

        setMessages((previous) => [
            ...previous,
            { role: "user", text: userQuestion }
        ]);

        setQuestion("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/ai/assistant",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ question: userQuestion })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to get AI response");
            }

            setMessages((previous) => [
                ...previous,
                { role: "assistant", text: data.answer }
            ]);
        } catch (error) {
            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    text: error.message || "Could not connect to the AI assistant."
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    
const categorizeComplaint = async (e) => {
    e.preventDefault();

    if (!complaintId.trim() || categoryLoading) return;

    setCategoryLoading(true);
    setCategoryResult(null);

    try {
        const response = await fetch(
            "http://localhost:5000/ai/categorize-complaint",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    complaintId: Number(complaintId)
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to categorize complaint"
            );
        }

        setCategoryResult(data);
    } catch (error) {
        setCategoryResult({
            error: error.message || "Could not connect to the AI model."
        });
    } finally {
        setCategoryLoading(false);
    }
};

    return (
        <div className="ai-assistant-page">
            <header className="ai-page-header">
                <div className="ai-page-icon">✦</div>

                <div>
                    <h1>AI Complaint Assistant</h1>
                    <p>
                        Categorize customer issues and look up complaint
                        statuses with your local AI assistant.
                    </p>
                </div>

                <span className="ai-local-indicator">
                    <span className="ai-online-dot"></span>
                    Local AI
                </span>
            </header>

            <div className="ai-feature-grid">
                <section className="ai-panel ai-categorize-box">
                    <div className="ai-panel-heading">
                        <div className="ai-panel-icon">✦</div>
                        <div>
                            <h2>Complaint Categorization</h2>
                            <p>
                                Identify the type of issue from its description.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={categorizeComplaint}>
                        <label htmlFor="ai-complaint-id">
                            Complaint ID
                        </label>

                       <input
                            id="ai-complaint-id"
                            type="number"
                            min="1"
                            step="1"
                            value={complaintId}
                            onChange={(e) => setComplaintId(e.target.value)}
                            placeholder="Enter an existing complaint ID, e.g. 10"
                            disabled={categoryLoading}
                        />
                        <button
                            type="submit"
                            className="ai-primary-button"
                            disabled={categoryLoading || !complaintId.trim()}
                        >
                            {categoryLoading
                                ? "Analyzing complaint..."
                                : "✦  Categorize Complaint"}
                        </button>
                    </form>

                    {categoryResult && (
                        <div
                            className={`ai-category-result ${
                                categoryResult.error ? "has-error" : ""
                            }`}
                            aria-live="polite"
                        >
                            {categoryResult.error ? (
                                <>
                                    <strong>Unable to categorize</strong>
                                    <p>{categoryResult.error}</p>
                                </>
                            ) : (
                                <>
                                    <span className="ai-result-label">
                                        SUGGESTED CATEGORY
                                    </span>

                                    <div className="ai-result-category">
                                        <span className="ai-result-check">✓</span>
                                        <strong>{categoryResult.category}</strong>
                                    </div>

                                    <p className="ai-result-reason">
                                        <strong>Reason:</strong>{" "}
                                        {categoryResult.reason}
                                    </p>

                                    <p className="ai-result-note">
                                        AI-generated suggestion. Review before
                                        assigning or routing a complaint.
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </section>

                <section className="ai-panel ai-chat-box">
                    <div className="ai-panel-heading">
                        <div className="ai-panel-icon chat-icon">☏</div>
                        <div>
                            <h2>Ask the Assistant</h2>
                            <p>
                                Ask about a complaint's current status.
                            </p>
                        </div>
                    </div>

                    <div className="ai-chat-window">
                        {messages.length === 0 && (
                            <div className="ai-welcome">
                                <div className="ai-welcome-icon">✦</div>
                                <h3>How can I help?</h3>
                                <p>
                                    Ask me to check a complaint using its ID.
                                </p>

                                <button
                                    type="button"
                                    className="ai-suggestion"
                                    onClick={() =>
                                        setQuestion(
                                            "What is the status of complaint 10?"
                                        )
                                    }
                                >
                                    What is the status of complaint 10?
                                    <span>→</span>
                                </button>
                            </div>
                        )}

                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`ai-message ${message.role}`}
                            >
                                <span className="ai-message-author">
                                    {message.role === "user"
                                        ? "You"
                                        : "AI Assistant"}
                                </span>
                                <p>{message.text}</p>
                            </div>
                        ))}

                        {loading && (
                            <div className="ai-thinking" aria-live="polite">
                                <span className="ai-thinking-dot"></span>
                                <span className="ai-thinking-dot"></span>
                                <span className="ai-thinking-dot"></span>
                                <span>AI is thinking...</span>
                            </div>
                        )}
                    </div>

                    <form onSubmit={sendQuestion} className="ai-chat-form">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Ask about a complaint..."
                            aria-label="Ask the AI assistant"
                            disabled={loading}
                        />

                        <button
                            type="submit"
                            className="ai-send-button"
                            disabled={loading || !question.trim()}
                        >
                            {loading ? "..." : "Send ↑"}
                        </button>
                    </form>

                    <p className="ai-chat-footnote">
                        Responses depend on the information available to the
                        local model and complaint database.
                    </p>
                </section>
            </div>
        </div>
    );
}

export default AIAssistant;
