import React, { useState } from "react";
import config from "./config";

function App() {
  const [rules, setRules] = useState([]);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [pattern, setPattern] = useState("");
  const [required, setRequired] = useState(true);
  const [severity, setSeverity] = useState("HIGH");
  const [productUrl, setProductUrl] = useState("");
  const [report, setReport] = useState(null);

  // Fetch all rules
  const fetchRules = async () => {
    try {
      const res = await fetch(config.RULES_API_URL);
      const data = await res.json();
      setRules(data);
    } catch (err) {
      console.error("Error fetching rules:", err);
    }
  };

  // Add a new rule
  const addRule = async () => {
    try {
      const res = await fetch(config.RULES_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, description, pattern, required, severity })
      });
      if (res.ok) {
        setCode("");
        setDescription("");
        setPattern("");
        setRequired(true);
        setSeverity("HIGH");
        fetchRules();
      }
    } catch (err) {
      console.error("Error adding rule:", err);
    }
  };

  // Check compliance of product URL
  const checkCompliance = async () => {
    try {
      console.log("Checking compliance for:", productUrl);
      const res = await fetch(config.COMPLIANCE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: productUrl })
      });
      const data = await res.json();
      console.log("Compliance result:", data);
      setReport(data);
    } catch (err) {
      console.error("Error checking compliance:", err);
    }
  };

  return (
    <div style={{ margin: "20px", fontFamily: "Arial" }}>
      <h1>Compliance Checker</h1>

      {/* Rule management */}
      <h2>Manage Rules</h2>
      <div style={{ marginBottom: "10px" }}>
        <input
          placeholder="Rule Code (e.g. R01)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          placeholder="Regex Pattern"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
        />
        <select
          value={required}
          onChange={(e) => setRequired(e.target.value === "true")}
        >
          <option value="true">Required</option>
          <option value="false">Optional</option>
        </select>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
        <button onClick={addRule}>Add Rule</button>
        <button onClick={fetchRules}>Refresh Rules</button>
      </div>

      <ul>
        {rules.map((r) => (
          <li key={r.id}>
            <b>{r.code}</b> — {r.description} <br />
            Pattern: <code>{r.pattern}</code> | Required:{" "}
            {String(r.required)} | Severity: {r.severity}
          </li>
        ))}
      </ul>

      {/* Compliance check */}
      <h2>Check Product Compliance</h2>
      <div>
        <input
          style={{ width: "300px" }}
          placeholder="Enter product URL"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
        />
        <button onClick={checkCompliance}>Check</button>
      </div>

      {report && (
        <div style={{ marginTop: "20px" }}>
          <h3>Compliance Report</h3>
          <pre>{JSON.stringify(report, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
