import { describe, it, expect } from "vitest";
import { firebaseConfig } from "../db.key.js";

const PROJECT_ID = firebaseConfig.projectId;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

describe("Firebase Firestore - bezpieczeństwo i odczyt danych (T-16, T-17, J-11, R-07)", () => {
  it("T-16a: próba utworzenia nieautoryzowanego rekordu (POST) zostaje odrzucona", async () => {
    const res = await fetch(`${BASE_URL}/users?documentId=unauthorized_test_user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          username: { stringValue: "Hacker" },
          highScore: { integerValue: "999999" }
        }
      })
    });

    const data = await res.json();
    expect([401, 403]).toContain(res.status);
    expect(data.error?.status).toBe("PERMISSION_DENIED");
  });

  it("T-16b: próba modyfikacji danych bez autoryzacji (PATCH/UPDATE) zostaje odrzucona", async () => {
    const res = await fetch(
      `${BASE_URL}/users/unauthorized_test_user?updateMask.fieldPaths=highScore`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            highScore: { integerValue: "999999" }
          }
        })
      }
    );

    const data = await res.json();
    expect([401, 403]).toContain(res.status);
    expect(data.error?.status).toBe("PERMISSION_DENIED");
  });

  it("T-17: pobranie rankingu graczy (GET) kończy się statusem 200 OK i mierzy czas odpowiedzi", async () => {
    const start = performance.now();
    const res = await fetch(`${BASE_URL}/users?pageSize=10`);
    const elapsedMs = Math.round(performance.now() - start);

    const data = await res.json();
    console.log(`Czas odpowiedzi Firebase (GET TOP 10): ${elapsedMs} ms`);

    expect(res.status).toBe(200);
    expect(Array.isArray(data.documents) || Object.keys(data).length === 0).toBe(true);
    expect(elapsedMs).toBeLessThan(3000);
  });
});