
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
      console.log(error);
      setStatusMessage("Error: Unable to fetch details. Please wait around 4-5 seconds after uploading");
      setDob("");
      setDoe("");
    }
  }

  return (
    <div>
      <div className={styles.getDetailsButton}>
        <button onClick={fetchDetails}>
          Get Extracted Details
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
