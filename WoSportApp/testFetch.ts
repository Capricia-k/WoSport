// testFetch.ts ou dans un useEffect d'un screen
import { useEffect } from "react";

export default function TestFetch() {
  useEffect(() => {
    const testLogin = async () => {
      try {
        const response = await fetch("http://192.168.1.164:3000/users/sign_in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: { email: "test@example.com", password: "123456" } }),
        });
        console.log(await response.json());
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    };

    testLogin();
  }, []);

  return null;
}
