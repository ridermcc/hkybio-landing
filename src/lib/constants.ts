export type SocialPlatform =
  | 'Discord'
  | 'EliteProspects'
  | 'Email'
  | 'Facebook'
  | 'Graet'
  | 'Instagram'
  | 'InStat'
  | 'LinkedIn'
  | 'Phone'
  | 'Skool'
  | 'Snapchat'
  | 'Sportaibility'
  | 'TikTok'
  | 'WhatsApp'
  | 'X'
  | 'YouTube'
  | 'Website';

export interface SocialPlatformMeta {
  id: SocialPlatform;
  label: string;
  iconPath: string | null;
  inputPrompt: string;
  inputPlaceholder: string;
  inputType: 'url' | 'email' | 'tel' | 'text';
  toUrl?: (input: string) => string;
  fromUrl?: (url: string) => string;
}

export const SOCIAL_PLATFORMS: SocialPlatformMeta[] = [
  { id: 'EliteProspects', label: 'EliteProspects', iconPath: '/social-icons-white/eliteprospects.png', inputPrompt: 'Enter EliteProspects URL', inputPlaceholder: 'https://eliteprospects.com/player/...', inputType: 'url' },
  { id: 'InStat', label: 'InStat', iconPath: '/social-icons-white/instat.png', inputPrompt: 'Enter InStat URL', inputPlaceholder: 'https://...', inputType: 'url' },
  { id: 'Graet', label: 'Graet', iconPath: '/social-icons-white/graet.png', inputPrompt: 'Enter Graet URL', inputPlaceholder: 'https://...', inputType: 'url' },
  {
    id: 'Instagram', label: 'Instagram', iconPath: '/social-icons-white/instagram.png',
    inputPrompt: 'Enter Instagram Username', inputPlaceholder: 'Example: @instagramusername', inputType: 'text',
    toUrl: (i) => {
      if (i.includes('instagram.com')) return i;
      return `https://instagram.com/${i.replace(/^@/, '')}`
    },
    fromUrl: (u) => {
      const m = u.match(/instagram\.com\/(?:@)?([^\/?]+)/i);
      return m ? `@${m[1]}` : u;
    }
  },
  {
    id: 'TikTok', label: 'TikTok', iconPath: '/social-icons-white/tiktok.png',
    inputPrompt: 'Enter TikTok Username', inputPlaceholder: 'Example: @tiktokusername', inputType: 'text',
    toUrl: (i) => {
      if (i.includes('tiktok.com')) return i;
      return `https://tiktok.com/@${i.replace(/^@/, '')}`
    },
    fromUrl: (u) => {
      const m = u.match(/tiktok\.com\/@([^\/?]+)/i);
      return m ? `@${m[1]}` : u;
    }
  },
  { id: 'YouTube', label: 'YouTube', iconPath: '/social-icons-white/youtube.png', inputPrompt: 'Enter YouTube URL', inputPlaceholder: 'https://youtube.com/...', inputType: 'url' },
  {
    id: 'X', label: 'X (Twitter)', iconPath: '/social-icons-white/x.png',
    inputPrompt: 'Enter X (Twitter) Username', inputPlaceholder: 'Example: @username', inputType: 'text',
    toUrl: (i) => {
      if (i.includes('x.com') || i.includes('twitter.com')) return i;
      return `https://x.com/${i.replace(/^@/, '')}`
    },
    fromUrl: (u) => {
      const m = u.match(/(?:x|twitter)\.com\/(?:@)?([^\/?]+)/i);
      return m ? `@${m[1]}` : u;
    }
  },
  {
    id: 'Snapchat', label: 'Snapchat', iconPath: '/social-icons-white/snapchat.png',
    inputPrompt: 'Enter Snapchat Username', inputPlaceholder: 'Example: username', inputType: 'text',
    toUrl: (i) => {
      if (i.includes('snapchat.com')) return i;
      return `https://snapchat.com/add/${i.replace(/^@/, '')}`
    },
    fromUrl: (u) => {
      const m = u.match(/snapchat\.com\/add\/([^\/?]+)/i);
      return m ? m[1] : u;
    }
  },
  { id: 'LinkedIn', label: 'LinkedIn', iconPath: '/social-icons-white/linkedin.png', inputPrompt: 'Enter LinkedIn URL', inputPlaceholder: 'https://linkedin.com/in/...', inputType: 'url' },
  { id: 'Facebook', label: 'Facebook', iconPath: '/social-icons-white/facebook.png', inputPrompt: 'Enter Facebook URL', inputPlaceholder: 'https://facebook.com/...', inputType: 'url' },
  { id: 'Discord', label: 'Discord', iconPath: '/social-icons-white/discord.png', inputPrompt: 'Enter Discord Server URL', inputPlaceholder: 'https://discord.gg/...', inputType: 'url' },
  {
    id: 'Email', label: 'Email', iconPath: '/social-icons-white/email.png',
    inputPrompt: 'Enter Email Address', inputPlaceholder: 'Example: your@email.com', inputType: 'email',
    toUrl: (i) => i.startsWith('mailto:') ? i : `mailto:${i}`,
    fromUrl: (u) => u.replace(/^mailto:/i, '')
  },
  // { id: 'Sportaibility', label: 'Sportaibility', iconPath: '/social-icons-white/sportaibility.png', inputPrompt: 'Enter Sportaibility URL', inputPlaceholder: 'https://...', inputType: 'url' },
  { id: 'Phone', label: 'Phone', iconPath: '/social-icons-white/phone.png', inputPrompt: 'Enter Phone Number', inputPlaceholder: '+1 ...', inputType: 'tel', toUrl: i => i.startsWith('tel:') ? i : `tel:${i}`, fromUrl: u => u.replace(/^tel:/i, '') },
  {
    id: 'WhatsApp', label: 'WhatsApp', iconPath: '/social-icons-white/whatsapp.png',
    inputPrompt: 'Enter WhatsApp Number', inputPlaceholder: 'Example: +1234567890', inputType: 'tel',
    toUrl: (i) => i.includes('wa.me') ? i : `https://wa.me/${i.replace(/[^0-9+]/g, '')}`,
    fromUrl: (u) => {
      const m = u.match(/wa\.me\/([^\/?]+)/i);
      return m ? m[1] : u;
    }
  },
  { id: 'Skool', label: 'Skool', iconPath: '/social-icons-white/skool.png', inputPrompt: 'Enter Skool URL', inputPlaceholder: 'https://skool.com/...', inputType: 'url' },
  { id: 'Website', label: 'Personal Website', iconPath: '/social-icons-white/website.png', inputPrompt: 'Enter Website URL', inputPlaceholder: 'https://...', inputType: 'url' },
];

export function getPlatformIcon(platformName: string): string | null {
  // Try to find exact or case-insensitive match
  const platform = SOCIAL_PLATFORMS.find(
    (p) => p.id.toLowerCase() === platformName.toLowerCase() || p.label.toLowerCase() === platformName.toLowerCase()
  );
  return platform?.iconPath || null;
}
