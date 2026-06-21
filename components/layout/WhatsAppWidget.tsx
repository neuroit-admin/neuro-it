'use client'

import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'

export default function WhatsAppWidget() {
  const [whatsappNumber, setWhatsappNumber] = useState(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '447519460614')

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings?.whatsapp_number) {
          setWhatsappNumber(data.settings.whatsapp_number)
        }
      })
      .catch(err => console.error(err))
  }, [])

  const messageTemplate = "Hi Neuro IT, I need assistance with an IT issue. My postcode is: [   ] and my device/fault is: [   ]"
  const encodedText = encodeURIComponent(messageTemplate)
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`

  return (
    <div className="fixed z-[9999] right-4 bottom-24 md:right-6 md:bottom-6 flex flex-col gap-3 select-none">
      {/* WhatsApp CTA */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 py-1.5 px-3 bg-[#121212]/80 backdrop-blur-xl border border-white/10 hover:border-[#25D366]/50 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(37,211,102,0.15)] group hover:scale-105 active:scale-95 transition-all duration-300 decoration-none text-white"
        aria-label="Open WhatsApp Chat Support"
      >
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 text-[#25D366]">
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-20 animate-ping"></span>
          <MessageCircle size={14} style={{ color: '#22C55E' }} />
        </div>
        <div className="flex flex-col gap-0.5 justify-center pr-1 text-left">
          <span className="text-[10px] font-extrabold text-white tracking-wide font-sans whitespace-nowrap">
            Fast Booking
          </span>
          <span className="text-[8px] font-bold text-[#25D366] tracking-wider font-sans uppercase whitespace-nowrap">
            Chat Online
          </span>
        </div>
      </a>
    </div>
  )
}
