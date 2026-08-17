import { FIREBASE_CONFIG, FIREBASE_CONFIGURED } from "./firebase-config.js";

const SDK_VERSION = "12.16.0";
const COLLECTION = "leaderboard";
const SUBMIT_COOLDOWN_MS = 15000;
const MAX_SCORE = 10000000;
const MAX_CORES = 600;
const MAX_DURATION_MS = 86400000;
const MAX_LENGTH = 576;
const VERSION_PATTERN = /^v\d{3}$/;

export function isValidLeaderboardEntry(entry) {
  return entry
    && typeof entry.emoji === "string" && entry.emoji.length >= 1 && entry.emoji.length <= 16
    && Number.isInteger(entry.score) && entry.score > 0 && entry.score <= MAX_SCORE
    && Number.isInteger(entry.cores) && entry.cores > 0 && entry.cores <= MAX_CORES
    && Number.isInteger(entry.runDuration) && entry.runDuration >= 0 && entry.runDuration <= MAX_DURATION_MS
    && Number.isInteger(entry.maxLength) && entry.maxLength >= 4 && entry.maxLength <= MAX_LENGTH
    && typeof entry.gameVersion === "string" && VERSION_PATTERN.test(entry.gameVersion);
}

export function compareLeaderboardEntries(a, b) {
  return b.score - a.score || (b.cores || 0) - (a.cores || 0) || (a.createdAt || 0) - (b.createdAt || 0);
}

export function shouldReplacePersonalBest(previous, entry) {
  return !previous
    || entry.score > previous.score
    || (entry.score === previous.score && entry.cores > previous.cores);
}

export function createSubmissionGuard({ cooldown = SUBMIT_COOLDOWN_MS, now = () => Date.now() } = {}) {
  let lastSubmitAt = 0;
  let lastFingerprint = "";
  return {
    claim(entry) {
      const timestamp = now();
      const fingerprint = `${entry.score}:${entry.cores}:${entry.emoji}:${entry.runDuration}:${entry.maxLength}`;
      if (fingerprint === lastFingerprint || timestamp - lastSubmitAt < cooldown) {
        throw new Error("submission-throttled");
      }
      lastFingerprint = fingerprint;
      lastSubmitAt = timestamp;
    },
    reset() {
      lastFingerprint = "";
      lastSubmitAt = 0;
    }
  };
}

function normalizeSnapshot(snapshot) {
  return snapshot.docs.map(item => {
    const data = item.data();
    return {
      playerId: data.playerId,
      emoji: data.emoji,
      score: data.score,
      cores: data.cores,
      runDuration: data.runDuration,
      maxLength: data.maxLength,
      gameVersion: data.gameVersion,
      createdAt: data.createdAt?.toMillis?.() || 0
    };
  });
}

export function createLeaderboardService({
  onStatus = () => {},
  configured = FIREBASE_CONFIGURED
} = {}) {
  let api = null;
  let auth = null;
  let db = null;
  let user = null;
  const submissionGuard = createSubmissionGuard();

  function status(value, detail = "") { onStatus({ value, detail }); }

  async function init() {
    if (!configured) {
      status("offline", "unconfigured");
      return { online:false, reason:"unconfigured", playerId:null, scores:[] };
    }

    status("connecting");
    try {
      const [appModule, authModule, firestoreModule] = await Promise.all([
        import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-app.js`),
        import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-auth.js`),
        import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-firestore.js`)
      ]);
      const app = appModule.getApps().length ? appModule.getApp() : appModule.initializeApp(FIREBASE_CONFIG);
      auth = authModule.getAuth(app);
      await authModule.setPersistence(auth, authModule.browserLocalPersistence);
      const credential = auth.currentUser ? { user:auth.currentUser } : await authModule.signInAnonymously(auth);
      user = credential.user;
      db = firestoreModule.getFirestore(app);
      api = firestoreModule;
      const scores = await fetchTop();
      status("synced");
      return { online:true, playerId:user.uid, scores };
    } catch (error) {
      status("offline", error?.code || "connection-failed");
      return { online:false, reason:error?.code || "connection-failed", playerId:null, scores:[] };
    }
  }

  async function fetchTop() {
    if (!api || !db || !user) throw new Error("leaderboard-offline");
    const ranking = api.query(
      api.collection(db, COLLECTION),
      api.orderBy("score", "desc"),
      api.orderBy("cores", "desc"),
      api.orderBy("createdAt", "asc"),
      api.limit(3)
    );
    const snapshot = await api.getDocs(ranking);
    return normalizeSnapshot(snapshot);
  }

  async function submitScore(entry) {
    if (!api || !db || !user) throw new Error("leaderboard-offline");
    if (!isValidLeaderboardEntry(entry)) throw new TypeError("invalid-score-entry");
    submissionGuard.claim(entry);

    const reference = api.doc(db, COLLECTION, user.uid);
    let updated = false;
    try {
      await api.runTransaction(db, async transaction => {
        const existing = await transaction.get(reference);
        const previous = existing.exists() ? existing.data() : null;
        const improvesBest = shouldReplacePersonalBest(previous, entry);
        if (!improvesBest) return;
        transaction.set(reference, {
          playerId:user.uid,
          emoji:entry.emoji,
          score:entry.score,
          cores:entry.cores,
          createdAt:api.serverTimestamp(),
          gameVersion:entry.gameVersion,
          runDuration:entry.runDuration,
          maxLength:entry.maxLength
        });
        updated = true;
      });
      const scores = await fetchTop();
      status("synced");
      return { updated, scores, playerId:user.uid };
    } catch (error) {
      submissionGuard.reset();
      throw error;
    }
  }

  return {
    configured:FIREBASE_CONFIGURED,
    init,
    fetchTop,
    submitScore,
    getPlayerId:() => user?.uid || null
  };
}
