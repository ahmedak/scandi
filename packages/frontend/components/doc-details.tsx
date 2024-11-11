
"use client";

import { useState } from "react";
import styles from "./doc-details.module.css";

export default function DocDetails({ url, docId } : {url: string, docId: string}) {
  const [statusMessage, setStatusMessage] = useState("");
  const [dob, setDob] = useState("");
  const [doe, setDoe] = useState("");

  async function fetchDetails() {
    try {
      const response = await fetch(`${url}/docs/${docId}`);
      if (!response.ok) throw new Error("Failed to fetch details");

      const data = await response.json();
      
      setDob(data.dateOfBirth || "N/A");
      setDoe(data.dateOfExpiry || "N/A");
      setStatusMessage("Details fetched successfully");
    } catch (error) {
      setStatusMessage("Error: Unable to fetch details");
      setDob("");
      setDoe("");
    }
  }

  return (
    <div>
      <div className={styles.ctas}>
        <button className="primary" onClick={fetchDetails}>
          Get Details
        </button>
      </div>
      <div className={styles.statusBox}>
        {statusMessage && <p>{statusMessage}</p>}
        {dob && <p>Date of Birth: {dob}</p>}
        {doe && <p>Date of Expiry: {doe}</p>}
      </div>
    </div>
  );
}
