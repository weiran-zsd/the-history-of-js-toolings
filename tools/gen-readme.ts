// deno run --allow-read --allow-write --allow-net tools/gen-readme.ts

import dayjs from 'https://cdn.skypack.dev/dayjs';
import { events, packages } from './data.ts'

const startHistoryMarker = '<!-- AUTO -->';
const endHistoryMarker = "<!-- /AUTO -->";

const content = Deno.readTextFileSync("./README.md");
const historyStart = content.indexOf(startHistoryMarker);
const historyEnd = content.indexOf(endHistoryMarker);

for (const pkgName of packages) {
    // used a mirror, as the official website(https://registry.npmjs.org/) is not very fast in cn(gfw)
    const res = await fetch(`https://registry.npm.taobao.org/${pkgName}`);
    const pkg = await res.json();
    pkg?.versions && Object.keys(pkg.versions).forEach((v) => {
        // only the major releases
        if (/^v?\d+\.0\.0$/.test(v)) {
            const e = {
                date: dayjs(pkg.versions[v].publish_time).format( "YYYY-MM-DD"),
                description: `${pkgName} v${v} was released.`,
                "cat": "⚙️",
            };
            console.log(e);
            events.push(e);
        }
      });
}

events.sort((e1: any, e2: any) => e1.date.localeCompare(e2.date));
const history = `
| date            | event                                              | remark          |
| --------------- | -------------------------------------------------- | --------------- |
${events.map((e: any) => `| ${e.date.padEnd(15, ' ')} | ${e.cat + e.description.padEnd(70, ' ')} | ${(e.remark||'n/w').padEnd(20, ' ')} |`).join("\n")}
`;


Deno.writeTextFileSync("./README.md", content.slice(0, historyStart) + startHistoryMarker + history + content.slice(historyEnd));