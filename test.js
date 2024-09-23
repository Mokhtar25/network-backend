import cookie from "cookie";
import cookieParser from "cookie-parser";

const coo =
  "connect.sid=s%3A3UShw_dADOfibRxceItRr9Uwlyl8w7LH.zeD6XKONvtU2CRD9EWYeZVg5S8iWx8dtdls%2BhK1E%2Fyc";

const parsed = cookie.parse(coo);

console.log(parsed);
console.log(Object.keys(parsed));

console.log(parsed.sid); // undefined
const sid = parsed["connect.sid"];
console.log(sid);

console.log(cookieParser.signedCookie(sid, "secret"));
