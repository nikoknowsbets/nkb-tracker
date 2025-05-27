import React, { useState, useEffect } from "react";
import "./App.css";

export default function NKBTracker() {
  const [view, setView] = useState("");
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

        setWins(parsed.filter((r) => r.outcome === "win"));
        setLosses(parsed.filter((r) => r.outcome === "loss"));
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
    return sorted.map((r, i) => (
      <div key={i} className={`row ${r.outcome}`}>
        <div>{r.date}</div>
        <div>
          <strong>{r.bet}</strong> — {r.type}
        </div>
      </div>
    ));
  };

  return (
    <div className="container">
      <div className="inner">
        <img src="/logo.png" alt="NKB logo" className="logo" />
        <h1>NKB Tracker</h1>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="summary">
          <div>Wins: {totalWins}</div>
          <div>Win Rate: {isNaN(winRate) ? "-" : `${winRate}%`}</div>
          <div>Losses: {totalLosses}</div>
        </div>

        <div>
          <button
            onClick={() => setView("wins")}
            className={view === "wins" ? "active" : ""}
          >
            Show Wins
          </button>
          <button
            onClick={() => setView("losses")}
            className={view === "losses" ? "loss" : ""}
          >
            Show Losses
          </button>
        </div>

        {view === "" ? (
          <div className="welcome">NKB, where smart bettors start.</div>
        ) : (
          renderRows(view === "wins" ? wins : losses)
        )}
      </div>
    </div>
  );
}
