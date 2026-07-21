import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-[#8d836b] font-technor text-6xl mb-4">404</h1>
        <p className="text-[#8d836b]/60 mb-8 font-technor text-lg">Page not found</p>
        <Link href="/" className="server-ip-btn inline-flex">
          <div className="server-ip-btn__tile">
            <div className="server-ip-btn__shadow" />
            <div className="server-ip-btn__ip">
              <span className="server-ip-btn__title">Back to Home</span>
            </div>
          </div>
          <div className="server-ip-btn__hover-tile" />
        </Link>
      </div>
    </section>
  )
}
