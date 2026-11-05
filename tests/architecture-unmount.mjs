import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../components/landing/electronics-flow.tsx", import.meta.url), "utf8");
const body = source.match(/const measure = \(\) => \{([\s\S]*?)\n      const box =/)[1];
let reads = 0;
const check = new Function("disposed", "element", "blocks", "nodes", `${body}\nreturn true;`);
const connected = { isConnected: true, getBoundingClientRect() { reads++; } };
assert.equal(check(true, connected, [{}], { current: [connected] }), undefined);
assert.equal(check(false, { isConnected: false }, [{}], { current: [connected] }), undefined);
assert.equal(check(false, connected, [{}], { current: [null] }), undefined);
assert.equal(check(false, connected, [{}], { current: [connected] }), true);
assert.equal(reads, 0);
assert.match(source, /return \(\) => \{ disposed = true; resize\.disconnect\(\)/);
console.log("Architecture measurement guards: OK");
