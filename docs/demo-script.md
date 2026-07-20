# Dojang Diploma — Product Demo Video Script

**Duration**: ~2 minutes 30 seconds  
**Target Audience**: GASOK Selection Committee / Hackathon Judges

---

## 1. Intro & Hook (0:00 - 0:20)
*   **Visual**: Screen shows the homepage at `/en` with the wallet disconnected. The cursor hovers over the hero header.
*   **Audio (Voiceover)**:
    > "Academically rigorous bootcamps in Korea are outputting thousands of graduates, but verifying their diplomas is still slow, manual, and prone to forgery. Today, we're showing Dojang Diploma—an on-chain verifiable certificate platform built on GIWA Sepolia Testnet, leveraging the exact same Ethereum Attestation Service (EAS) layer as GIWA's official Dojang."

---

## 2. Landing Page Tour (0:20 - 0:40)
*   **Visual**: Scroll down through the homepage. Highlight the **3-Step Explainer** (Issue, Claim, Verify) and the **Why GIWA** section highlighting sub-1s Flashblocks finality.
*   **Audio (Voiceover)**:
    > "Dojang Diploma provides a fully transparent, decentralized workflow. Organizations issue academic achievements, students claim and hold them securely in their Web3 wallets, and anyone can instantly verify them for free, without needing a wallet, thanks to public RPC lookups."

---

## 3. Issue Flow (0:40 - 1:20)
*   **Visual**: Switch to the `/issue` page. Connect a wallet (Wagmi/RainbowKit modal appears, wallet connects).
    *   Show the **Single Issue** form. Fill in sample details.
    *   Toggle to the **Batch Issue (CSV)** tab. Upload `sample-batch.csv`.
    *   Show the parsed grid: 3 rows with Alice, Bob, and John. Click "Mint Batch (3)".
    *   Confirm the Metamask popup. Show the loading state. Within ~1 second, show the success toast powered by GIWA Flashblocks, along with a table of 3 issued diplomas.
*   **Audio (Voiceover)**:
    > "Let's log in as an administrator. We connect our issuer wallet on GIWA Sepolia. For larger cohorts, Dojang Diploma supports batch issuance. We simply upload our CSV list, review the validated entries, and mint them all in a single transaction. Powered by GIWA Flashblocks, the batch is confirmed on-chain in under a second. We're instantly presented with the unique verification links for each graduate."

---

## 4. Public Verification Page & QR (1:20 - 2:00)
*   **Visual**: Open one verification link (e.g., `/verify/[uid]`) in a new incognito window (no wallet connected). Hover over the green `✓ VERIFIED ON GIWA CHAIN` badge. Scroll down to show the details card and the **Offline Verification QR Code** in the sidebar. Click "Copy Verification Link".
*   **Audio (Voiceover)**:
    > "When a recruiter opens a candidate's diploma link, they see the fully verified certificate without needing to connect any wallet. It reads directly from the EAS contract. For print layouts or paper CVs, graduates can print this card—recruiters simply scan the QR code to check authenticity instantly on their phone."

---

## 5. My Diplomas Portal & i18n Switch (2:00 - 2:30)
*   **Visual**: Open `/my-diplomas` page. Connect wallet as a student. Show the issued diploma card in the grid.
    *   Navigate back to the Header, click the language selector and switch from `🇬🇧 EN` to `🇰🇷 KO`.
    *   Show the entire UI translate instantly into natural Korean terminology, including terms like *도장* (Dojang) and *어테스테이션* (attestation).
*   **Audio (Voiceover)**:
    > "Students can also log into their personal dashboard to manage all their certifications in one place. Finally, the app fully supports localized interfaces. Toggling the language switch immediately converts the UI to Korean, utilizing official GIWA terminology like '도장' for Dojang. Dojang Diploma is ready to scale to real bootcamps as an official Dojang attester. Thank you."
