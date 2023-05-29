import Randomstring from "randomstring";

export function generateRandonNumberOfLengthN(n) {
  return Randomstring.generate({
    length: 8,
  });
}
