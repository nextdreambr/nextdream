import { MailService } from '../modules/mail/mail.service';

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

  console.log(`Mail smoke test sent to ${to}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : 'unknown error';
  console.error(`Mail smoke test failed: ${message}`);
  process.exit(1);
});
