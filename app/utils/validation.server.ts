import { isString } from "./guards";

export function validateUsername(username: unknown) {
  if (!isString(username) || username.length < 3) {
    return "muss mindestens 3 Zeichen lang sein";
  }
}

export function validatePassword(password: unknown) {
  if (!isString(password) || password.length < 5) {
    return "muss mindestens 5 Zeichen lang sein";
  }
}
