'use client'

export function SocialBtn({ iconPath, url, callback }: { iconPath: string; url: string; callback?: () => void }) {
  return (
    <a className="social-btn" href={url} target="_blank" onClick={callback}>
      <div className="social-btn__tile">
        <div className="social-btn__inner-tile" />
        <div className="social-btn__icon" style={{ backgroundImage: `url(${iconPath})` }} />
      </div>
    </a>
  )
}

export function Socials({ classes, btnCallback }: { classes?: string; btnCallback?: () => void }) {
  return (
    <ul className={`socials ${classes || ''}`}>
      <li><SocialBtn url="https://discord.gg/CfcScmbjCZ" iconPath="/icons/social/Discord.svg" callback={btnCallback} /></li>
      <li><SocialBtn url="https://www.tiktok.com/@pvptiers" iconPath="/icons/social/TikTok.svg" callback={btnCallback} /></li>
      <li><SocialBtn url="https://www.youtube.com/@ITS_YUG_XD" iconPath="/icons/social/Youtube.svg" callback={btnCallback} /></li>
      <li><SocialBtn url="https://www.instagram.com/pvptiers" iconPath="/icons/social/Instagram.svg" callback={btnCallback} /></li>
      <li><SocialBtn url="https://x.com/pvptiers" iconPath="/icons/social/X.svg" callback={btnCallback} /></li>
    </ul>
  )
}
