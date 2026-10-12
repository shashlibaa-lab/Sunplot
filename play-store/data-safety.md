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

### Everything else
Name, email, phone, financial info, health, messages, photos, audio, files, calendar, contacts, app activity, web history, app info and performance, device IDs: **Not collected.**
(The app stores plans on the device only; nothing is sent to the developer. No analytics, crash reporting, ads or accounts.)

## Other App content forms
- Privacy policy URL: https://shashlibaa-lab.github.io/Sunplot/privacy.html
- Ads: **No ads**
- App access: **All functionality is available without special access** (no login)
- Target audience: **18 and over**
- Content rating questionnaire: Category **Reference, News, or Educational** or **Utility**; answer **No** to violence, sexual content, language, controlled substances, gambling, user interaction/sharing, and location sharing with other users. Expected rating: **Everyone**.
- News app: **No**
- Government app: **No** (it uses public government data but isn't made by a government)
- Financial features: **No**
- Health: **No**
