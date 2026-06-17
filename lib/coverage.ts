import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function parseOutward(code: string) {
  const m = code.match(/^([A-Z]{1,2})(\d+)([A-Z]?)$/i)
  if (!m) return null
  return {
    area: m[1].toUpperCase(),
    district: parseInt(m[2], 10),
    subdistrict: m[3] ? m[3].toUpperCase() : ""
  }
}

function matchPostcodeOutward(outward: string, prefix: string): boolean {
  const outParsed = parseOutward(outward)
  const prefParsed = parseOutward(prefix)
  if (!outParsed || !prefParsed) return false
  return (
    outParsed.area === prefParsed.area &&
    outParsed.district === prefParsed.district &&
    (prefParsed.subdistrict === "" || outParsed.subdistrict === prefParsed.subdistrict)
  )
}

/**
 * Resolves the zone category of a postcode outwards.
 */
export async function getPostcodeZone(postcode: string): Promise<'FREE_CALL_OUT' | 'STANDARD_999' | 'LONDON_FLEX' | null> {
  if (!postcode) return null
  const clean = postcode.toUpperCase().replace(/\s+/g, '')
  if (clean.length < 3) return null
  
  let outward = clean
  if (clean.length >= 5) {
    outward = clean.slice(0, clean.length - 3)
  }

  const outwardUpper = outward.toUpperCase()

  try {
    const boroughs = await prisma.coverageBorough.findMany({
      where: { isActive: true },
      select: { zone: true, postcodes: true }
    })

    if (boroughs.length > 0) {
      for (const b of boroughs) {
        const matched = b.postcodes.split(',').some(pc => {
          const cleanPrefix = pc.trim().toUpperCase()
          return cleanPrefix && matchPostcodeOutward(outwardUpper, cleanPrefix)
        })
        if (matched) {
          return b.zone as 'FREE_CALL_OUT' | 'STANDARD_999' | 'LONDON_FLEX'
        }
      }
    }
  } catch (error) {
    console.error('Database postcode zone check error:', error)
  }

  // Fallback static zoning
  const zone4Prefixes = ['EN4', 'EN5', 'N2', 'N3', 'N20', 'N11', 'EN6', 'WD6', 'HA8']
  if (zone4Prefixes.some(p => matchPostcodeOutward(outwardUpper, p))) {
    return 'FREE_CALL_OUT'
  }
  const zone3Prefixes = [
    'WD17', 'WD18', 'WD19', 'WD24', 'WD25',
    'EN1', 'EN2', 'EN3', 'N14', 'N21',
    'HA1', 'HA2', 'HA3', 'HA5', 'HA0', 'HA9',
    'NW1', 'NW3', 'NW5', 'N1', 'N5', 'N7'
  ]
  if (zone3Prefixes.some(p => matchPostcodeOutward(outwardUpper, p))) {
    return 'STANDARD_999'
  }

  const zone2Prefixes = [
    'SW1', 'W1', 'W2', 'WC2', 'EC1', 'EC2', 'EC3', 'EC4',
    'E1', 'E2', 'E8', 'E9', 'E15', 'E20', 'W3', 'W5', 'W13',
    'UB1', 'UB2', 'TW9', 'TW10', 'CR0', 'CR2', 'CR7', 'SE3', 'SE10', 'SE18'
  ]
  if (zone2Prefixes.some(p => matchPostcodeOutward(outwardUpper, p))) {
    return 'LONDON_FLEX'
  }

  return null
}

/**
 * Checks if a UK postcode outward code is within our active standard operating zone.
 */
export async function isPostcodeInOperatingArea(postcode: string): Promise<boolean> {
  const zone = await getPostcodeZone(postcode)
  return zone === 'FREE_CALL_OUT' || zone === 'STANDARD_999'
}
