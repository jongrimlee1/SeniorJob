import { useState, useEffect } from 'react'
import { haversine, formatDistance } from './useLocation.js'
import { lookupRegionCoords } from '../data/districtCoords.js'

const ENDPOINT = '/odcloud/api/15050148/v1/uddi:5a9fe759-5344-41ef-94c1-9de71e3e156f'
const SERVICE_KEY = import.meta.env.VITE_ODCLOUD_KEY

const TYPE_COLOR = {
  '공공형':       '#15803D',
  '시장형':       '#1D4ED8',
  '사회서비스형': '#9333EA',
  '인력파견형':   '#B45309',
  '취업알선형':   '#0E7490',
  '기타':         '#374151',
}

function transform(item) {
  const start = item['사업기간시작일'] ?? ''
  const end   = item['사업기간종료일'] ?? ''
  const period = (start && end)
    ? `${start.slice(0, 7).replace('-', '.')} ~ ${end.slice(0, 7).replace('-', '.')}`
    : '기간 미정'

  const typeAlias = {
    '공익활동': '공공형',
    '사회서비스형': '사회서비스형',
    '시장형': '시장형',
    '인력파견형': '인력파견형',
    '취업알선형': '취업알선형',
  }
  const rawType = item['사업유형'] ?? ''
  const type    = typeAlias[rawType] || rawType || '기타'
  const region  = item['관할시군구'] ?? ''

  return {
    id:           item['사업번호'] ?? Math.random().toString(36).slice(2),
    programName:  item['사업명'] ?? '사업명 미상',
    executingOrg: item['수행기관명'] ?? '',
    agencyName:   '한국노인인력개발원',
    type,
    color:        TYPE_COLOR[type] ?? '#374151',
    period,
    region,
    targetAge:    '60세 이상',
    slots:        Number(item['목표일자리수']) || 0,
    remaining:    null,
    pay:          null,
    hours:        null,
    contact:      item['연락처'] ?? item['담당자연락처'] ?? null,
    year:         item['사업년도'] ?? '',
    _km:          null,
    distance:     null,
  }
}

// 좌표 기반 거리 계산 + 정렬 (룩업 테이블 사용 — 즉각적)
function attachDistances(jobs, coords) {
  return jobs
    .map(j => {
      const geo = lookupRegionCoords(j.region)
      if (!geo) return j
      const km = haversine(coords.lat, coords.lng, geo.lat, geo.lng)
      return { ...j, _km: km, distance: formatDistance(km) }
    })
    .sort((a, b) => {
      if (a._km == null && b._km == null) return 0
      if (a._km == null) return 1
      if (b._km == null) return -1
      return a._km - b._km
    })
}

export function usePublicJobs(coords) {
  const [rawJobs, setRawJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  // API 페치
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const url = `${ENDPOINT}?serviceKey=${encodeURIComponent(SERVICE_KEY)}&page=1&perPage=100&returnType=JSON`

    fetch(url)
      .then(r => { if (!r.ok) throw new Error(`API ${r.status}`); return r.json() })
      .then(json => {
        if (cancelled) return
        setRawJobs((json.data ?? []).map(transform))
      })
      .catch(e => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [])

  // coords 또는 rawJobs 변경 시 거리 재계산 (룩업 테이블이라 즉각적)
  const jobs = coords && rawJobs.length > 0
    ? attachDistances(rawJobs, coords)
    : rawJobs

  return { jobs, loading, error }
}
