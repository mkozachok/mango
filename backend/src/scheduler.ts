import cron from 'node-cron';
import {main as runImportReviews} from '../scripts/importReviews.js'; 

export function initScheduler() {
  console.log('⏰ Task Scheduler initialized...');

  // Вираз '0 3 * * *' означає: запускати щодня о 03:00 ночі
  cron.schedule('0 3 * * *', async () => {
    console.log(`[${new Date().toISOString()}] 🚀 Starting daily reviews scraping...`);
    
    try {
      await runImportReviews();
      console.log(`[${new Date().toISOString()}] ✅ Daily scraping finished successfully.`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ❌ Daily scraping failed:`, error);
    }
  }, {
    // scheduled: true,
    timezone: "Europe/Kyiv"
  });
}