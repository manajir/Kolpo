# security_spec.md — কল্প (Kolpo) security specification

This specification details the security invariants, malicious payload testing ("Dirty Dozen"), and the validation patterns required to secure the কল্প (Kolpo) health tracking platform.

---

## 1. Data Invariants

1. **User Ownership Isolation**: No user may read, create, update, or delete another user's profile (`/users/{uid}`), tracking logs (`/users/{uid}/tracking/*`), uploaded files (`/users/{uid}/files/*`), or clinical reports (`/users/{uid}/clinic_reports/*`). This guarantees Zero-Trust privacy for sensitive health and PII data.
2. **Strict Identity Integrity**: In the `/forum/{postId}` collection, the `authorId` property in the document must match the authenticated user's `request.auth.uid`. Nobody can post on behalf of another user.
3. **Temporal Integrity**: All client-submitted entries that update or create timestamps (`createdAt`, `updatedAt`, `uploadedAt`) must match `request.time` exactly.
4. **Immutable Fields**:
   - `uid` and `email` on `UserProfile` cannot be changed after creation.
   - `authorId` on `ForumPost` cannot be changed after creation.
   - `createdAt` and `userId` on `ClinicReport` cannot be changed.
5. **No Blind Global Reads on Forum**: Forum posts lists are public, but must be checked for query limits and fields.
6. **No Client-Assigned Subscriptions**: A user can never self-assign `subActive: true` on creation. They also cannot bypass verification checks on update.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following 12 payloads represent malicious or invalid operations designed to test and break our access control and validation constraints.

