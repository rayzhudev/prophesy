// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  bold: "\x1b[1m",
};

const TEST_ORIGINS = [
  "http://localhost:3001", // Your frontend dev
  "https://prophesy.fun", // Your prod frontend
  null, // No origin (should be rejected)
  "https://malicious-site.com", // Should be rejected
];

const TEST_ENDPOINTS = [
  {
    url: "/trpc/getTweets",
    method: "GET",
  },
  {
    url: "/trpc/createTweet",
    method: "POST",
    body: { content: "Test tweet" },
  },
];

function printResult(test: string, passed: boolean, details?: string) {
  const mark = passed ? `${colors.green}✓` : `${colors.red}✗`;
  console.log(`${mark} ${test}${colors.reset}`);
  if (details) {
    console.log(`  ${colors.blue}${details}${colors.reset}`);
  }
}

async function testCORS() {
  const baseUrl = "http://localhost:3000"; // Your backend URL
  let totalTests = 0;
  let passedTests = 0;

  for (const origin of TEST_ORIGINS) {
    console.log(
      `\n${colors.bold}Testing with origin: ${origin || "same-origin request"}${colors.reset}`
    );
    console.log("=".repeat(50));

    const isAllowedOrigin =
      origin === "http://localhost:3001" || origin === "https://prophesy.fun";

    for (const endpoint of TEST_ENDPOINTS) {
      console.log(
        `\n${colors.yellow}Testing ${endpoint.method} ${endpoint.url}${colors.reset}`
      );
      console.log("-".repeat(30));

      // First test preflight
      if (endpoint.method !== "GET") {
        totalTests++;
        try {
          const preflightResponse = await fetch(`${baseUrl}${endpoint.url}`, {
            method: "OPTIONS",
            headers: {
              Origin: origin || "",
              "Access-Control-Request-Method": endpoint.method,
              "Access-Control-Request-Headers": "content-type,x-trpc,x-api-key",
            },
          });
          
          const preflightPassed = isAllowedOrigin
            ? preflightResponse.status !== 500 &&
              preflightResponse.headers.get("access-control-allow-origin") !== null
            : preflightResponse.status === 403;

          if (preflightPassed) passedTests++;

          printResult(
            "Preflight Request",
            preflightPassed,
            `Status: ${preflightResponse.status}, Origin: ${
              preflightResponse.headers.get("access-control-allow-origin") ||
              "null"
            }`
          );
        } catch (error: any) {
          printResult("Preflight Request", false, `Error: ${error.message}`);
        }
      }

      // Then test actual request
      totalTests++;
      try {
        const headers: Record<string, string> = {
          Origin: origin || "",
          "Content-Type": "application/json",
          "X-TRPC": "1",
        };

        const response = await fetch(`${baseUrl}${endpoint.url}`, {
          method: endpoint.method,
          headers,
          body: endpoint.body ? JSON.stringify(endpoint.body) : undefined,
        });

        const requestPassed =
          (isAllowedOrigin
            ? response.status === 200
            : response.status === 403) &&
          (isAllowedOrigin
            ? response.headers.get("access-control-allow-origin") !== null
            : true);

        if (requestPassed) passedTests++;

        printResult(
          `${endpoint.method} Request`,
          requestPassed,
          `Status: ${response.status}, Origin: ${
            response.headers.get("access-control-allow-origin") || "null"
          }`
        );

        if (response.ok) {
          const data = await response.text();
          console.log(
            `  ${colors.blue}Response: ${data.substring(0, 50)}...${colors.reset}`
          );
        }
      } catch (error: any) {
        printResult(
          `${endpoint.method} Request`,
          false,
          `Error: ${error.message}`
        );
      }
    }
  }

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log(`${colors.bold}Test Summary${colors.reset}`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${colors.green}${passedTests}${colors.reset}`);
  console.log(
    `Failed: ${colors.red}${totalTests - passedTests}${colors.reset}`
  );
  const percentage = Math.round((passedTests / totalTests) * 100);
  console.log(
    `Success Rate: ${
      percentage >= 80 ? colors.green : colors.red
    }${percentage}%${colors.reset}`
  );
}

testCORS().catch(console.error);
