import { useState } from "react";
import styles from "./PreviewBanner.module.css";
// Import a close icon
import { 
RxCross2
 } from "react-icons/rx";

export function PreviewBanner() {
    const [isDismissed, setIsDismissed] = useState(false);
    return (
        <div className={styles.banner} style={{ display: isDismissed ? "none" : "flex" }}>
            This is an unofficial fork of Amazeing for testing purposes. It is
            not authoritative for features or content of the precourse.
            <button
                className={styles.dismissButton}
                onClick={() => setIsDismissed(true)}
            >
                <RxCross2 size={16} />
            </button>
        </div>
    );
}
