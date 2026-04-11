import fs from 'node:fs';

const baselinePath = process.argv[2];
const auditPath = process.argv[3];

if (!baselinePath || !auditPath) {
  console.error('Usage: node scripts/ci/check-audit-baseline.mjs <baseline.json> <audit.json>');
  process.exit(2);
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));

const known = new Set((baseline.high_or_critical_packages ?? []).map(String));
const vulnerabilities = audit.vulnerabilities ?? {};

const currentHighOrCritical = Object.entries(vulnerabilities)
  .filter(([, details]) => details?.severity === 'high' || details?.severity === 'critical')
  .map(([name]) => name)
  .sort();

const newPackages = currentHighOrCritical.filter((pkg) => !known.has(pkg));

console.log(`Known baseline packages: ${[...known].sort().join(', ') || '(none)'}`);
console.log(`Current high/critical packages: ${currentHighOrCritical.join(', ') || '(none)'}`);

if (newPackages.length > 0) {
  console.error(`New high/critical vulnerabilities detected in packages: ${newPackages.join(', ')}`);
  process.exit(1);
}

console.log('Audit baseline gate passed: no new high/critical package regressions.');
