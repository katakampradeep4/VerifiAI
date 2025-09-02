import React, { useState } from "react";
import config from "./config";

function App() {
  const [rules, setRules] = useState([]);
  const [field, setField] = useState("");
  const [rule, setRule] = useState("");
  const [description, setDescription] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [report, setReport] = useState(null);

  // Fetch all rules
  const fetchRules = async () => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/rules`);
      const data = await res.json();
      setRules(data);
    } catch (err) {
      console.error("Error fetching rules:", err);
    }
  };

  // Add a new rule
  const addRule = async () => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, rule, description })
      });
      if (res.ok) {
        setField("");
        setRule("");
        setDescription("");
        fetchRules();
      }
    } catch (err) {
      console.error("Error adding rule:", err);
    }
  };

  // Check compliance of product URL
  const checkCompliance = async () => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/compliance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: productUrl })
      });
      const data = await res.json();
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
      <div>
        <input
          placeholder="Field"
          value={field}
          onChange={(e) => setField(e.target.value)}
        />
        <input
          placeholder="Rule"
          value={rule}
          onChange={(e) => setRule(e.target.value)}
        />
        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={addRule}>Add Rule</button>
        <button onClick={fetchRules}>Refresh Rules</button>
      </div>

      <ul>
        {rules.map((r) => (
          <li key={r.id}>
            <b>{r.field}</b> — {r.rule} ({r.description})
          </li>
        ))}
      </ul>

      {/* Compliance check */}
      <h2>Check Product Compliance</h2>
      <div>
        <input
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