### Payload 1: Profile Key Spoofing
- **Target**: `match /users/{uid}` (Create/Update)
- **Attack Vector**: User attempts to create a user profile with `uid` in the document set to a different user's sub-claim, or change someone else's profile.
- **Payload**:
  ```json
  {
    "uid": "attacker_uid_123",
    "email": "victim@example.com",
    "displayName": "Victim",
    "currentStage": "menstruating"
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (UID mismatch, unauthorized target).

### Payload 2: Self-Upgrading Premium Subscription on Profile Registration
- **Target**: `match /users/{uid}` (Create / Update)
- **Attack Vector**: An unauthorized user attempts to register their profile with `subActive: true` to bypass payment walls.
- **Payload**:
  ```json
  {
    "uid": "user_123",
    "email": "user@example.com",
    "displayName": "User",
    "currentStage": "menstruating",
    "subActive": true
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (Non-admins cannot elevate their own tier during normal creation).

### Payload 3: Spoofing Tracking Logs for Another User
- **Target**: `match /users/{uid}/tracking/{logDate}` (Create)
- **Attack Vector**: Attacker attempts to write health logs under a victim's user ID.
- **Payload**:
  ```json
  {
    "logDate": "2026-05-29",
    "periodBleeding": "heavy",
    "symptoms": ["তলপেটে ব্যথা"]
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (Wrong path ownership matches).

### Payload 4: Injecting a Gigantic String Into Tracking Notes (Denial-of-Wallet)
- **Target**: `match /users/{uid}/tracking/{logDate}` (Create/Update)
- **Attack Vector**: User sends a 10MB string inside the `notes` field to deplete owner storage or create high billing reads.
- **Payload**:
  ```json
  {
    "logDate": "2026-05-29",
    "periodBleeding": "none",
    "notes": "[A very long string of 1,000,000 characters...]"
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (Fails string .size() check of <= 5000).

### Payload 5: Fraudulent Forum Post (Author Identity Theft)
- **Target**: `match /forum/{postId}` (Create)
- **Attack Vector**: User A attempts to create a post showing User B's UID as the author.
- **Payload**:
  ```json
  {
    "postId": "post_789",
    "authorId": "user_B_victim",
    "authorName": "Victim User",
    "title": "Malicious Post",
    "content": "I am being impersonated."
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (authorId must match request.auth.uid).

### Payload 6: Forum Post Invisible Field Hijack (Likes Overwrite)
- **Target**: `match /forum/{postId}` (Update)
- **Attack Vector**: User attempts to update a forum post and rewrite the entire `likes` array or inject custom names, replacing the list of users who actually liked it.
- **Payload**:
  ```json
  {
    "postId": "post_1",
    "likes": ["attacker_uid"],
    "content": "Updated content by non-author!"
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (Only allowed actions are Join, author edits, or likes tracking using affectedKeys() rules).

### Payload 7: Accessing Private Clinical Reports of Others
- **Target**: `match /users/{uid}/clinic_reports/{reportId}` (Read/Get)
- **Attack Vector**: Remote user attempts to look up or fetch a clinic report belonging to another user.
- **Expectation**: `PERMISSION_DENIED` (Requires uid == request.auth.uid).

### Payload 8: Path Variable Poisoning in Files
- **Target**: `match /users/{uid}/files/{fileId}` (Create)
- **Attack Vector**: Attacker sets `fileId` to a dangerous string like `../dangerous-path` or a 1.5KB long string.
- **Payload**:
  ```json
  {
    "fileId": "VERY_LONG_STRING_OF_OVER_1000_CHARACTERS_...",
    "fileName": "test.pdf",
    "fileUrl": "https://example.com/test.pdf"
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (Fails `isValidId` and `.size()` constraints).

### Payload 9: Forged Clinical Access Code Setup
- **Target**: `match /users/{uid}/clinic_reports/{reportId}` (Create)
- **Attack Vector**: User attempts to assign an invalid, unsafe clinician access code (e.g., non-alphanumeric or too large).
- **Payload**:
  ```json
  {
    "reportId": "report_1",
    "userId": "user_123",
    "clinicianAccessCode": "HACKED_BYPASSED_CODE_LONG_AND_INVALID"
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (Clinician access code must match strict pattern/size check).

### Payload 10: Client-Forged Timestamp Injection
- **Target**: `match /users/{uid}/files/{fileId}` (Create)
- **Attack Vector**: Malicious client submits an arbitrary past or future timestamp for `uploadedAt`.
- **Payload**:
  ```json
  {
    "fileId": "file_123",
    "fileName": "xray.jpg",
    "fileUrl": "https://example.com/xray.jpg",
    "uploadedAt": "1999-01-01T00:00:00Z"
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (Must use `request.time` for time fields on writes).

### Payload 11: Non-Verified Email User Trying to Post in Forum
- **Target**: `match /forum/{postId}` (Create)
- **Attack Vector**: User with an unverified email address attempts to broadcast public posts.
- **Expectation**: `PERMISSION_DENIED` (Requires `email_verified == true`).

### Payload 12: Changing Immutable Profile Fields
- **Target**: `match /users/{uid}` (Update)
- **Attack Vector**: User attempts to change their own profile `email` or `uid`.
- **Payload**:
  ```json
  {
    "uid": "new_uid",
    "email": "new_email@example.com"
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (Cannot change immutable fields during updates).

---

## 3. Test Runner Outline (firestore.rules.test.ts)

Below is the complete testing suite outline for verifying the safety and compliance of the rule definition:

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import * as fs from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'buoyant-keyword-hv7sv',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('কল্প (Kolpo) Zero-Trust rules tests', () => {
  test('Payload 1 Failure — Profile Key Spoofing details', async () => {
    const context = testEnv.authenticatedContext('attacker_uid');
    const db = context.firestore();
    await assertFails(
      db.doc('users/victim_uid').set({
        uid: 'victim_uid',
        email: 'victim@example.com',
        displayName: 'Victim'
      })
    );
  });

  test('Payload 2 Failure — Premium Account Elevation check', async () => {
    const context = testEnv.authenticatedContext('user_123', { email_verified: true });
    const db = context.firestore();
    await assertFails(
      db.doc('users/user_123').set({
        uid: 'user_123',
        email: 'user@example.com',
        subActive: true
      })
    );
  });

  test('Payload 3 Failure — Tracking Log Spoofing on others', async () => {
    const context = testEnv.authenticatedContext('attacker_uid');
    const db = context.firestore();
    await assertFails(
      db.doc('users/victim_uid/tracking/2026-05-29').set({
        logDate: '2026-05-29',
        periodBleeding: 'heavy'
      })
    );
  });

  test('Payload 4 Failure — Storage exhaustion in notes', async () => {
    const context = testEnv.authenticatedContext('user_123', { email_verified: true });
    const db = context.firestore();
    await assertFails(
      db.doc('users/user_123/tracking/2026-05-29').set({
        logDate: '2026-05-29',
        notes: 'a'.repeat(6000)
      })
    );
  });

  test('Payload 5 Failure — Impersonating Forum Post identity', async () => {
    const context = testEnv.authenticatedContext('user_A', { email_verified: true });
    const db = context.firestore();
    await assertFails(
      db.collection('forum').doc('post_1').set({
        postId: 'post_1',
        authorId: 'user_B_victim',
        authorName: 'Victim',
        title: 'Hi',
        content: 'content'
      })
    );
  });

  test('Payload 11 Failure — Forum posting with unverified email', async () => {
    const context = testEnv.authenticatedContext('user_A', { email_verified: false });
    const db = context.firestore();
    await assertFails(
      db.collection('forum').doc('post_1').set({
        postId: 'post_1',
        authorId: 'user_A',
        authorName: 'Unverified',
        title: 'Title',
        content: 'Content'
      })
    );
  });
});
```
