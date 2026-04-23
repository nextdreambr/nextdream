import { MailService } from '../modules/mail/mail.service';

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!local || !domain) {
    return '***';
  }

  return `${local[0]}***@${domain}`;
}

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function main() {
  const to = getRequiredEnv('MAIL_SMOKE_TO');
  const name = process.env.MAIL_SMOKE_NAME?.trim() || undefined;

  const mailService = new MailService();
  await mailService.sendSmokeTestEmail({ to, name });

  console.log(`Mail smoke test sent to ${maskEmail(to)}`);
}

main().catch(() => {
  console.error('Mail smoke test failed');
  process.exit(1);
});
