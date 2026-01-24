# Cloudflare Turnstile Bypass

A robust solution to obtain `cf_clearance` cookies and Turnstile tokens using advanced browser automation techniques. This project utilizes patched Puppeteer instances and human-like interaction simulations to navigate Cloudflare protections.

## 🚀 Features

- **Advanced Evasion**: Uses `rebrowser-puppeteer-core` to bypass standard automation detection.
- **Human Simulation**: `ghost-cursor` integrates realistic mouse movements and variability to pass behavioral checks.
- **API Driven**: Built with Express to provide a simple HTTP interface for requesting tokens.
- **Dual Modes**: Supports both Cloudflare Turnstile and IUAM (I'm Under Attack Mode) challenges.

## 🛠 Installation

```bash
bun install
```

## ⚡ Usage

1. **Start the API server:**
   ```bash
   npm start
   # or
   bun src/index.ts
   ```
   The server defaults to port `8742`.

2. **Request a Bypass:**
   Send a POST request to `http://localhost:8742/cloudflare`.

   **Payload Example (Turnstile):**
   ```json
   {
       "mode": "turnstile",
       "domain": "https://target-site.com",
       "siteKey": "0x4AAAAAA..."
   }
   ```

   **Payload Example (IUAM):**
   ```json
   {
       "mode": "iuam",
       "domain": "https://target-site.com/protected"
   }
   ```

3. **Run Tests:**
   ```bash
   npm test
   ```

## 🧠 How It Works

This tool operates by orchestrating a "headful" (or simulated headful) browser session that mimics a real user's environment.

1.  **Browser Orchestration**: It launches a Chrome instance using `rebrowser-puppeteer-core`. This version of Puppeteer includes patches to hide standard automation flags (like `navigator.webdriver`) and fix Runtime.enable leaks that Cloudflare often detects.
2.  **Navigation & Interaction**: The browser navigates to the target domain.
3.  **Behavioral Mimicry**: Instead of simply waiting or clicking coordinates, `ghost-cursor` generates B-spline path mouse movements, random pauses, and overshooting, which are characteristic of human hand movement. This "noise" satisfies the behavioral analysis components of Cloudflare's heuristic engine.
4.  **Extraction**: Once the challenge is solved (verified by the presence of a token or cookie), the automation extracts the `cf_clearance` cookie and returns it to the client.

## 🛡 Mitigation & Protection

Protecting against this type of advanced "browser-based" bypass is challenging because the traffic looks identical to a legitimate Chrome user. However, here are methods to detect or mitigate it:

1.  **Strict Behavioral Analysis**: Cloudflare's "Interactive" or "Managed" challenge levels are harder to bypass than "Non-Interactive". Increasing the security level forces more complex interactions that simple mouse movers might fail.
2.  **Environment Fingerprinting**: While this tool patches known flags, advanced fingerprinting (canvas, audio, WebGL, fonts) can sometimes identify slight discrepancies between a genuine consumer OS and a server-grade OS (like Linux with XVFB).
3.  **IP Reputation**: Automation often runs on data center IPs. Blocking or challenging data center IP ranges (ASN blocking) is one of the most effective defenses, forcing attackers to use expensive residential proxies.
4.  **Honeypots**: Implement invisible overlay elements. If a "cursor" interacts with them (which automated scripts might do if they blindly target elements), flag the session.
5.  **TLS Fingerprinting**: Ensure your WAF checks for JA3/JA4 TLS fingerprints. Although Puppeteer uses a real browser network stack, the way it's orchestrated sometimes leaves trace timing differences.

## 👤 Author

**Amber Bisht**
- Website: [amberbisht.me](https://amberbisht.me)

---
*Disclaimer: This tool is for educational and research purposes only. Using it to bypass security controls on systems you do not own is unauthorized.*
