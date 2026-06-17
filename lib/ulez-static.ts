// ULEZ and Congestion Zone postcode district checker
// Uses static data - no API cost

// ULEZ expanded zone districts (October 2021 expansion)
const ULEZ_DISTRICTS = new Set([
  'BR1','BR2','BR3','BR4','BR5','BR6','BR7',
  'CR0','CR2','CR3','CR4','CR5','CR6','CR7','CR8','CR9',
  'DA1','DA5','DA6','DA7','DA8','DA14','DA15','DA16','DA17','DA18',
  'E1','E2','E3','E4','E5','E6','E7','E8','E9','E10','E11','E12','E13',
  'E14','E15','E16','E17','E18','E20',
  'EC1','EC1A','EC1M','EC1N','EC1R','EC1V','EC1Y',
  'EC2','EC2A','EC2M','EC2N','EC2R','EC2V','EC2Y',
  'EC3','EC3A','EC3M','EC3N','EC3R','EC3V',
  'EC4','EC4A','EC4M','EC4N','EC4R','EC4V','EC4Y',
  'EN1','EN2','EN3','EN4','EN5',
  'HA0','HA1','HA2','HA3','HA4','HA5','HA6','HA7','HA8','HA9',
  'IG1','IG2','IG3','IG4','IG5','IG6','IG7','IG8','IG11',
  'KT1','KT2','KT3','KT4','KT5','KT6','KT8','KT9',
  'N1','N2','N3','N4','N5','N6','N7','N8','N9','N10','N11','N12',
  'N13','N14','N15','N16','N17','N18','N19','N20','N21','N22',
  'NW1','NW2','NW3','NW4','NW5','NW6','NW7','NW8','NW9','NW10','NW11',
  'RM1','RM2','RM3','RM5','RM6','RM7','RM8','RM9','RM10','RM11','RM12','RM13','RM14',
  'SE1','SE2','SE3','SE4','SE5','SE6','SE7','SE8','SE9','SE10','SE11','SE12',
  'SE13','SE14','SE15','SE16','SE17','SE18','SE19','SE20','SE21','SE22','SE23',
  'SE24','SE25','SE26','SE27','SE28',
  'SM1','SM2','SM3','SM4','SM5','SM6','SM7',
  'SW1','SW1A','SW1E','SW1H','SW1P','SW1V','SW1W','SW1X','SW1Y',
  'SW2','SW3','SW4','SW5','SW6','SW7','SW8','SW9','SW10','SW11','SW12',
  'SW13','SW14','SW15','SW16','SW17','SW18','SW19','SW20',
  'TW1','TW2','TW3','TW4','TW5','TW6','TW7','TW8','TW9','TW10','TW11','TW12','TW13','TW14',
  'UB1','UB2','UB3','UB4','UB5','UB6','UB7','UB8','UB10','UB18',
  'W1','W1A','W1B','W1C','W1D','W1F','W1G','W1H','W1J','W1K','W1S','W1T','W1U','W1W',
  'W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12','W13','W14',
  'WC1','WC1A','WC1B','WC1E','WC1H','WC1N','WC1R','WC1V','WC1X',
  'WC2','WC2A','WC2B','WC2E','WC2H','WC2N','WC2R',
])

// Congestion Charge zone (central London only)
const CONGESTION_DISTRICTS = new Set([
  'EC1','EC1A','EC1M','EC1N','EC1R','EC1V','EC1Y',
  'EC2','EC2A','EC2M','EC2N','EC2R','EC2V','EC2Y',
  'EC3','EC3A','EC3M','EC3N','EC3R','EC3V',
  'EC4','EC4A','EC4M','EC4N','EC4R','EC4V','EC4Y',
  'WC1','WC1A','WC1B','WC1E','WC1H','WC1N','WC1R','WC1V','WC1X',
  'WC2','WC2A','WC2B','WC2E','WC2H','WC2N','WC2R',
  'W1','W1A','W1B','W1C','W1D','W1F','W1G','W1H','W1J','W1K','W1S','W1T','W1U','W1W',
  'SW1','SW1A','SW1E','SW1H','SW1P','SW1V','SW1W','SW1X','SW1Y',
  'SE1',
])

function extractDistrict(postcode: string): string {
  const clean = postcode.toUpperCase().replace(/\s+/g, '')
  // Extract outward code (first part before the space/last 3 chars)
  const outward = clean.slice(0, clean.length - 3)
  // Try to match district (letters + numbers, e.g. "EC1A", "SW1", "N1")
  const match = outward.match(/^([A-Z]{1,2}\d[A-Z]?)/)
  return match ? match[1] : outward
}

export function checkUlez(postcode: string): {
  isUlez: boolean
  isCongestion: boolean
} {
  const district = extractDistrict(postcode)
  return {
    isUlez: false,
    isCongestion: CONGESTION_DISTRICTS.has(district),
  }
}

export function getCongestionSurcharge(bookingTime: Date = new Date()): number {
  const day = bookingTime.getDay() // 0=Sun, 1=Mon...6=Sat
  const hour = bookingTime.getHours()
  // Mon-Fri (1-5), 7am-6pm
  if (day >= 1 && day <= 5 && hour >= 7 && hour < 18) {
    return 15.0
  }
  return 0
}
