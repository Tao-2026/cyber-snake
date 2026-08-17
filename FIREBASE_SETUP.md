# CyberSnake shared leaderboard setup

The game is fully playable without Firebase. Until `firebase-config.js` is filled in, it automatically displays the local `localStorage` podium and reports offline mode.

## 1. Create a Firebase project and web app

1. Open [Firebase Console](https://console.firebase.google.com/), choose **Add project**, and create a project on the no-cost Spark plan.
2. Google Analytics is optional and is not required by CyberSnake.
3. From **Project overview**, choose the Web (`</>`) app, name it (for example `cyber-snake-pages`), and register it.
4. Copy the Web App configuration into `firebase-config.js`:

```js
export const FIREBASE_CONFIG = Object.freeze({
  apiKey: "...",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "...",
  appId: "..."
});
```

`measurementId` is optional and unused. Firebase Web App configuration is a public project identifier, not an administrator credential. Never add a service-account JSON file, private key, Admin SDK credential, `.env`, or downloaded local data to this repository.

## 2. Enable anonymous authentication

1. In Firebase Console, open **Build → Authentication**.
2. Select **Sign-in method**.
3. Enable **Anonymous** and save.
4. In **Authentication → Settings → Authorized domains**, make sure `tao-2026.github.io` is present. Keep `localhost` only if local testing needs it.

Each browser profile receives a persistent anonymous UID. No registration screen is shown.

## 3. Create Firestore

1. Open **Build → Firestore Database → Create database**.
2. Choose **Production mode**.
3. Select a region near the expected players. The database location cannot be changed later.
4. Keep the project on Spark unless you intentionally decide to add billing.

## 4. Publish the security rules and index

Copy the complete contents of `firestore.rules` into **Firestore Database → Rules**, then publish. The rules:

- require Firebase Authentication for every read and write;
- use the anonymous UID as the document ID and `playerId`;
- allow a player to create or improve only their own record;
- reject deletes and arbitrary fields;
- validate all leaderboard field types and ranges;
- require `createdAt` to equal `request.time`, which works with `serverTimestamp()`;
- require at least ten seconds between updates of an existing player record.

Create the composite index from `firestore.indexes.json`. The easiest options are:

- run `firebase deploy --only firestore:rules,firestore:indexes` from an intentionally configured Firebase CLI environment; or
- make one leaderboard query, follow the missing-index link shown by Firestore, and create the index with `score` descending, `cores` descending, and `createdAt` ascending.

Do not loosen the rules to `allow read, write: if true` during testing.

## 5. Data model and ranking

Collection: `leaderboard`

Document ID: the anonymous Firebase UID

Fields:

- `playerId` — anonymous UID
- `emoji` — selected podium Emoji
- `score` — competitive score and primary rank key
- `cores` — total cores and first tie-breaker
- `createdAt` — Firestore server timestamp and final tie-breaker (earlier wins)
- `gameVersion` — release string such as `v008`
- `runDuration` — active run duration in milliseconds
- `maxLength` — maximum snake length

One document per UID means each anonymous player has only one global best. A transaction replaces it only when the score improves, or when the score ties and cores improve.

## 6. Spark limits and cost controls

Current Firestore free quota is 1 GiB stored data, 50,000 document reads/day, 20,000 writes/day, 20,000 deletes/day, and 10 GiB outbound transfer/month. Quotas reset daily around midnight Pacific time, and each project has one free-quota database.

To avoid unexpected cost:

- stay on Spark and do not link a billing account;
- read only the global Top 3 on initial load and after a successful submission;
- keep one document per anonymous player;
- submit only qualifying scores, with client and rules throttling;
- monitor **Firestore → Usage** and **Authentication → Usage**;
- do not enable paid-only features such as backups, point-in-time recovery, cloning, or TTL deletion.

Spark does not require payment information. When its quota is exhausted, requests fail until quota resets instead of silently charging a card. The game then keeps working with its local podium.

## 7. Validation checklist

1. Open the deployed site in two separate browser profiles or one normal and one private window.
2. Confirm each profile receives a different anonymous UID in Firebase Authentication.
3. Submit a qualifying score in profile A, refresh profile B, and confirm the same podium appears.
4. Submit scores that test score ordering, cores tie-breaking, and earlier `createdAt` tie-breaking.
5. Confirm only the best document for each UID remains.
6. Disable the network, reload, and confirm the local podium and game continue to work.
7. Re-enable the network and confirm a pending failed score retries once.
8. Verify English/Chinese status text and the 360 px mobile layout.
9. Check the browser console and Firestore Usage page.

## 8. Clean test data

Client-side deletion is intentionally blocked. To reset tests, use **Firestore Database → Data → leaderboard**, select the test documents, and delete them as a project administrator. You may also delete test anonymous accounts from **Authentication → Users**. Deleting an Auth user does not automatically delete its Firestore document, so clean both lists when required.

## 9. Security limitations and future server validation

This is a static, client-authoritative game. Security Rules protect document ownership and data shape, but they cannot prove that a submitted score came from an honest game. Browser code can be modified, so this release does **not** provide server-grade anti-cheat.

A stronger future design should send compact run inputs or signed checkpoints to a trusted Cloud Function or Cloud Run service. The server should replay or validate movement timing, food generation, score progression, run duration, and maximum length, then write the leaderboard with the Admin SDK. Add Firebase App Check and abuse monitoring as defense-in-depth. Deploying server compute generally requires intentionally moving to a billing-enabled plan, so evaluate budgets and alerts before that upgrade.
