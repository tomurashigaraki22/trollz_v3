const bcrypt = require("bcryptjs");

async function test() {
  const hash2y = "$2y$10$KpkSpOtbomFnAhiQirEsY.NTUi81dGnNgrYeDWXk6mT3y.l6tWBs6";
  const hash2a = hash2y.replace(/^\$2y\$/, "$2a$");
  
  // We don't know the plain password, but we can test if compare throws or fails silently
  try {
    const res = await bcrypt.compare("wrongpassword", hash2y);
    console.log("compare with 2y returned:", res);
  } catch (e) {
    console.error("compare with 2y threw:", e.message);
  }

  try {
    const res = await bcrypt.compare("wrongpassword", hash2a);
    console.log("compare with 2a returned:", res);
  } catch (e) {
    console.error("compare with 2a threw:", e.message);
  }
}
test();
