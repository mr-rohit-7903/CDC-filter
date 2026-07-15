# CDC ERP Placement Filter

A modern, fast, and secure browser extension for the IIT Kharagpur ERP portal. This extension automatically optimizes your placement/internship dashboard by filtering out expired companies and checking CGPA eligibility in the background.

## Features

- **Automated Deadline Filtering:** Instantly hides companies whose resume upload deadline has passed, keeping your dashboard clutter-free.
- **Smart CGPA Eligibility Check:** Automatically fetches and checks if you meet the CGPA cutoff for each active company without you having to click "Apply" manually.
- **One-Click Toggle:** Easily toggle between seeing all companies or just the active and eligible ones via a floating button.
- **Color-Coded Status:** 
  - 🟢 **Light Green:** Active and Eligible
  - 🔴 **Faded Red:** Expired or Ineligible

## Installation Instructions

This extension is built for Chromium-based browsers (Google Chrome, Brave, Edge, etc.).

1. **Download the code:**
   - Clone this repository: 
     ```bash
     git clone https://github.com/mr-rohit-7903/CDC-filter.git
     ```
   - Or, click **Code > Download ZIP** and extract the folder.

2. **Open your Browser's Extension Page:**
   - For **Chrome**: Go to `chrome://extensions/`
   - For **Brave**: Go to `brave://extensions/`

3. **Enable Developer Mode:**
   - Find the "Developer mode" toggle in the top right corner and turn it **ON**.

4. **Load the Extension:**
   - Click the **Load unpacked** button in the top left corner.
   - Select the `CDC-filter` folder (the directory containing the `manifest.json` file).

5. **Test it out:**
   - Go to your IIT KGP ERP Placement dashboard and refresh the page. You should see the new extension UI and the filters applying immediately!

## Privacy and Security

- **100% Local Processing:** The extension only runs locally in your browser.
- **No Data Collection:** Your roll number and ERP data are never stored or sent anywhere outside of the official ERP platform.
- **Server Friendly:** It uses a queued background checking system with delays to ensure it does not spam the ERP servers.
