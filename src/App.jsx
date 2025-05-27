import React, { useState, useEffect } from "react";

export default function NKBTracker() {
  const [view, setView] = useState(""); // no tab selected initially
  const [wins, setWins] = useState([]);
  const [losses, setLosses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          "https://docs.google.com/spreadsheets/d/e/2PACX-1vRE3djUiBJhXQdaEbXaNdu7qCOjXmwYC0M6rIdDIPGMG-Gjhrviqwn4ZKL2fv02v17l74xxgALmPZ80/pub?output=csv"
        );
        const text = await res.text();
        const rows = text.split("\n").slice(1);
        const parsed = rows.map((r) => {
          const cols = r.split(",");
          const date = cols[2];
          const bet = cols[3];
          const type = cols[4];
          const isWin = cols[0].trim() === "1";
          const isLoss = cols[1].trim() === "1";
          return {
            date,
            bet,
            type,
            outcome: isWin ? "win" : isLoss ? "loss" : "",
          };
        });

        const winList = parsed.filter((r) => r.outcome === "win");
        const lossList = parsed.filter((r) => r.outcome === "loss");

        setWins(winList);
        setLosses(lossList);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load data.");
      }
    }

    fetchData();
  }, []);

  const totalWins = wins.length;
  const totalLosses = losses.length;
  const winRate = ((totalWins / (totalWins + totalLosses)) * 100).toFixed(1);

  const renderRows = (records) => {
    const sorted = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
    return (
      <div style={{ width: "100%" }}>
        {sorted.map((r, i) => (
          <div
            key={i}
            style={{
              padding: "12px",
              borderBottom: "1px solid #ccc",
              color: view === "wins" ? "green" : "red",
              fontSize: "1rem",
            }}
          >
            <div>{r.date}</div>
            <div>
              <strong>{r.bet}</strong> — {r.type}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        padding: "1.5rem",
        backgroundColor: "#ffffff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          textAlign: "center",
        }}
      >
        <img
          src="/logo.png"
          alt="NKB logo"
          style={{
            width: "120px",
            height: "120px",
            marginBottom: "1rem",
          }}
        />

        <h1 style={{ fontSize: "2.4rem", marginBottom: "1rem" }}>NKB Tracker</h1>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginBottom: "1rem",
            fontSize: "1rem",
          }}
        >
          <div>Wins: {totalWins}</div>
          <div>Win Rate: {isNaN(winRate) ? "-" : `${winRate}%`}</div>
          <div>Losses: {totalLosses}</div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <button
            onClick={() => setView("wins")}
            style={{
              marginRight: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              backgroundColor: view === "wins" ? "#e6ffe6" : "#f9f9f9",
              cursor: "pointer",
            }}
          >
            Show Wins
          </button>
          <button
            onClick={() => setView("losses")}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              backgroundColor: view === "losses" ? "#ffe6e6" : "#f9f9f9",
              cursor: "pointer",
            }}
          >
            Show Losses
          </button>
        </div>

        {view === "" ? (
          <div
            style={{
              marginTop: "3rem",
              fontSize: "1.6rem",
              fontWeight: "bold",
              color: "#444",
            }}
          >
            NKB, where smart bettors start.
          </div>
        ) : (
          <div style={{ textAlign: "left" }}>
            {renderRows(view === "wins" ? wins : losses)}
          </div>
        )}
      </div>
    </div>
  );
}
