const { createUser, findUserByEmail, verifyAndMigratePassword } = require("./lib/queries/users.js");
const { loginAction } = require("./app/actions/auth.js");

async function main() {
  const email = "test@example.com" + Date.now();
  const password = "mysecretpassword123";
  
  console.log("Creating user...");
  const createResult = await createUser({
    name: "Test User",
    email,
    phone: "1234567890",
    password
  });
  console.log("Create result:", createResult);

  console.log("Attempting login...");
  const loginResult = await loginAction(email, password);
  console.log("Login result:", loginResult);
  
  process.exit(0);
}
main().catch(console.error);
