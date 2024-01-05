import {createHmac} from "crypto";

export default function hashPassword(password: string) {
    const hash = createHmac("sha512", process.env.SALT!);
    hash.update(password);

    return hash.digest("hex");
}
