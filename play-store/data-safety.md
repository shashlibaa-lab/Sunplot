# Google Play: Data safety answers for Sunplot

Use these in Play Console → App content → Data safety. They match privacy.html. Update both if the app changes (for example, adding accounts, analytics, ads or cloud sync).

## Overview questions
- Does your app collect or share any of the required user data types? **Yes**
- Is all of the user data collected by your app encrypted in transit? **Yes** (every service is HTTPS)
- Do you provide a way for users to request that their data is deleted? **Yes.** Data is stored only on the device; users delete a place with "Delete this place", or clear the app's data or uninstall. Owners can email to have owner details hidden.

## Data types
### Location → Approximate location and Precise location
- Collected: **Yes** (only when the user taps the location button)
- Shared: **No** (sent only to the map services that answer the user's own lookup, which Google counts as a user-initiated transfer, not sharing)
- Processed ephemerally: **No** (the app can't guarantee how the outside services log requests)
- Required or optional: **Optional** (users can decline and search instead)
- Purpose: **App functionality**

### Personal info → Address
(The street address a user types into search.)
- Collected: **Yes**
- Shared: **No** (user-initiated lookup)
- Processed ephemerally: **No**
- Required or optional: **Optional**
- Purpose: **App functionality**

### App info and performance → Diagnostics
(The "Report a problem" email: app version, phone model, recent loading errors.)
- Collected: **Yes**. The report goes through the user's own email app, but you receive it, so declaring it is the safe answer.
- Shared: **No**
- Processed ephemerally: **No**
- Required or optional: **Optional** (only when the user chooses to send a report)
- Purpose: **App functionality** (fixing problems)

### Personal info → Email address
- Collected: **Yes**, only because a problem report arrives from the user's email address. Optional. Purpose: **Developer communications** and **App functionality**. Not shared.

### Financial info → Purchase history
(The Google Play receipt code for Sunplot Pro, sent to the purchase checker to unlock Pro.)
- Collected: **Yes**
- Shared: **No**
- Processed ephemerally: **No**
- Required or optional: **Optional** (only when someone buys Pro)
- Purpose: **App functionality**

### Everything else
Name, phone, payment info (cards and bank accounts are handled only by Google), health, messages, photos, audio, files, calendar, contacts, app activity, web history, crash logs, device IDs: **Not collected.**
(The app stores plans on the device only. Backup files are saved on the device and go only where the user puts them. Nothing is sent to the developer except a problem report the user chooses to email. No analytics, automatic crash reporting, ads or accounts.)

## Other App content forms
- Privacy policy URL: https://shashlibaa-lab.github.io/Sunplot/privacy.html
- Terms of use (for the store listing or description, optional): https://shashlibaa-lab.github.io/Sunplot/terms.html
- Ads: **No ads**
- App access: **All functionality is available without special access** (no login)
- Target audience: **18 and over**
- Content rating questionnaire: Category **Reference, News, or Educational** or **Utility**; answer **No** to violence, sexual content, language, controlled substances, gambling, user interaction/sharing, and location sharing with other users. Expected rating: **Everyone**.
- News app: **No**
- Government app: **No** (it uses public government data but isn't made by a government)
- Financial features: **No**
- In-app purchases: **Yes** (Sunplot Pro, one-time, through Google Play Billing)
- Health: **No**
