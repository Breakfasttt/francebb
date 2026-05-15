
const { createClient } = require("@libsql/client");

const client = createClient({
  url: "https://bbfrance-db-breakfasttt.aws-eu-west-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzY3ODEyNjksImlkIjoiMDE5ZGIwNmEtMjMwMS03NTU4LWIxZTctY2MxNDkyNGJjZDEwIiwicmlkIjoiNDA5ZGVkZmUtMzBlZC00MmVlLThhNjQtZmFhMzc3NTA3MzY3In0.BSYUzer0C_1F6XwRFFnGtBFirMeL3q9mB4s8z3JQ9b-i3jiZBXRRLtv6ZZonxWDYkNky0d1dBeakbYaOV6e2BA"
});

async function main() {
  const rs = await client.execute("SELECT name FROM sqlite_master WHERE type='table';");
  console.log("Tables in Prod:", rs.rows.map(r => r.name).join(", "));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
