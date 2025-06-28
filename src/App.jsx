import React from "react";
import { useState, useEffect } from "react";
import logo from "/logo.png";
import "./App.css";

export default function NKBTracker() {
  const [view, setView] = useState(null);
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
        const parsed = rows
          .map((r) => {
            const cols = r.split(",");
            const win = cols[0].trim() === "1";
            const loss = cols[1].trim() === "1";
            const date = cols[2];
            const bet = cols[3];
            const type = cols[4];
            return { date, bet, type, outcome: win ? "win" : loss ? "loss" : "" };
          })
          .filter((r) => r.outcome); // Filter out incomplete rows

        const sorted = parsed.sort((a, b) => new Date(b.date) - new Date(a.date));
        setWins(sorted.filter((r) => r.outcome === "win"));
        setLosses(sorted.filter((r) => r.outcome === "loss"));
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

  const renderRows = (records, color) => (
    <div>
      {records.map((r, i) => (
        <div
          key={i}
          style={{
            padding: "8px",
            borderBottom: "1px solid #ccc",
            color: color,
            textAlign: "center",
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

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "2rem auto",
        fontFamily: "Arial",
        textAlign: "center",
        padding: "1rem",
      }}
    >
      <img src={logo} alt="NKB Logo" style={{ width: "100px", marginBottom: "1rem" }} />
      <h1 style={{ color: "black" }}>NKB Tracker</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginBottom: "1rem",
          fontWeight: "bold",
          color: "black",
        }}
      >
        <div>Wins: {totalWins}</div>
        <div>Win Rate: {isNaN(winRate) ? "-" : `${winRate}%`}</div>
        <div>Losses: {totalLosses}</div>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setView("wins")}
          style={{ marginRight: "1rem", color: "black" }}
        >
          Show Wins
        </button>
        <button onClick={() => setView("losses")} style={{ color: "black" }}>
          Show Losses
        </button>
      </div>
      {view === null && (
        <h2 style={{ color: "black", marginTop: "3rem" }}>
          NKB, where smart bettors start.
        </h2>
      )}
      {view === "wins" && renderRows(wins, "green")}
      {view === "losses" && renderRows(losses, "red")}
    </div>
  );
}
