import React from "react";
import styles from "./MusicEffect.module.css";

export default function MusicEffect() {
  return (
    <div className={styles.onpu}>
      <div className={`${styles.layer} ${styles.layer1}`}></div>
      <div className={`${styles.layer} ${styles.layer2}`}></div>
      <div className={`${styles.layer} ${styles.layer3}`}></div>
    </div>
  );
}
