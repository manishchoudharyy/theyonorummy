

const categoryContent = {
  slots: {
    label: "Slots",
    metaTitle: "Yono Slots Apps 2026 - Download Verified Slot Games",
    metaDescription:
      "Yono Slots is our list of verified slot-style gaming apps for India. Spin-based games, signup bonus from ₹51 to ₹500, and safe referral links.",
    heroTitle: "Yono Slots Apps",
    heroSubtitle:
      "Slot-style spinning games where every round takes a few seconds. Verified apps only, each one downloaded and checked before it gets added here.",
    sections: [
      {
        heading: "Yono Slots apps me kya milta hai?",
        body: "Slot games ka basic idea simple hai: aap spin button dabate ho, reels ghumte hai, aur symbols match hone par result turant mil jata hai. Yaha list ki gayi Yono Slots apps me alag-alag themes aur paylines wale slot games milte hai, jinme low-stake tables se lekar bade rounds tak options rehte hai. Zyadatar apps me signup karte hi ek welcome bonus milta hai jisse aap bina apna paisa laga ke pehla round try kar sakte ho.",
      },
      {
        heading: "Slots aur rummy me kya farak hai?",
        body: "Rummy me thoda strategy aur card-sequencing ka skill lagta hai, jabki slots purely luck-based, fast-paced games hote hai jaha ek round 5-10 second me khatam ho jata hai. Agar aapko quick rounds pasand hai aur lambi game session nahi khelni to slots better fit hai.",
      },
    ],
  },

  "777": {
    label: "777",
    metaTitle: "Yono 777 Apps 2026 - Lucky Number Slot Games",
    metaDescription:
      "Yono 777 apps list with classic lucky-number slot games. Get signup bonus from ₹51 to ₹500 and download verified 777 gaming apps safely.",
    heroTitle: "Yono 777 Apps",
    heroSubtitle:
      "777 ek classic slot-machine symbol hai jo lucky jackpot round se juda hota hai. Yaha un apps ki list hai jo isी style ke number-matching games offer karte hai.",
    sections: [
      {
        heading: "777 games ka concept kya hai?",
        body: "Purane slot machines me teen \"7\" ka match hona sabse bada win symbol maana jata tha, aur wahi se \"777\" naam popular hua. Aaj ke mobile apps me bhi ye same feel wale number-matching aur lucky-symbol games milte hai, bas digital format me. In apps me rounds fast hote hai aur har spin ka result turant show ho jata hai.",
      },
      {
        heading: "Kya 777 apps me guaranteed jackpot milta hai?",
        body: "Nahi, real-money gaming apps me koi bhi outcome guaranteed nahi hota, chahe wo 777 ho ya koi aur game. Ye purely chance-based games hai, isliye kabhi bhi paisa lagate waqt sirf utna hi risk le jitna afford kar sako.",
      },
    ],
  },

  spin: {
    label: "Spin",
    metaTitle: "Yono Spin Apps 2026 - Spin and Win Games",
    metaDescription:
      "Yono Spin apps offer quick spin-and-win rounds with a signup bonus from ₹51 to ₹500. Browse verified spin-based gaming apps for Android.",
    heroTitle: "Yono Spin Apps",
    heroSubtitle:
      "Ek tap, ek spin, aur turant result. Yaha spin-mechanic wale games offer karne wali apps ki list hai.",
    sections: [
      {
        heading: "Spin games kaise kaam karte hai?",
        body: "Spin-based games me gameplay bahut seedha hota hai: ek wheel ya reel hoti hai, aap spin karte ho, aur jaha wheel ruke usी ke hisaab se result decide hota hai. Isme deep strategy ki zaroorat nahi hoti, isliye naye users ke liye bhi samajhna aasan hai.",
      },
      {
        heading: "Spin apps download karne se pehle kya check kare?",
        body: "Download karne se pehle app ka actual signup bonus, minimum withdrawal amount, aur referral link verified hai ya nahi zaroor check kare. Hum har app ko khud install karke test karte hai isliye is list me sirf wahi apps hai jo humne personally use ki hai.",
      },
    ],
  },

  vip: {
    label: "VIP",
    metaTitle: "Yono VIP Apps 2026 - Premium Gaming Apps List",
    metaDescription:
      "Yono VIP apps list featuring premium-tier gaming apps with signup bonus from ₹51 to ₹500. Compare and download verified VIP apps.",
    heroTitle: "Yono VIP Apps",
    heroSubtitle:
      "Apps jo khud ko VIP ya premium tier ke roop me market karte hai, generally bigger bonus offers aur zyada game variety ke saath.",
    sections: [
      {
        heading: "VIP tag ka matlab kya hota hai?",
        body: "\"VIP\" naam ka matlab ye nahi ki har app me guaranteed better payout ya special treatment milega. Zyadatar cases me ye sirf app ka apna branding hota hai, jisme thoda bada welcome bonus ya extra game modes offer kiye jate hai. Hum sirf branding claims ko sach nahi maante, balki har app khud use karke dekhte hai ki usme kya actually milta hai.",
      },
      {
        heading: "VIP apps use karte waqt kya dhyan rakhe?",
        body: "Kisi bhi app ke \"VIP\" ya \"premium\" claims par bharosa karne se pehle uska actual signup bonus, minimum withdrawal, aur referral link khud verify kare. Real-money gaming me hamesha limited budget set karke hi khele.",
      },
    ],
  },

  diwa: {
    label: "Diwa",
    metaTitle: "Diwa Games - All Diwa Family Apps 2026",
    metaDescription:
      "Diwa Games is our list of apps from the Diwa family. Download verified Diwa apps with signup bonus from ₹51 to ₹500 and safe referral links.",
    heroTitle: "Diwa Games",
    heroSubtitle:
      "Diwa family ke sabhi apps ek hi jagah. In apps ka common brand naam \"Diwa\" hai, isliye humne inhe alag se group kiya hai.",
    sections: [
      {
        heading: "Diwa Games list me kya hai?",
        body: "Ye section un apps ke liye hai jo \"Diwa\" brand ke naam se launch hue hai. Har app ko baaki list ki tarah hi humne khud download karke, use karke, aur verify karke hi yaha add kiya hai. Agar aap Diwa ke naam se koi specific app dhundh rahe hai to sabse pehle yahi list check kare.",
      },
      {
        heading: "Diwa apps safe hai kya?",
        body: "Hum kisi bhi app ki safety ya earnings ki guarantee nahi de sakte, kyunki real-money gaming me hamesha financial risk hota hai. Jo bhi hum bata sakte hai wo ye hai ki har Diwa app is list me aane se pehle khud humare through test kiya gaya hai, taaki download link aur referral code dono verified rahe.",
      },
    ],
  },
};

export function getCategoryContent(categorySlug) {
  return categoryContent[categorySlug.toLowerCase()] || null;
}

// Categories we want live and crawlable even before any app is tagged with
// them, so the page + its content is indexable from day one.
export const FEATURED_CATEGORIES = Object.keys(categoryContent);
