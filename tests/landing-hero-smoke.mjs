import assert from "node:assert/strict";

const origin = process.env.SASSY_TEST_URL ?? "http://localhost:3000";
const page = await fetch(origin);
assert.equal(page.status, 200, "Beranda harus bisa dibuka tanpa login");
const html = await page.text();
assert.match(html, /Pengukusan lebih/);
assert.match(html, /login-hero\.webp/);
assert.match(html, /href="\/login"/);
assert.doesNotMatch(html, /Sobers|Days Sober|App Store/);
const image = await fetch(`${origin}/images/login-hero.webp`);
assert.equal(image.status, 200, "Foto hero harus tersedia");
console.log("Hero publik, foto, dan akses admin: OK");
