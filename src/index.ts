import 'dotenv/config';
import { CronJob } from 'cron';
import { backup } from './backup';

const isRunOnceEnabled = () => {
  return process.env.RUN_ONCE === '1';
};

const isRunOnStartupEnabled = () => {
  return process.env.RUN_ON_STARTUP === '1';
};

if (isRunOnceEnabled()) {
  console.log('Running backup once as RUN_ONCE is enabled.');
  backup()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error while creating backup: ', error);
      process.exit(1);
    });
} else {
  if (!process.env.BACKUP_CRON_SCHEDULE) {
    throw new Error('Backup cron schedule is not defined.');
  }

  const job = new CronJob(process.env.BACKUP_CRON_SCHEDULE, async () => {
    try {
      await backup();
    } catch (error) {
      console.error('Error while creating backup: ', error);
    }
  });

  job.start();

  console.log(
    `Backup cron scheduler started: ${process.env.BACKUP_CRON_SCHEDULE}`
  );

  if (isRunOnStartupEnabled()) {
    console.log(
      `Running backup on startup as RUN_ON_STARTUP is enabled: ${process.env.RUN_ON_STARTUP}`
    );
    backup();
  }
}
