import type { GameList } from './types';
import { mostDownloadedMobileAppsHints } from './hints';

// Source: AppMagic / udonis.co (Jan 2026), Wikipedia Google Play list (Aug 2024)
// Values = all-time cumulative downloads (combined iOS + Android estimates)
export const mostDownloadedMobileApps: GameList = {
  id: 'most-downloaded-mobile-apps',
  name: 'Most Downloaded Mobile Apps',
  description: 'Mobile apps ranked by all-time cumulative downloads across iOS & Android (AppMagic, 2026)',
  topics: ['technology', 'culture'],
  hints: mostDownloadedMobileAppsHints,
  valueLabel: 'All-Time Downloads',
  newUntil: '2025-08-01',
  items: [
    // 1–10: 2B–7.4B downloads
    "WhatsApp", "TikTok", "Facebook", "Instagram", "Messenger",
    "Snapchat", "CapCut", "Telegram", "Spotify", "YouTube",
    // 11–20: 1.3B–1.9B downloads
    "SHAREit", "Netflix", "UC Browser", "Zoom", "Amazon Shopping",
    "Pinterest", "X (Twitter)", "WhatsApp Business", "Picsart", "Uber",
    // 21–30: 1.0B–1.3B downloads
    "Truecaller", "Temu", "SHEIN", "imo", "Google Maps",
    "Google Meet", "Google Translate", "Shopee", "Kwai", "Google Play Games",
    // 31–40: 900M–1.0B downloads
    "Google Chrome", "MX Player", "Hotstar", "YouTube Music", "AliExpress",
    "Flipkart", "Amazon Prime Video", "WeChat", "Likee", "Google Photos",
    // 41–50: 800M–900M downloads
    "Duolingo", "InShot", "Gmail", "Google", "ChatGPT",
    "Google Wallet", "B612", "YouTube Kids", "PhonePe", "Discord",
    // 51–60: 700M–800M downloads
    "Wish", "LINE", "Microsoft Teams", "Canva", "Bigo Live",
    "iQIYI", "Outlook", "Adobe Acrobat Reader", "Tinder", "Meesho",
    // 61–70: 600M–700M downloads
    "Microsoft Word", "Waze", "Skype", "Clean Master", "Shazam",
    "Opera Mini", "Viber", "MyJio", "CamScanner", "LinkedIn",
    // 71–80: 500M–600M downloads
    "Booking.com", "PayPal", "Dropbox", "Google Drive", "Google Docs",
    "Google Sheets", "Skype Lite", "QR & Barcode Scanner", "Slither.io", "Pokémon GO",
    // 81–90: ~500M downloads (games)
    "Subway Surfers", "Free Fire", "Roblox", "Candy Crush Saga", "8 Ball Pool",
    "Ludo King", "PUBG Mobile", "My Talking Tom", "Temple Run 2", "Hill Climb Racing",
    // 91–100: ~500M downloads (games & apps)
    "Sniper 3D", "Among Us", "Clash of Clans", "Mobile Legends", "Gardenscapes",
    "Clash Royale", "EA Sports FC Mobile", "Call of Duty: Mobile", "Stumble Guys", "Angry Birds 2",
  ],
  values: [
    // 1–10
    "7.4B+", "6.9B+", "6.8B+", "5.9B+", "5.6B+",
    "3.2B+", "2.5B+", "2.4B+", "2.1B+", "2.0B+",
    // 11–20
    "1.9B+", "1.8B+", "1.7B+", "1.6B+", "1.6B+",
    "1.5B+", "1.5B+", "1.5B+", "1.4B+", "1.3B+",
    // 21–30
    "1.3B+", "1.2B+", "1.2B+", "1.2B+", "1.2B+",
    "1.1B+", "1.1B+", "1.1B+", "1.1B+", "1.0B+",
    // 31–40
    "1.0B+", "1.0B+", "1.0B+", "1.0B+", "900M+",
    "900M+", "900M+", "900M+", "900M+", "900M+",
    // 41–50
    "900M+", "900M+", "900M+", "900M+", "900M+",
    "900M+", "900M+", "800M+", "800M+", "800M+",
    // 51–60
    "800M+", "800M+", "800M+", "800M+", "800M+",
    "800M+", "800M+", "700M+", "700M+", "700M+",
    // 61–70
    "700M+", "700M+", "700M+", "700M+", "700M+",
    "700M+", "700M+", "700M+", "700M+", "700M+",
    // 71–80
    "700M+", "700M+", "600M+", "600M+", "600M+",
    "600M+", "600M+", "600M+", "600M+", "600M+",
    // 81–90
    "600M+", "600M+", "600M+", "600M+", "600M+",
    "600M+", "600M+", "600M+", "600M+", "500M+",
    // 91–100
    "500M+", "500M+", "500M+", "500M+", "500M+",
    "500M+", "500M+", "500M+", "500M+", "500M+",
  ],
};
