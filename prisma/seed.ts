import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with 55 services and 10 categories...')

  // Clear existing services, categories, and tickets to prevent foreign key errors or duplicate slugs
  console.log('🧹 Clearing old services, categories, and tickets...')
  await prisma.review.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.service.deleteMany()
  await prisma.serviceCategory.deleteMany()
  await prisma.coverageBorough.deleteMany()


  console.log('🗺️ Seeding coverage boroughs...')
  const defaultBoroughs = [
    // Zone 4: FREE CALL-OUT ZONE (Core area)
    { name: 'Barnet', slug: 'barnet', zone: 'FREE_CALL_OUT', lat: 51.6531, lng: -0.2001, postcodes: 'EN4,EN5,N2,N3,N20,N11' },
    { name: 'Potters Bar', slug: 'pottersbar', zone: 'FREE_CALL_OUT', lat: 51.6985, lng: -0.1793, postcodes: 'EN6' },
    { name: 'Borehamwood', slug: 'borehamwood', zone: 'FREE_CALL_OUT', lat: 51.6578, lng: -0.2723, postcodes: 'WD6' },
    { name: 'Edgware', slug: 'edgware', zone: 'FREE_CALL_OUT', lat: 51.6135, lng: -0.2749, postcodes: 'HA8' },

    // Zone 3: £15.00 STANDARD CALL-OUT ZONE
    { name: 'Watford', slug: 'watford', zone: 'STANDARD_999', lat: 51.6565, lng: -0.3903, postcodes: 'WD17,WD18,WD19,WD24,WD25' },
    { name: 'Enfield', slug: 'enfield', zone: 'STANDARD_999', lat: 51.6522, lng: -0.0808, postcodes: 'EN1,EN2,EN3,N14,N21' },
    { name: 'Harrow', slug: 'harrow', zone: 'STANDARD_999', lat: 51.5806, lng: -0.3420, postcodes: 'HA1,HA2,HA3,HA5' },
    { name: 'Wembley', slug: 'wembley', zone: 'STANDARD_999', lat: 51.5573, lng: -0.2974, postcodes: 'HA0,HA9' },
    { name: 'Camden', slug: 'camden', zone: 'STANDARD_999', lat: 51.5290, lng: -0.1258, postcodes: 'NW1,NW3,NW5' },
    { name: 'Islington', slug: 'islington', zone: 'STANDARD_999', lat: 51.5465, lng: -0.1028, postcodes: 'N1,N5,N7' },

    // Zone 2: GREATER LONDON FLEXIBLE (Negotiated / Travel fee agreed)
    { name: 'Westminster', slug: 'westminster', zone: 'LONDON_FLEX', lat: 51.4975, lng: -0.1357, postcodes: 'SW1,W1,W2,WC2' },
    { name: 'City of London', slug: 'city-of-london', zone: 'LONDON_FLEX', lat: 51.5123, lng: -0.0906, postcodes: 'EC1,EC2,EC3,EC4' },
    { name: 'Hackney', slug: 'hackney', zone: 'LONDON_FLEX', lat: 51.5450, lng: -0.0553, postcodes: 'E1,E2,E8,E9' },
    { name: 'Stratford', slug: 'stratford', zone: 'LONDON_FLEX', lat: 51.5417, lng: -0.0036, postcodes: 'E15,E20' },
    { name: 'Ealing', slug: 'ealing', zone: 'LONDON_FLEX', lat: 51.5130, lng: -0.3080, postcodes: 'W3,W5,W13,UB1,UB2' },
    { name: 'Richmond', slug: 'richmond', zone: 'LONDON_FLEX', lat: 51.4479, lng: -0.3260, postcodes: 'TW9,TW10' },
    { name: 'Croydon', slug: 'croydon', zone: 'LONDON_FLEX', lat: 51.3762, lng: -0.0982, postcodes: 'CR0,CR2,CR7' },
    { name: 'Greenwich', slug: 'greenwich', zone: 'LONDON_FLEX', lat: 51.4891, lng: 0.0073, postcodes: 'SE3,SE10,SE18' }
  ]

  for (const b of defaultBoroughs) {
    await prisma.coverageBorough.create({ data: b })
  }
  console.log('✅ 18 coverage boroughs seeded.')

  const categories = [
    {
      name: 'Laptop Services',
      slug: 'laptop-services',
      icon: 'Laptop',
      displayOrder: 1,
      services: [
        {
          name: 'Screen Replacement',
          slug: 'screen-replacement',
          basePriceMin: 79,
          basePriceMax: 250,
          description: 'Cracked or broken screen replaced with OEM-quality parts. All brands and resolutions — FHD, QHD, OLED. Colour calibrated and tested before handover.',
          displayOrder: 1,
        },
        {
          name: 'Battery Replacement',
          slug: 'battery-replacement',
          basePriceMin: 49,
          basePriceMax: 120,
          description: 'Genuine-spec cells restore full capacity. We test and report battery health before and after. Covers all laptop models including MacBook.',
          displayOrder: 2,
        },
        {
          name: 'Keyboard Replacement',
          slug: 'keyboard-replacement',
          basePriceMin: 59,
          basePriceMax: 150,
          description: 'Full keyboard swap or individual key repair for sticky, broken, or missing keys. UK and US layouts available. Backlit keyboards fully supported.',
          displayOrder: 3,
        },
        {
          name: 'Charging Port Repair',
          slug: 'charging-port-repair',
          basePriceMin: 49,
          basePriceMax: 100,
          description: 'Loose, damaged or broken charging ports. USB-C, MagSafe and barrel connectors all covered. Port cleaning included for intermittent charging faults.',
          displayOrder: 4,
        },
        {
          name: 'RAM Upgrade',
          slug: 'ram-upgrade',
          basePriceMin: 39,
          basePriceMax: 90,
          description: 'Boost multitasking performance without buying a new laptop. We advise the best upgrade path for your specific model and test under load after fitting.',
          displayOrder: 5,
        },
        {
          name: 'SSD / Storage Upgrade',
          slug: 'ssd-storage-upgrade',
          basePriceMin: 49,
          basePriceMax: 180,
          description: 'Replace a slow spinning hard drive or upgrade to a faster NVMe SSD. Full data migration included — everything as you left it, just much faster.',
          displayOrder: 6,
        },
        {
          name: 'Overheating Fix',
          slug: 'overheating-fix',
          basePriceMin: 39,
          basePriceMax: 80,
          description: 'Thermal paste replacement, deep fan cleaning and heatsink reseating. We benchmark temps before and after to confirm the fix — prevents long-term CPU damage.',
          displayOrder: 7,
        },
        {
          name: 'Water Damage Recovery',
          slug: 'water-damage-recovery',
          basePriceMin: 89,
          basePriceMax: 250,
          description: 'Board-level inspection, ultrasonic cleaning and controlled drying. Best chance of saving your laptop after a spill. No fix, no fee applies — power off immediately and call us.',
          displayOrder: 8,
        },
      ],
    },
    {
      name: 'Desktop / PC',
      slug: 'desktop-pc',
      icon: 'Monitor',
      displayOrder: 2,
      services: [
        {
          name: 'PC Repair & Diagnostics',
          slug: 'pc-repair-diagnostics',
          basePriceMin: 49,
          basePriceMax: 150,
          description: 'Full hardware and software diagnosis of any desktop fault. We identify and fix the root cause — not just the symptom. All components bench-tested and load-tested.',
          displayOrder: 1,
        },
        {
          name: 'Custom PC Build',
          slug: 'custom-pc-build',
          basePriceMin: 99,
          basePriceMax: 499,
          description: 'We source, assemble, cable-manage and configure your dream build. Gaming, workstation or home office. OS installation, driver setup and benchmark testing included.',
          displayOrder: 2,
        },
        {
          name: 'PC Upgrade',
          slug: 'pc-upgrade',
          basePriceMin: 39,
          basePriceMax: 200,
          description: 'GPU, CPU, RAM or storage upgrades with full compatibility checking before any parts are ordered. Performance benchmarking before and after upgrade included.',
          displayOrder: 3,
        },
        {
          name: 'No Power Fix',
          slug: 'no-power-fix',
          basePriceMin: 59,
          basePriceMax: 150,
          description: 'PSU testing, motherboard diagnosis and component-level fault finding. We carry common PSU models for same-day swap if needed. Won\'t start? We\'ll find out why.',
          displayOrder: 4,
        },
        {
          name: 'Graphics Card Repair',
          slug: 'graphics-card-repair',
          basePriceMin: 69,
          basePriceMax: 250,
          description: 'Reflow, reballing and thermal compound replacement for failing GPUs. Covers NVIDIA and AMD cards. Artifacts, black screen and driver crash faults all diagnosed.',
          displayOrder: 5,
        },
        {
          name: 'Dust Clean & Maintenance',
          slug: 'dust-clean-maintenance',
          basePriceMin: 29,
          basePriceMax: 79,
          description: 'Deep compressed-air clean, thermal paste refresh on CPU/GPU and a full health check. Extends component life significantly and reduces noise. Recommended annually.',
          displayOrder: 6,
        },
      ],
    },
    {
      name: 'Software & OS',
      slug: 'software-os',
      icon: 'Code',
      displayOrder: 3,
      services: [
        {
          name: 'Windows Reinstall',
          slug: 'windows-reinstall',
          basePriceMin: 49,
          basePriceMax: 120,
          description: 'Clean Windows 11 install with all drivers. Data backed up to external drive first and restored after. Activation included. Your apps re-installed and configured to your preferences.',
          displayOrder: 1,
        },
        {
          name: 'Driver Installation',
          slug: 'driver-installation',
          basePriceMin: 29,
          basePriceMax: 69,
          description: 'Missing or corrupt drivers fixed. Sound, graphics, network, Bluetooth, printer and specialist hardware drivers. No more yellow warning signs in Device Manager.',
          displayOrder: 2,
        },
        {
          name: 'Software Setup',
          slug: 'software-setup',
          basePriceMin: 29,
          basePriceMax: 79,
          description: 'Installation and configuration of any software. Microsoft 365, Adobe Creative Cloud, Zoom, Slack, specialist business tools. Licences transferred and accounts signed in.',
          displayOrder: 3,
        },
        {
          name: 'PC Optimisation',
          slug: 'pc-optimisation',
          basePriceMin: 39,
          basePriceMax: 99,
          description: 'Speed up a slow machine without hardware upgrades. Startup programs, background services, disk cleanup, bloatware removal and registry optimisation. Before/after comparison provided.',
          displayOrder: 4,
        },
        {
          name: 'Password Recovery',
          slug: 'password-recovery',
          basePriceMin: 39,
          basePriceMax: 89,
          description: 'Locked out of Windows, macOS or even BIOS? We regain access without data loss. Local accounts, Microsoft accounts and domain logins all covered.',
          displayOrder: 5,
        },
        {
          name: 'Email Setup',
          slug: 'email-setup',
          basePriceMin: 29,
          basePriceMax: 69,
          description: 'Gmail, Outlook, Apple Mail or business IMAP/Exchange configured on all your devices. Signature setup, contacts synced and calendar integrated across PC, phone and tablet.',
          displayOrder: 6,
        },
      ],
    },
    {
      name: 'Virus & Security',
      slug: 'virus-security',
      icon: 'Shield',
      displayOrder: 4,
      services: [
        {
          name: 'Virus Removal',
          slug: 'virus-removal',
          basePriceMin: 49,
          basePriceMax: 120,
          description: 'Complete malware, spyware, adware and rootkit removal using professional-grade tools. Root-cause analysis to understand how you were infected and prevent it happening again.',
          displayOrder: 1,
        },
        {
          name: 'Ransomware Recovery',
          slug: 'ransomware-recovery',
          basePriceMin: 89,
          basePriceMax: 299,
          description: 'Encrypted files? We attempt decryption using known decryptors, isolate the infection and secure your system against repeat attacks. Do not pay the ransom — call us first.',
          displayOrder: 2,
        },
        {
          name: 'Security Audit',
          slug: 'security-audit',
          basePriceMin: 59,
          basePriceMax: 149,
          description: 'Full vulnerability assessment of your home or business network and connected devices. We produce a written report with prioritised recommendations — actionable, not just a list of risks.',
          displayOrder: 3,
        },
        {
          name: 'Parental Controls Setup',
          slug: 'parental-controls-setup',
          basePriceMin: 29,
          basePriceMax: 79,
          description: 'Safe browsing filters, screen time limits, content categorisation and app restrictions configured across all family devices — router level and per-device for maximum coverage.',
          displayOrder: 4,
        },
        {
          name: 'VPN & Privacy Setup',
          slug: 'vpn-privacy-setup',
          basePriceMin: 39,
          basePriceMax: 99,
          description: 'Encrypted VPN, private DNS (AdGuard / NextDNS), tracker blocking and privacy-hardened browser configured correctly so they actually work — not just installed and forgotten.',
          displayOrder: 5,
        },
        {
          name: 'Two-Factor Authentication',
          slug: 'two-factor-authentication',
          basePriceMin: 29,
          basePriceMax: 69,
          description: '2FA configured across email, banking, social media and cloud accounts using an authenticator app. Backup codes stored safely. Hardware key (YubiKey) setup also available.',
          displayOrder: 6,
        },
      ],
    },
    {
      name: 'Data & Recovery',
      slug: 'data-recovery',
      icon: 'Database',
      displayOrder: 5,
      services: [
        {
          name: 'Hard Drive Recovery',
          slug: 'hard-drive-recovery',
          basePriceMin: 99,
          basePriceMax: 299,
          description: 'Recover files from failed, damaged, formatted or accidental deletion scenarios. Logical and minor mechanical issues covered in-house. No data, no fee — always.',
          displayOrder: 1,
        },
        {
          name: 'SSD Data Recovery',
          slug: 'ssd-data-recovery',
          basePriceMin: 119,
          basePriceMax: 349,
          description: 'Specialist recovery from failed SSDs including NVMe, M.2 and SATA formats. Controller failure, NAND issues and firmware corruption all diagnosed. Clean-room referral for severe cases.',
          displayOrder: 2,
        },
        {
          name: 'Photo & Video Recovery',
          slug: 'photo-video-recovery',
          basePriceMin: 79,
          basePriceMax: 199,
          description: 'Deleted photos, corrupted SD cards, formatted drives and crashed camera storage recovered using professional imaging tools. JPEG, RAW, MP4, MOV all supported.',
          displayOrder: 3,
        },
        {
          name: 'Cloud Backup Setup',
          slug: 'cloud-backup-setup',
          basePriceMin: 39,
          basePriceMax: 99,
          description: 'Automated backup to OneDrive, Google Drive, iCloud or Backblaze configured and tested. Versioning enabled, schedule set, alerts configured. Never lose data again.',
          displayOrder: 4,
        },
        {
          name: 'Data Migration',
          slug: 'data-migration',
          basePriceMin: 49,
          basePriceMax: 120,
          description: 'Move everything from old to new device — files, settings, apps, browser bookmarks, email, contacts and accounts. We verify every folder before leaving your home.',
          displayOrder: 5,
        },
        {
          name: 'RAID Recovery',
          slug: 'raid-recovery',
          basePriceMin: 149,
          basePriceMax: 499,
          description: 'RAID 0, 1, 5 and 10 array recovery for home NAS devices and small business servers. Synology, QNAP and custom arrays. Array rebuild and health monitoring setup included.',
          displayOrder: 6,
        },
      ],
    },
    {
      name: 'Home Network',
      slug: 'home-network',
      icon: 'Wifi',
      displayOrder: 6,
      services: [
        {
          name: 'WiFi Setup & Configuration',
          slug: 'wifi-setup-configuration',
          basePriceMin: 49,
          basePriceMax: 120,
          description: 'Router setup, SSID configuration, WPA3 security, optimal channel selection and band steering. ISP router or own equipment — we make it fast, stable and secure.',
          displayOrder: 1,
        },
        {
          name: 'WiFi Dead Zone Fix',
          slug: 'wifi-dead-zone-fix',
          basePriceMin: 49,
          basePriceMax: 149,
          description: 'Mesh systems, access points and powerline adapters to eliminate weak signal areas. We do a full site survey before recommending the right solution for your property layout.',
          displayOrder: 2,
        },
        {
          name: 'Smart Home Setup',
          slug: 'smart-home-setup',
          basePriceMin: 59,
          basePriceMax: 199,
          description: 'Alexa, Google Home, Apple HomeKit, Philips Hue, smart plugs, Ring doorbells and thermostats — configured, automated and integrated so everything works together seamlessly.',
          displayOrder: 3,
        },
        {
          name: 'Network Security Hardening',
          slug: 'network-security-hardening',
          basePriceMin: 49,
          basePriceMax: 120,
          description: 'Firewall rules, guest network isolation, MAC address filtering, firmware updates and DNS-level ad blocking. Your home network, locked down properly.',
          displayOrder: 4,
        },
        {
          name: 'Printer Setup',
          slug: 'printer-setup',
          basePriceMin: 29,
          basePriceMax: 69,
          description: 'Wired or wireless printer connected to all devices in your home. Scan-to-email, mobile printing via AirPrint or Google Cloud Print, and fax-to-email where applicable.',
          displayOrder: 5,
        },
        {
          name: 'NAS / Home Server Setup',
          slug: 'nas-home-server-setup',
          basePriceMin: 79,
          basePriceMax: 249,
          description: 'Synology, QNAP or custom NAS configured for media streaming (Plex/Jellyfin), automated backup, remote access and RAID protection. Everything set up, tested and explained.',
          displayOrder: 6,
        },
      ],
    },
    {
      name: 'Remote Support',
      slug: 'remote-support',
      icon: 'MousePointer',
      displayOrder: 7,
      services: [
        {
          name: 'Remote Session — 30 min',
          slug: 'remote-session-30-min',
          basePriceMin: 29,
          basePriceMax: 29,
          description: 'Quick remote session via secure screen share. Perfect for software glitches, settings, account issues and quick fixes. No travel charge. Available same day, often within the hour.',
          displayOrder: 1,
        },
        {
          name: 'Remote Session — 1 Hour',
          slug: 'remote-session-1-hour',
          basePriceMin: 49,
          basePriceMax: 49,
          description: 'Extended remote session for more complex software problems — virus scans, system optimisation, driver conflicts and configuration issues. No waiting, no travel, no hassle.',
          displayOrder: 2,
        },
        {
          name: 'Business Remote Plan',
          slug: 'business-remote-plan',
          basePriceMin: 79,
          basePriceMax: 79,
          description: 'Monthly remote support retainer for small businesses. Dedicated technician, guaranteed 4-hour response, unlimited remote sessions and quarterly security audits. Billed monthly, cancel anytime.',
          displayOrder: 3,
        },
      ],
    },
    {
      name: 'New Device Setup',
      slug: 'new-device-setup',
      icon: 'Package',
      displayOrder: 8,
      services: [
        {
          name: 'New Laptop Setup',
          slug: 'new-laptop-setup',
          basePriceMin: 49,
          basePriceMax: 120,
          description: 'Unbox, Windows activation, all drivers installed, your apps set up and data migrated from your old laptop. Accounts signed in, email configured, printer connected. Ready to use immediately.',
          displayOrder: 1,
        },
        {
          name: 'New PC Setup',
          slug: 'new-pc-setup',
          basePriceMin: 49,
          basePriceMax: 140,
          description: 'Windows activation, all drivers, software installation, security configuration and peripheral setup. Existing files migrated from old machine. We don\'t leave until everything works.',
          displayOrder: 2,
        },
        {
          name: 'New Phone Setup',
          slug: 'new-phone-setup',
          basePriceMin: 29,
          basePriceMax: 69,
          description: 'iPhone or Android — contacts, photos, apps, messages and accounts transferred from your old phone. WhatsApp history migrated. Everything works from day one, nothing lost.',
          displayOrder: 3,
        },
        {
          name: 'Smart TV Setup',
          slug: 'smart-tv-setup',
          basePriceMin: 39,
          basePriceMax: 99,
          description: 'Netflix, Prime, Disney+, Apple TV+ and other streaming services signed in and configured. Screencasting, HDMI-ARC, soundbar pairing and parental controls all included.',
          displayOrder: 4,
        },
      ],
    },
    {
      name: 'Apple / Mac',
      slug: 'apple-mac',
      icon: 'Apple',
      displayOrder: 9,
      services: [
        {
          name: 'MacBook Screen Replacement',
          slug: 'macbook-screen-replacement',
          basePriceMin: 149,
          basePriceMax: 399,
          description: 'OEM-quality Retina and Liquid Retina displays for all MacBook Air and Pro models (M1, M2, M3, Intel). Colour calibrated and True Tone restored after fitting.',
          displayOrder: 1,
        },
        {
          name: 'MacBook Battery Replacement',
          slug: 'macbook-battery-replacement',
          basePriceMin: 89,
          basePriceMax: 199,
          description: 'Apple-spec capacity cells that pass Apple\'s own battery health diagnostic. Covers all MacBook models including MagSafe and USB-C. Cycle count reset confirmed.',
          displayOrder: 2,
        },
        {
          name: 'macOS Reinstall',
          slug: 'macos-reinstall-apple',
          basePriceMin: 59,
          basePriceMax: 129,
          description: 'Clean macOS install, Time Machine restore or fresh setup with data migration. Sonoma, Ventura, Monterey all covered. Data backed up before any work begins.',
          displayOrder: 3,
        },
        {
          name: 'iPhone Screen Repair',
          slug: 'iphone-screen-repair',
          basePriceMin: 49,
          basePriceMax: 199,
          description: 'OEM-quality OLED and LCD screens for all iPhone models (12 through 16 Pro Max). True Tone, Face ID and ProMotion 120Hz all preserved. 90-day parts warranty included.',
          displayOrder: 4,
        },
        {
          name: 'iPhone Battery Replacement',
          slug: 'iphone-battery-replacement',
          basePriceMin: 39,
          basePriceMax: 99,
          description: 'Genuine-spec cells that restore your battery capacity to 100% and pass Apple\'s battery health check. Covers iPhone 12 through 16. Maximum capacity guarantee.',
          displayOrder: 5,
        },
        {
          name: 'Mac Upgrade (RAM / SSD)',
          slug: 'mac-upgrade-ram-ssd',
          basePriceMin: 79,
          basePriceMax: 249,
          description: 'Upgrade older Intel Macs with faster SSDs and more RAM for a significant performance boost. iMac, Mac Mini and older MacBook Pro models supported. Data migrated, nothing lost.',
          displayOrder: 6,
        },
      ],
    },
    {
      name: 'Emergency',
      slug: 'emergency',
      icon: 'Zap',
      displayOrder: 10,
      services: [
        {
          name: 'Same-Day Emergency Callout',
          slug: 'emergency-same-day-home-visit',
          basePriceMin: 89,
          basePriceMax: 199,
          callOutFee: 50,
          description: 'Priority engineer dispatched to your location — available 7 days a week including bank holidays. WhatsApp ETA tracking from the moment of booking. 100% upfront payment required for emergency slots.',
          displayOrder: 1,
        },
        {
          name: 'Out-of-Hours Callout',
          slug: 'out-of-hours-support',
          basePriceMin: 119,
          basePriceMax: 249,
          callOutFee: 75,
          description: 'Evening (after 6pm) and weekend emergency response for critical issues that genuinely can\'t wait. Surcharge applies for out-of-hours visits — shown transparently before payment.',
          displayOrder: 2,
        },
        {
          name: 'Business Critical Response',
          slug: 'business-critical-response',
          basePriceMin: 149,
          basePriceMax: 349,
          callOutFee: 100,
          description: 'Server down, ransomware attack or total network failure? Priority dispatch for business-critical emergencies. Remote triage begins immediately while engineer is en route.',
          displayOrder: 3,
        },
        {
          name: 'Pre-Event Tech Check',
          slug: 'pre-event-tech-check',
          basePriceMin: 79,
          basePriceMax: 199,
          callOutFee: 0,
          description: 'Presentation tomorrow? Conference next week? We come to your location in advance and ensure every piece of tech works perfectly — projectors, laptops, AV, WiFi and backup plans.',
          displayOrder: 4,
        },
      ],
    },
  ]

  for (const cat of categories) {
    const { services, ...catData } = cat
    const category = await prisma.serviceCategory.upsert({
      where: { slug: catData.slug },
      update: {
        name: catData.name,
        icon: catData.icon,
        displayOrder: catData.displayOrder,
        isActive: true,
      },
      create: {
        name: catData.name,
        slug: catData.slug,
        icon: catData.icon,
        displayOrder: catData.displayOrder,
        isActive: true,
      },
    })
    console.log(`  📂 Category: ${category.name}`)

    for (const svc of services) {
      await prisma.service.upsert({
        where: { slug: svc.slug },
        update: {
          name: svc.name,
          basePriceMin: svc.basePriceMin,
          basePriceMax: svc.basePriceMax,
          description: svc.description,
          callOutFee: (svc as any).callOutFee || 0,
          displayOrder: svc.displayOrder,
          isActive: true,
        },
        create: {
          name: svc.name,
          slug: svc.slug,
          categoryId: category.id,
          basePriceMin: svc.basePriceMin,
          basePriceMax: svc.basePriceMax,
          description: svc.description,
          callOutFee: (svc as any).callOutFee || 0,
          isEmergencyReady: true,
          isActive: true,
          displayOrder: svc.displayOrder,
        },
      })
    }
    console.log(`    ↳ ${services.length} services seeded.`)
  }

  // Create admin user if not exists
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@neuroit.co.uk'
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: {
      email: adminEmail,
      name: 'Admin',
      role: 'ADMIN',
      gdprConsent: true,
      gdprConsentAt: new Date(),
    },
  })
  console.log(`✅ Admin user verified: ${adminEmail}`)

  // Create some default tickets for testing if table is empty
  const ticketCount = await prisma.ticket.count()
  if (ticketCount === 0) {
    console.log('🎫 Seeding default demonstration tickets...')
    
    // Find customer role user or create one
    const customer = await prisma.user.upsert({
      where: { email: 'james@example.com' },
      update: {},
      create: {
        email: 'james@example.com',
        name: 'James Wilson',
        role: 'CUSTOMER',
        phone: '07700900000',
        gdprConsent: true,
        gdprConsentAt: new Date(),
      },
    })

    const activeService = await prisma.service.findFirst({
      where: { slug: 'laptop-repair' }
    })

    if (activeService) {
      await prisma.ticket.create({
        data: {
          referenceCode: 'NEURO-2026-ABCD',
          customerId: customer.id,
          serviceId: activeService.id,
          status: 'TECH_ASSIGNED',
          priority: 'STANDARD',
          issueDescription: 'Laptop is running very slow and keeps freezing.',
          estimatedPriceMin: activeService.basePriceMin,
          estimatedPriceMax: activeService.basePriceMax,
          isUlezSurcharge: false,
          createdAt: new Date(Date.now() - 3600000 * 24),
          adminNote: 'Tech assigned. Standard checkup needed.',
        }
      })
      console.log('  🎫 demonstration ticket created.')
    }
  }

  // Create default system settings
  console.log('⚙️ Seeding default system settings...')
  await prisma.systemSetting.upsert({
    where: { key: 'flat_deposit_fee' },
    update: {},
    create: {
      key: 'flat_deposit_fee',
      value: '10.00',
      description: 'Standard flat booking deposit fee (in GBP) for addresses inside coverage area',
    },
  })
  await prisma.systemSetting.upsert({
    where: { key: 'whatsapp_number' },
    update: {},
    create: {
      key: 'whatsapp_number',
      value: '447519460614',
      description: 'Business WhatsApp phone number for out-of-zone customer negotiations and floating chat widget',
    },
  })
  await prisma.systemSetting.upsert({
    where: { key: 'contact_phone' },
    update: {},
    create: {
      key: 'contact_phone',
      value: '+447519460614',
      description: 'Business office landline phone number',
    },
  })

  console.log('📝 Seeding default SEO-optimized blog posts...')
  const blogPosts = [
    {
      slug: 'it-support-costs-london-guide',
      title: 'The Complete Guide to IT Support Costs in London (2026)',
      excerpt: 'How much should you expect to pay for computer repairs and IT support in London? We break down hourly rates, flat fees, and diagnostic costs.',
      metaTitle: 'IT Support Costs London: Laptop & PC Repair Pricing Guide',
      metaDescription: 'Discover average IT support costs in London. Learn about repair fees, flat deposits, same-day callouts, and how to avoid hidden IT maintenance charges.',
      published: true,
      publishedAt: new Date(),
      content: `# The Complete Guide to IT Support Costs in London (2026)

Navigating the landscape of IT support and computer repairs in a major metropolis like London can be daunting. With service providers ranging from sole traders to multinational managed service providers (MSPs), pricing varies wildly. 

In this comprehensive guide, we'll break down the real cost of IT support in London for home users and small businesses, helping you understand what you are paying for and how to avoid hidden charges.

---

## 1. Average Repair Costs: What is the Going Rate?

When it comes to ad-hoc or "break-fix" IT services, there are two primary pricing models: **hourly rates** and **flat-fee services**.

### Hourly Rates vs. Flat Fees
- **Hourly Rates:** Typically range from **£40 to £120 per hour** depending on the technician's expertise and location. While good for quick diagnostics, hourly billing carries the risk of runaway costs if a problem proves complex.
- **Flat-fee Services:** Many premium repair providers (like Neuro IT) charge a flat fee or deposit for specific services (e.g., £15.00 booking deposit, screen replacement starting from £79). This provides financial predictability.

| Service Category | Typical Price Range (London Avg) | Neuro IT Starting Price |
| :--- | :--- | :--- |
| **Diagnostics & Troubleshooting** | £45 - £90 | Included in Repair |
| **Laptop Screen Replacement** | £90 - £250 | £79 |
| **OS Reinstallation (Windows/Mac)** | £60 - £150 | £49 |
| **Virus & Malware Removal** | £60 - £130 | £49 |
| **Data Recovery (SSD/HDD)** | £120 - £400+ | £99 |

---

## 2. The Truth About Call-Out Fees and Travel Surcharges

In London, travel logistics represent a significant portion of an on-site engineer's cost. Many IT firms charge steep call-out fees to offset this.

- **The ULEZ & Congestion Zone Factor:** Operating in central London requires navigating the Ultra Low Emission Zone (ULEZ) and the Congestion Charge zone. Be sure to check whether your chosen support company passes these costs onto you. At Neuro IT, we have **eliminated ULEZ zone surcharges** entirely, though Congestion Charges apply transparently if your postcode falls in the Congestion Zone.
- **Out-of-Zone Fees:** If you live on the outskirts of Greater London, prepare for potential distance surcharges. Selecting a local borough-focused provider helps keep costs low.

---

## 3. Managed IT Support for Small Businesses

For businesses, relying on break-fix support leads to unpredictable downtime and variable invoices. Most London businesses choose **Managed IT Services**, billed monthly.

1. **Per-User Pricing:** £30 to £75 per user, per month. This usually includes remote support, security licensing, and basic system monitoring.
2. **Per-Device Pricing:** £15 to £40 per device (servers are priced higher, typically £100 - £250/month).
3. **Hybrid Remote Plans:** For small companies with remote-first setups, specialized plans like Neuro IT's Business Remote Plan (£79/month retainer) offer guaranteed response times and remote troubleshooting without the cost of a full managed contract.

---

## 4. Red Flags to Watch Out For

When hiring an IT technician in London, always ensure they are transparent about their fees:
* **"No Fix, No Fee" Guarantees:** Ensure this is clearly stated in writing before handing over your machine.
* **Parts Markups:** Ask if the quoted price includes the cost of the replacement parts or just the labor.
* **DBS Checks:** For home visits, always verify that the technician is DBS-checked for your safety and peace of mind.

By understanding these benchmarks, you can make informed decisions and get the best value for your IT repair budget in London.`,
    },
    {
      slug: 'protect-london-home-network-security',
      title: 'How to Protect Your London Home Network: 5 Easy Cybersecurity Steps',
      excerpt: 'Cyberattacks targeting home offices are rising. Learn how to secure your router, enable WPA3, set up guest networks, and block trackers.',
      metaTitle: 'Home Network Security: Protect Your London Smart Home & Office',
      metaDescription: 'Stop cyber threats with our home network security guide. Essential steps for securing your WiFi router, setting up guest networks, and enabling 2FA.',
      published: true,
      publishedAt: new Date(),
      content: `# How to Protect Your London Home Network: 5 Easy Cybersecurity Steps

With hybrid working now standard for most London professionals, home networks have become primary targets for cybercriminals. A breach of your home Wi-Fi doesn't just put your personal photos at risk — it can expose sensitive corporate data and lead to identity theft.

Securing your network does not require an IT degree. Here are 5 practical, high-impact cybersecurity steps you can implement today.

---

## 1. Change Default Router Credentials Immediately

Every router comes with a pre-configured administrator password (often written on a sticker on the bottom, or worse, default options like \`admin/admin\`). Cybercriminals keep databases of these defaults and scan residential IP addresses to gain control of routers.

- **Action:** Access your router's settings page (typically by typing \`192.168.1.1\` or \`192.168.0.1\` in a browser) and change the admin password to a strong, unique passphrase. *Note: This is different from the Wi-Fi password.*

---

## 2. Enable WPA3 Encryption (or WPA2-AES)

Encryption scrambles the data travelling between your laptop, phone, and router.
- **WPA2 (AES):** The industry standard for over a decade. Secure, but vulnerable to advanced brute-force attacks.
- **WPA3:** The latest security protocol. It offers significantly stronger protection against password-guessing attacks and encrypts individual connections on your network.

- **Action:** In your router wireless security settings, verify that **WPA3-Personal** or **WPA2/WPA3 Mixed Mode** is enabled. Avoid outdated protocols like WEP or WPA (TKIP).

---

## 3. Create a Dedicated Guest Network for Smart Devices (IoT)

Smart TVs, baby monitors, heating systems, and smart bulbs are notoriously insecure. They rarely receive firmware updates and often contain vulnerabilities. If a hacker breaches a smart bulb on your main network, they can easily access your work computer.

- **Action:** Turn on the "Guest Network" feature on your router. Connect all smart home IoT devices and guests to this network, and reserve your main Wi-Fi exclusively for your laptops, tablets, and phones.

---

## 4. Use Private, Ad-Blocking DNS

When you visit a website, your browser uses a DNS server to translate the name (e.g., \`google.com\`) into an IP address. By default, you use your ISP's DNS, which doesn't block threats.

- **Action:** Switch your router or device DNS to a secure, private DNS provider:
  - **Cloudflare DNS (\`1.1.1.2\`):** Automatically blocks known malware domains.
  - **AdGuard DNS or NextDNS:** Blocks trackers, ads, and malicious websites at the network level.

---

## 5. Keep Router Firmware Updated

Like your phone's operating system, your router's software (firmware) requires regular updates to patch security vulnerabilities. Outdated routers are easily hijacked to form botnets or inspect your internet traffic.

- **Action:** Check your router's admin panel for a firmware update option. If it has an "Auto-Update" toggle, turn it on. If your router is more than 5-7 years old, it may no longer receive updates, meaning it is time to upgrade to a modern Wi-Fi 6 or Wi-Fi 7 device.

---

## Need Professional Help?
If setting up router firewalls, mesh networks, or security audits feels overwhelming, our London engineers can visit your home to configure everything securely. Explore our **Home Network** services or book a **Security Audit** today.`,
    },
    {
      slug: 'laptop-overheating-causes-fixes',
      title: 'Why is My Laptop Overheating? Symptoms, Causes, and Fast Fixes',
      excerpt: 'Laptop running hot or shutting down? Discover the causes of laptop overheating, how thermal paste refresh works, and how to clean cooling fans safely.',
      metaTitle: 'Laptop Overheating Fixes: Fan Cleaning & Thermal Paste London',
      metaDescription: 'Is your laptop overheating or freezing? Learn the common causes of high CPU temperatures and how professional thermal paste refresh can save your device.',
      published: true,
      publishedAt: new Date(),
      content: `# Why is My Laptop Overheating? Symptoms, Causes, and Fast Fixes

Laptops pack incredible computing power into wafer-thin chassis. While this makes them highly portable, it also makes heat management a critical challenge. If your laptop feels like a hot plate, or the fans sound like a jet engine, you need to act before permanent damage occurs.

In this guide, we'll cover the warning signs of an overheating laptop, the main culprits, and how to fix them.

---

## Common Symptoms of Overheating
Your laptop will usually let you know when it is running too hot:
* **Loud Fan Noise:** Fans running constantly at 100% speed, even when you aren\'t doing intensive tasks.
* **Thermal Throttling:** Performance slows to a crawl or freeze. The CPU deliberately slows itself down to generate less heat.
* **Sudden Shutdowns:** The laptop turns off abruptly without warning. This is a built-in safety feature to prevent the processor from melting.
* **Hot Surface:** The keyboard or underside of the laptop is uncomfortable to touch.

---

## The 3 Main Causes of Laptop Overheating

### 1. Dust Blockages in Fans and Vents
Laptops draw in air from the bottom and blow it out the sides or back. Over time, fans pull in dust, lint, and pet hair. This debris forms a thick carpet over the tiny heatsink fins, blocking airflow entirely.

### 2. Degraded Thermal Paste
Between the CPU/GPU chip and the copper heatsink is a thin layer of thermal paste. This paste fills microscopic air gaps to facilitate heat transfer. Over 2 to 4 years, this paste dries out, becomes brittle, and acts as an insulator rather than a conductor.

### 3. Blocked Air Intake (User Error)
Using a laptop on a bed, duvet, carpet, or your lap blocks the intake vents on the bottom. The fans try to pull air but can't, causing internal temperatures to skyrocket in minutes.

---

## How to Cool Down Your Laptop: Quick Fixes

1. **Use Hard, Flat Surfaces:** Always use your laptop on a desk or a laptop stand. This ensures the rubber feet raise the chassis enough to allow airflow.
2. **Use a Cooling Pad:** Laptop stands with built-in fans can reduce temperatures by 5-10°C by forcing extra cool air into the intake vents.
3. **Close Heavy Background Apps:** Check Task Manager (Windows) or Activity Monitor (Mac) for apps utilizing high CPU resources and close them.

---

## When to Seek Professional Repair

If basic cleaning and surface adjustment don't help, the issue is likely internal:
* **Deep Dust Clean:** Opening the laptop to clean fan blades and heatsinks requires static protection and care not to damage delicate ribbon cables.
* **Thermal Paste Refresh:** This requires removing the cooling assembly, cleaning off the old cement-like paste with isopropyl alcohol, and applying a high-performance compound (like Noctua or Arctic MX-6).

At Neuro IT, we perform **Overheating Fixes** daily for all laptop brands. We clean the internal fans, replace the thermal compound, and run thermal benchmarks to confirm your CPU runs cool and quiet. Book an appointment today to extend your laptop\'s lifespan.`,
    },
  ]

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        content: post.content,
        published: post.published,
        publishedAt: post.publishedAt,
      },
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        content: post.content,
        published: post.published,
        publishedAt: post.publishedAt,
      },
    })
  }
  console.log(`  📝 ${blogPosts.length} default blog posts seeded.`)

  console.log('📄 Seeding default CMS pages...')
  const defaultPages = [
    {
      slug: 'home',
      title: 'Home Page',
      metaTitle: 'Neuro IT — London Home IT Support & Tech Repair',
      metaDescription: 'Vetted home IT support engineers in London. Fast tech repair, network setups, virus removal, device backup. Book online in 2 minutes.',
      sections: JSON.stringify({
        heroTitle: 'Same-Day Home IT Support & Laptop Repairs in London',
        heroSubtitle: 'No automated phone loops, no hidden call-out surcharges. Vetted, certified engineers dispatched to your door or repaired in our central workshop.',
        primaryCtaText: 'Book a Free Diagnostic',
        whatsappCtaText: 'WhatsApp Us',
      }),
    },
    {
      slug: 'how-it-works',
      title: 'How It Works',
      metaTitle: 'How It Works — Neuro IT',
      metaDescription: 'Learn how Neuro IT delivers premium home IT support in London. Simple 4-stage customer journey from booking to repair completion.',
      sections: JSON.stringify({
        title: 'How It Works',
        subtitle: 'A transparent, professional, and rapid service from start to finish.',
        step1Title: '1. Quick Booking',
        step1Text: 'Select your service, check coverage, and pay a flat deposit or request travel-fee review.',
        step2Title: '2. Diagnostics',
        step2Text: 'Our vetted engineer arrives on-site or starts a remote session to diagnose the issue.',
        step3Title: '3. Quote & Confirm',
        step3Text: 'We agree on final pricing and parts with you before any repairs are carried out.',
        step4Title: '4. Repair & Handover',
        step4Text: 'We complete the work, test the device with you, and hand it over clean and fully functional.',
      }),
    },
  ]

  for (const dp of defaultPages) {
    await prisma.cmsPage.upsert({
      where: { slug: dp.slug },
      update: {
        title: dp.title,
        metaTitle: dp.metaTitle,
        metaDescription: dp.metaDescription,
        sections: dp.sections,
      },
      create: dp,
    })
  }
  console.log('  📄 Default CMS pages seeded.')

  console.log('\n✨ Database seeded successfully with 55 services and system settings!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async e => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
