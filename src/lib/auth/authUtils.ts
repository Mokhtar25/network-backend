import bcrypt from "bcrypt";

export async function makeHash(password: string): Promise<string> {
  try {
    console.time("start hash");
    const salt: string = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    console.timeEnd("end");

    return hash;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
console.log(makeHash("hiFirst"));
console.log(makeHash("hiFirst"));

export async function checkPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
