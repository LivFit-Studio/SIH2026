import fs from 'fs';
import path from 'path';

const teamsData = JSON.parse(fs.readFileSync('teams_dataset.json', 'utf8'));

const jsContent = `export const TEAMS_DATA = ${JSON.stringify(teamsData, null, 2)};

export const ADMIN_EMAILS = [
  "bhushanmallick_it@tgpcet.com"
];
`;

fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/teamsDataset.js', jsContent, 'utf8');
console.log('Successfully updated src/data/teamsDataset.js with ONLY bhushanmallick_it@tgpcet.com as admin.');
