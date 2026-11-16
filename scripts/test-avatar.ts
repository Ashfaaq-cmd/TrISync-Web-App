import { looksLikeJpeg } from "../src/lib/avatar"

let total = 0
let failed = 0

function check(name: string, passed: boolean) {
  total += 1
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}`)
  if (!passed) failed += 1
}

check("a real JPEG start is accepted", looksLikeJpeg(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00])))
check("a PNG is refused", !looksLikeJpeg(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d])))
check("an SVG is refused", !looksLikeJpeg(new TextEncoder().encode("<svg xmlns=")))
check("a text file named .jpg is refused", !looksLikeJpeg(new TextEncoder().encode("hello world")))
check("an empty file is refused", !looksLikeJpeg(new Uint8Array([])))
check("a file that is too short is refused", !looksLikeJpeg(new Uint8Array([0xff, 0xd8])))

console.log(`\n${total - failed} of ${total} checks passed`)
if (failed > 0) process.exitCode = 1