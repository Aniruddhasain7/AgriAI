import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../api/client";
import {
  Bot,
  User,
  Send,
  Sparkles,
  RefreshCw,
  MessageSquare,
  Trash2,
  Sprout,
  ShieldAlert,
  Thermometer,
  Bug,
} from "lucide-react";

const sessionId = crypto.randomUUID();

export default function Chatbot() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const langMap = {
    en: "English",
    hi: "Hindi",
    bn: "Bengali",
  };

  const currentLangCode = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];
  const activeLanguage = langMap[currentLangCode] || "English";

  const promptSuggestions = [
    {
      id: "fertilizer",
      icon: Sprout,
      text: t("chatbot.chips.fertilizer", "What fertilizer is best for wheat in acidic soil?"),
    },
    {
      id: "disease",
      icon: ShieldAlert,
      text: t("chatbot.chips.disease", "How can I prevent early blight in potatoes?"),
    },
    {
      id: "temperature",
      icon: Thermometer,
      text: t("chatbot.chips.temperature", "What is the ideal sowing temperature for maize?"),
    },
    {
      id: "pest",
      icon: Bug,
      text: t("chatbot.chips.pest", "How to manage whitefly infestation on tomato crops?"),
    },
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const clearChat = () => {
    setMessages([]);
    setInput("");
  };

  const sendMessage = async (textToSend) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: messageText }]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const data = await api.sendChatMessage(
        messageText,
        sessionId,
        activeLanguage,
      );
      if (data.error) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: t(
            "chatbot.error",
            "Sorry, I ran into an issue processing your request. Please try again."
          ),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
      <div className="page-header">
        <div className="page-badge">
          <Bot size={14} />
          <span>{t("chatbot.badge", "AgriAI Expert Assistant")}</span>
        </div>
        <h1 className="page-title">{t("chatbot.title", "Farmer Assistant")}</h1>
        <p className="page-subtitle">
          {t(
            "chatbot.subtitle",
            "Ask any question regarding crop diseases, fertilizers, weather protection, or market decisions in your language."
          )}
        </p>
      </div>

      <div
        className="glass-card"
        style={{
          padding: "0",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: "min(640px, calc(100vh - 200px))",
          minHeight: "440px",
        }}
      >
        <div
          style={{
            padding: "12px 18px",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--bg-card)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--primary-500)",
                display: "inline-block",
                boxShadow: "0 0 8px var(--primary-500)",
              }}
            />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>
              {t("chatbot.badge", "AgriAI Expert Assistant")} ({activeLanguage})
            </span>
          </div>

          {messages.length > 0 && (
            <button
              onClick={clearChat}
              style={{
                background: "transparent",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
                padding: "4px 10px",
                fontSize: "12px",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--accent-red, #ef4444)";
                e.currentTarget.style.borderColor = "var(--accent-red, #ef4444)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.borderColor = "var(--border-color)";
              }}
              title={t("chatbot.clear", "Clear Chat")}
            >
              <Trash2 size={12} />
              <span>{t("chatbot.clear", "Clear Chat")}</span>
            </button>
          )}
        </div>

        <div
          style={{
            flex: 1,
            padding: "20px 16px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            background: "var(--bg-app)",
          }}
        >
          {messages.length === 0 && (
            <div style={{ margin: "auto", textAlign: "center", maxWidth: "520px" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "rgba(16, 185, 129, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  color: "var(--primary-500)",
                }}
              >
                <Sparkles size={32} />
              </div>
              <h3 style={{ fontSize: "20px", marginBottom: "8px", color: "var(--text-main)" }}>
                {t("chatbot.welcome_title", "Welcome to AgriAI Assistant")}
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px", lineHeight: 1.5 }}>
                {t(
                  "chatbot.welcome_subtitle",
                  "Select a suggested topic below or type your question in the box to get started."
                )}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
                {promptSuggestions.map((item) => {
                  const IconComp = item.icon || MessageSquare;
                  return (
                    <button
                      key={item.id}
                      onClick={() => sendMessage(item.text)}
                      style={{
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-full)",
                        padding: "9px 16px",
                        fontSize: "13px",
                        color: "var(--text-main)",
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.2s ease",
                        boxShadow: "var(--shadow-xs)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--primary-500)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border-color)";
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "var(--shadow-xs)";
                      }}
                    >
                      <IconComp size={14} style={{ color: "var(--primary-500)", flexShrink: 0 }} />
                      <span>{item.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                alignItems: "flex-start",
              }}
            >
              {m.role === "bot" && (
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "var(--primary-600)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    flexShrink: 0,
                  }}
                >
                  <Bot size={20} />
                </div>
              )}

              <div
                style={{
                  maxWidth: "85%",
                  padding: "14px 18px",
                  borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background:
                    m.role === "user"
                      ? "linear-gradient(135deg, var(--primary-600) 0%, var(--primary-500) 100%)"
                      : "var(--bg-input)",
                  color: m.role === "user" ? "#ffffff" : "var(--text-main)",
                  border: m.role === "user" ? "none" : "1px solid var(--border-color)",
                  boxShadow: "var(--shadow-sm)",
                  fontSize: "14.5px",
                  lineHeight: 1.6,
                }}
              >
                {m.role === "user" ? (
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
                ) : (
                  <div className="chatbot-markdown">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ node, ...props }) => (
                          <div className="chatbot-markdown-table-wrapper">
                            <table {...props} />
                          </div>
                        ),
                      }}
                    >
                      {typeof m.text === "string"
                        ? m.text
                            .replace(/<br\s*\/?>/gi, "\n\n")
                            .replace(/&nbsp;/gi, " ")
                        : m.text}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {m.role === "user" && (
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--primary-400)",
                    flexShrink: 0,
                  }}
                >
                  <User size={20} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "var(--primary-600)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                }}
              >
                <Bot size={20} />
              </div>
              <div
                style={{
                  padding: "12px 18px",
                  borderRadius: "18px 18px 18px 4px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-color)",
                  fontSize: "14px",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <RefreshCw size={16} className="spinner" />
                <span>{t("chatbot.thinking", "AgriAI is thinking...")}</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {messages.length > 0 && (
          <div
            style={{
              padding: "8px 16px",
              background: "var(--bg-card)",
              borderTop: "1px solid var(--border-color)",
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              whiteSpace: "nowrap",
              scrollbarWidth: "none",
            }}
          >
            {promptSuggestions.map((item) => {
              const IconComp = item.icon || MessageSquare;
              return (
                <button
                  key={item.id}
                  onClick={() => sendMessage(item.text)}
                  disabled={loading}
                  style={{
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-full)",
                    padding: "5px 12px",
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    cursor: loading ? "not-allowed" : "pointer",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.color = "var(--text-main)";
                      e.currentTarget.style.borderColor = "var(--primary-500)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-muted)";
                    e.currentTarget.style.borderColor = "var(--border-color)";
                  }}
                >
                  <IconComp size={12} style={{ color: "var(--primary-500)" }} />
                  <span>{item.text}</span>
                </button>
              );
            })}
          </div>
        )}

        <div
          style={{
            padding: "14px 16px",
            background: "var(--bg-card)",
            borderTop: "1px solid var(--border-color)",
            display: "flex",
            gap: "10px",
            alignItems: "center",
            width: "100%",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={t(
              "chatbot.placeholder",
              "Ask anything about farming, crops, fertilizer, pest control..."
            )}
            style={{
              flex: "1 1 0%",
              minWidth: "0",
              padding: "12px 16px",
              background: "var(--bg-input)",
              border: "1.5px solid var(--border-color)",
              borderRadius: "var(--radius-full)",
              color: "var(--text-main)",
              fontSize: "14.5px",
              outline: "none",
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="btn-primary btn-icon"
            aria-label={t("chatbot.send", "Send message")}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              padding: "0",
              flexShrink: 0,
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
