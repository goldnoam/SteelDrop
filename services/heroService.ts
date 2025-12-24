
import { HeroCard } from "../types";

const HERO_DATABASE: Omit<HeroCard, 'id' | 'imageUrl'>[] = [
  {
    name: "סופרמן (Steel Titan)",
    power: "תעופה, חסינות מוחלטת וראיית לייזר",
    rarity: "Mythic",
    description: "השורד האחרון מכוכב רחוק, המגן האולטימטיבי של האנושות."
  },
  {
    name: "באטמן (Dark Sentinel)",
    power: "אומנויות לחימה, גאדג'טים מתקדמים ואינטלקט שיא",
    rarity: "Epic",
    description: "מיליארדר שהפך ללוחם צדק המסתתר בצללים של העיר גדולה."
  },
  {
    name: "ת'ור (Thunder King)",
    power: "שליטה בברקים ופטיש קוסמי",
    rarity: "Legendary",
    description: "נסיך מממלכה שמימית המגן על כדור הארץ בעזרת זעם השמיים."
  },
  {
    name: "וונדר וומן (Star Warrior)",
    power: "כוח על-אנושי ולאסו של אמת",
    rarity: "Epic",
    description: "נסיכה לוחמת שהגיעה מאי מבודד כדי להביא שלום לעולם הגברים."
  },
  {
    name: "פלאש (Volt Runner)",
    power: "תנועה במהירות האור",
    rarity: "Rare",
    description: "מסוגל לחצות יבשות בשניות ולחזור אחורה בזמן."
  },
  {
    name: "אקווהמן (Deep Sovereign)",
    power: "תקשורת עם יצורי ים ושליטה בזרמים",
    rarity: "Rare",
    description: "שליט שבעת הימים המסוגל לזמן את עוצמת האוקיינוס."
  },
  {
    name: "החץ הירוק (Arrow Ghost)",
    power: "דיוק מושלם וחושים מחודדים",
    rarity: "Common",
    description: "צייד מיומן שלעולם לא מחטיא את המטרה שלו."
  },
  {
    name: "הענק הירוק (Gamma Titan)",
    power: "כוח פיזי אינסופי המושפע מזעם",
    rarity: "Epic",
    description: "מדען שהפך למפלצת זעם בלתי ניתנת לעצירה בעקבות תאונת קרינה."
  },
  {
    name: "ספיידרמן (Spider Weaver)",
    power: "טיפוס על קירות וחוש שישי",
    rarity: "Common",
    description: "נער צעיר עם כוחות של עכביש המגן על השכונה שלו."
  },
  {
    name: "דוקטור סטריינג' (Cosmic Mystic)",
    power: "מניפולציה של זמן ומרחב",
    rarity: "Legendary",
    description: "מגן הממד שלנו מפני איומים קוסמיים בלתי נתפסים."
  }
];

export const getLocalHeroCard = async (): Promise<HeroCard> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const randomIndex = Math.floor(Math.random() * HERO_DATABASE.length);
  const baseHero = HERO_DATABASE[randomIndex];
  const id = Math.random().toString(36).substr(2, 9);
  
  const randomSeed = Math.floor(Math.random() * 5000);
  const imageUrl = `https://picsum.photos/seed/${randomSeed}/400/600`;

  return {
    id,
    ...baseHero,
    imageUrl
  };
};
