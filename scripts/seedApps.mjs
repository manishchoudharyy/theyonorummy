import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not set. Run with: node --env-file=.env.local scripts/seedApps.mjs');
}

const toNumber = (value) => Number(String(value).replace(/[^0-9.]/g, ''));

const apps = [
  {
    position: 1,
    name: 'Diwa Win',
    slug: 'diwa-win',
    logo: '/icons/diwa-win.webp',
    categories: ['rummy'],
    bonus: '₹82',
    minWithdraw: toNumber('₹100'),
    appSize: '42MB',
    rating: toNumber('4.3'),
    downloads: '86K+',
    isNewApp: true,
    isTrending: true,
    isActive: true,
    referLink: 'https://diwawinshare.vip?pid=341450362&channel=2010002&pkg=com.diwawin002.app',
    content: {
      description:
        '<p>Diwa Win is designed for players who want both entertainment and real cash winnings in one place. The platform offers multiple game modes, low entry tables, and high-reward competitions for both beginners and pro users. New users get a welcome bonus of ₹82, along with daily login rewards and deposit offers. Diwa Win uses secure payment systems with SSL encryption and fair gameplay algorithms. Players can withdraw their earnings instantly using UPI, Paytm, or bank transfer. With regular bonuses, login rewards, and cashback offers, users always have earning opportunities.</p>',
      whyChoose: '',
      howToDownload: '',
      additionalInfo: '',
    },
    faq: [],
    seo: {
      metaTitle: 'Diwa Win APK Download - ₹82 Signup Bonus | All Yono Max - Real Cash',
      metaDescription:
        'Download Diwa Win APK and get ₹82 signup bonus. Play skill based games, instant withdrawal, real earning app 2026.',
      keywords: [
        'diwa win apk download',
        'diwa win app download',
        'diwa win real or fake',
        'diwa win earning app',
        'diwa win withdrawal proof',
        'diwa win referral code',
        'diwa win latest version',
        'diwa win bonus',
        'diwa win review',
        'diwa win real money app',
        'diwa win apk 2026',
      ],
    },
    lastUpdated: new Date('2026-07-10T06:57:03.022Z'),
  },
  {
    position: 2,
    name: 'Max Rummy',
    slug: 'max-rummy',
    logo: '/icons/max-rummy.webp',
    categories: ['rummy', 'slots'],
    bonus: '₹91',
    minWithdraw: toNumber('₹100'),
    appSize: '44MB',
    rating: toNumber(4.6),
    downloads: '105k',
    isNewApp: true,
    isTrending: true,
    isActive: true,
    referLink: 'https://www.maxrummy111.com/?code=QUMPRYP2HJ9&t=1783567053',
    content: {
      description:
        "<p>Download Max Rummy Now and get ₹91 signup bonus. Play Rummy, Poker, Andar Bahar, Ludo and many more games in Max Rummy Apk. This is the latest yono games's app that is launched today.</p><p></p><p></p><h3><strong>How to claim bonus?</strong></h3><h3>Max Rummy Apk Install karo and number enter karke send otp par click karo and verify karo. jaise hi aapka account register hoga aapko upto ₹91 ka signup bonus milega jisse aap game play kar sakte ho.</h3><h3></h3><p></p><h3><strong>Why Choose Max Rummy?</strong></h3><h3>Max Rummy ekdam new app hai jo yono games ne aaj hi launch kiya hai. kyunki ye new app hai to aapko high signup bonus, best gameplay and app ke andar new features milte hai.</h3><h3>Maxrummy me weekly leaderboard bhi hai high referral commision bhi hai aur to aur inke official telegeram channel par ye giftcodes bhi dete hai jinko aap easily claim kar sakte hai.</h3><h3>Max Rummy bilkul hi free withdrawals deta hai aapke bank ke andar instant and safe & secure payment deta hai. minimum withdraw ki baat kare to sirf ₹100 hai.</h3>",
      whyChoose: '',
      howToDownload: '',
      additionalInfo: '',
    },
    faq: [
      {
        question: 'Is Max Rummy a new Yono app?',
        answer:
          'Yes — Max Rummy is a new Yono Games network app with its own ₹91 signup bonus and separate wallet. It runs on the same backend as Diwa 777, Goa Spin, and 60+ other apps in this directory, with the same ₹100 minimum withdrawal and UPI payout system.',
      },
      {
        question: 'How do I download Max Rummy APK?',
        answer:
          "Tap the official Max Rummy download button on this page — it links directly to the app server. Enable 'Install Unknown Apps' for your browser in phone settings, open the downloaded file, and tap Install.",
      },
      {
        question: 'What games are inside Max Rummy?',
        answer:
          '13-card Rummy, Ludo, Poker, Wingo Lottery, Jhandi Munda, Baccarat, Crash, Aviator, Andar Bahar, Dragon & Tiger, Roulette — 25+ games total under one wallet, more than most standard Yono apps.',
      },
      {
        question: 'What is the minimum withdrawal in Max Rummy?',
        answer:
          '₹100 minimum, no maximum cap. Withdrawals go through UPI or bank transfer with no fees deducted.',
      },
      {
        question: 'How do I claim the ₹91 Max Rummy bonus?',
        answer:
          'Download the Maxrummy APK from this page, register with your mobile number, verify the OTP. ₹91 is credited to your wallet automatically — no deposit required.',
      },
      {
        question: 'Is Max Rummy real or fake?',
        answer:
          "Max Rummy is a real app on the Yono Games network. Withdrawals process through standard UPI — wins and losses are both real as it's a real-money gaming app. Always download from the official Max Rummy APK link on this page, not a forwarded file.",
      },
    ],
    seo: {
      metaTitle: 'Max Rummy Download — ₹91 Bonus | New Max Rummy Yono Game 2026',
      metaDescription:
        'Download Max Rummy APK and get ₹91 bonus. Maxrummy — new Yono app with Rummy, Ludo, Poker & 25+ games. Official Max Rummy download, ₹100 min withdrawal.',
      keywords: [
        'max rummy',
        'maxrummy',
        'max rummy apk',
        'max rummy download',
        'max rummy app',
        'new yono app',
        'max rummy game',
        'maxrummy apk',
        'max rummy login',
      ],
    },
    lastUpdated: new Date('2026-07-09T04:42:58.700Z'),
  },
  {
    position: 3,
    name: 'Diwa Game',
    slug: 'diwa-game',
    logo: '/icons/diwa-game.webp',
    categories: ['vip', 'slots', 'diwa'],
    bonus: '₹649',
    minWithdraw: toNumber('₹100'),
    appSize: '43MB',
    rating: toNumber('4.5'),
    downloads: '100K+',
    isNewApp: true,
    isTrending: true,
    isActive: true,
    referLink: 'https://diwagameshare.bet?pid=431138641&channel=2010003&pkg=com.diwagamedlx.app',
    content: {
      description:
        '<p>Diwa Game & DiwaGame yah ek New Application He Esame Apako ₹140~₹370 aap to bonus mil sakta hai kyunki yah new platform hai Diwa game main aapko Free Me jo Bouns Milega usase Gameplay karake All Amount App Withdrawal le sakate he bilkul free Diwa game Trusted & genuine application He Diwa Game Bahut Sare Log Play karake roj ka pocket money Earn kar rahe he Log Diwa Game & DiwaGame Diwa Game Apk & Diwa Game Download yesa search karte hain to aap Diwa Game me jitna Sign-up bonus milta he usase acha khasa  Amount bana Lo fir App apane Bank account me successfully transfer karalo bilkul free & secure Diwa game ke sath life time Earning ki guarantee diwa game He To Earning ki guarantee hai kew ki diwa game me 1M + trusted users play karte Hain ismein aapko koi bot player nahin milega Diwa Game All users ka Trust he 24 hours Withdrawal Deposit support he ismein aapka ₹1 bhi kabhi fansega nahin ismein aapko deposit karneka me Salah nahin de raha ismein aap aap free jo Bouns Milega usase Gameplay karo or all amount withdrawal karo safely & secure withdrawal Upi / Bank account Abhi Diwa Game Download karo or Game Khelo bilkul free Diwa Game ke other Apps bhi he like</p><p>Diwa 777 & Diwa Slot & Diwa Vip Good Slots & MQM Bet so Esako bhi App Download karo or free Bouns se gameplay karo or sare peise Withdrawal karo bilkul free All Apps ki Link Website me mil jaayega so App Free Earning karo sefe and secure Diwa Game & Diwa 777 Diwa Vip Diwa Slot Good slots MQM Bet & MWM BET ke sath always Free Earning karo Withdrawal karo !</p>',
      whyChoose: '',
      howToDownload: '',
      additionalInfo: '',
    },
    faq: [
      {
        question: 'What is Diwa Game?',
        answer:
          'Diwa Game is a real-money gaming app on the Yono network, launched in June 2026. It runs Rummy, Slots, 777, and Spin & Win, with a current signup bonus of ₹649 credited on registration.',
      },
      {
        question: 'How do I download the Diwa Game APK?',
        answer:
          "Use the official download link on this page — it goes directly to the app's own server. Enable 'Install Unknown Apps' for your browser, install the file, and open it to register.",
      },
      {
        question: 'Is Diwa Game real or fake?',
        answer:
          "Diwa Game runs on the Yono Games network, the same backend behind Diwa VIP, Diwa 777, and dozens of other apps. Withdrawals process through standard UPI infrastructure. As a real-money gambling app, both wins and losses are real — it isn't a scam in the sense of stealing deposits, but the odds favor the platform over time, same as any casino-style game.",
      },
      {
        question: 'How does the ₹649 bonus work in Diwa Game?',
        answer:
          "It's added to your wallet automatically on registration through the link on this page — no code, no deposit. Part of it is usable immediately on game tables; the rest becomes withdrawable after a short wagering requirement, typically 2-3 rounds played.",
      },
      {
        question: 'What is the minimum withdrawal in Diwa Game?',
        answer:
          '₹100, with no maximum limit. No fees are deducted — UPI transfers typically clear in 5 to 30 minutes.',
      },
      {
        question: 'What games are available in Diwa Game?',
        answer:
          'Four main games: Rummy, 777, Slots, and Spin & Win, all accessible from the same wallet balance.',
      },
      {
        question: 'How does the Diwa Game referral program work?',
        answer:
          'Your referral link is in the Invite section of the app. Commission per successful referral currently ranges ₹50 to ₹500 and is credited to your wallet the moment the friend registers.',
      },
      {
        question: 'Is Diwa Game the same as Diwa VIP or Diwa 777?',
        answer:
          "Same network, same general layout style, but separate apps with their own wallets and bonuses. Diwa Game's current ₹649 bonus is higher than Diwa VIP's ₹139, since Diwa Game launched more recently.",
      },
      {
        question: 'Is Diwa Game available on iOS?',
        answer: 'No — Android only, distributed as an APK file outside the Play Store.',
      },
    ],
    seo: {
      metaTitle: 'Diwa Game APK Download — ₹649 Bonus | Yono Game',
      metaDescription:
        'Diwa Game APK download: ₹649 signup bonus, ₹100 min withdrawal, 5-30 min payout. Diwagame app — Rummy, Slots, 777, Spin & Win. New Diwa Game Yono app 2026.',
      keywords: [
        'diwa game',
        'diwa game apk',
        'diwagame',
        'diwa game download',
        'diwa game app',
        'diwa game apk download',
        'diwa game yono',
        'diwa game bonus',
        'diwa game real or fake',
        'diwa game withdrawal',
      ],
    },
    lastUpdated: new Date('2026-07-08T13:09:28.909Z'),
  },
  {
    position: 4,
    name: 'Jaiho 91',
    slug: 'jaiho-91',
    logo: '/icons/jaiho-91.webp',
    categories: ['jaiho'],
    bonus: '₹101',
    minWithdraw: toNumber('₹100'),
    appSize: '52MB',
    rating: toNumber(4.6),
    downloads: '310K+',
    isNewApp: true,
    isTrending: true,
    isActive: true,
    referLink: 'https://jaiho91.cc/?code=C427K68RQZ7&t=1781192594',
    content: {
      description:
        '<p><strong>Jaiho 91</strong> में<strong> ₹9100 Sign-Up Bonus</strong> पाएं! <strong>Jaiho 91 APK Download, Jaiho 91 Login, Jaiho 91 Register</strong> के साथ आसानी से शुरू करें। Aviator, Slots, Lottery, Color Prediction, Dragon Tiger, Roulette, Teen Patti & Rummy खेलें। Fast Deposit, Quick Withdrawal और Daily Login Rewards का आनंद लें। साथ ही <strong>Jaiho 777, Jaiho Slots, Jaiho Rummy, MQM Bet, Love Rummy & Yono Rummy </strong>भी एक्सप्लोर करें !</p>',
      whyChoose: '',
      howToDownload: '',
      additionalInfo: '',
    },
    faq: [
      {
        question: 'What is Jaiho 91?',
        answer:
          'Jaiho 91 is a real money gaming app where Indian users can play earning games, claim signup rewards, and withdraw winnings through supported payment methods.',
      },
      {
        question: 'How to download Jaiho 91 APK?',
        answer:
          'Click the Jaiho 91 download button, open the official link, download the APK file, enable unknown sources, and install it on your Android device.',
      },
      {
        question: 'What is the signup bonus in Jaiho 91?',
        answer:
          'New users can get a ₹101 signup bonus after registering on Jaiho 91. Bonus terms may change, so always check the latest offer inside the app.',
      },
      {
        question: 'What is the minimum withdrawal in Jaiho 91?',
        answer:
          'The minimum withdrawal amount for Jaiho 91 is ₹100. Users can withdraw eligible winnings through the available payment options.',
      },
      {
        question: 'Is Jaiho 91 safe to use?',
        answer:
          'Jaiho 91 provides app-based account access and payment features for real money gaming. Users should download it only from the official link and play responsibly.',
      },
      {
        question: 'Can I earn money from Jaiho 91?',
        answer:
          'Yes, users can earn by playing eligible games, using bonuses, winning matches, and inviting friends through the referral program where available.',
      },
    ],
    seo: {
      metaTitle: 'Jaiho 91 APK Download - ₹101 Signup Bonus | Real Cash App',
      metaDescription:
        'Download Jaiho 91 APK and get ₹101 signup bonus. Play real cash games, minimum ₹100 withdrawal, fast UPI payouts and referral rewards.',
      keywords: [
        'jaiho 91 apk download',
        'jaiho 91 app download',
        'jaiho 91 bonus',
        'jaiho 91 signup bonus',
        'jaiho 91 real or fake',
        'jaiho 91 withdrawal proof',
        'jaiho 91 earning app',
        'jaiho 91 referral code',
        'jaiho 91 latest version',
        'jaiho91 apk download',
        'jaiho 91 real money app',
      ],
    },
    lastUpdated: new Date('2026-07-06T10:25:26.203Z'),
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ MongoDB Connected:', mongoose.connection.host);

  const operations = apps.map((app) => ({
    updateOne: {
      filter: { slug: app.slug },
      update: { $set: app },
      upsert: true,
    },
  }));

  const result = await mongoose.connection.db.collection('apps').bulkWrite(operations);
  console.log(`Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}, Matched: ${result.matchedCount}`);

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
