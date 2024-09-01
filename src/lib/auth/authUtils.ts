import bcrypt from "bcrypt";

export async function makeHash(password: string): Promise<string> {
  try {
    const salt: string = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);

    return hash;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function checkPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
