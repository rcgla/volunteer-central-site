import fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { format } from 'graphql-formatter'
 
import * as Q from '../src/queries/index.js';

for (var queryCategory in Q) {

    let txt = queryCategory + `\n----------\n`;
    
    for (var query in Q[queryCategory]) {
        if (query.includes('GET')) {
            let queryFunc = Q[queryCategory][query];
            let queryText = queryFunc();
            txt += `${query}:\n${format(queryText)}\n\n`;
        }
    }
    txt += "\n\n";
    fs.writeFileSync(path.join(__dirname, `query-docs/${queryCategory}.txt`), txt);
}

