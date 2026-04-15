import { useState, useEffect } from 'react'

// 최신 데이터셋 (2024-05-28 기준)
const ENDPOINT = '/odcloud/api/15050148/v1/uddi:5a9fe759-5344-41ef-94c1-9de71e3e156f'
const SERVICE_KEY = import.meta.env.VITE_ODCLOUD_KEY

// API 응답 필드 → 카드 데이터 변환
function transform(item) {
  const start = item['사업기간시작일'] ?? ''
  const end   = item['사업기간종료일'] ?? ''
  const period = start && end
    ? `${start.slice(0, 7).replace('-', '.')} ~ ${end.slice(0, 7).replace('-', '.')}`
    : '기간 미정'

  const typeMap = {
    '공익활동': '공공형',
    '사회서비스형': '사회서비스형',
    '시장형': '시장형',
    '인력파견형': '인력파견형',
    '취업알선형': '취업알선형',
  }

  const rawType = item['사업유형'] ?? ''
  const type = typeMap[rawType] || rawType || '기타'

  const colorMap = {
    '공공형':       '#15803D',
    '시장형':       '#1D4ED8',
    '사회서비스형': '#9333EA',
    '인력파견형':   '#B45309',
    '취업알선형':   '#0E7490',
    '기타':         '#374151',
  }

  return {
    id:           item['사업번호'] ?? Math.random().toString(36).slice(2),
    programName:  item['사업명'] ?? '사업명 미상',
    executingOrg: item['수행기관명'] ?? item['관할시군구'] ?? '',
    agencyName:   '한국노인인력개발원',
    type,
    color:        colorMap[type] ?? '#374151',
    period,
    region:       item['관할시군구'] ?? '지역 미상',
    address:      item['관할시군구'] ?? '',
    targetAge:    '60세 이상',
    slots:        Number(item['목표일자리수']) || 0,
    remaining:    null, // API 미제공 — '문의' 표시
    pay:          null, // API 미제공
    hours:        null,
    desc:         item['사업유형'] ? `${item['사업유형']} 사업` : '',
  }
}

export function usePublicJobs() {
  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const url = `${ENDPOINT}?serviceKey=${encodeURIComponent(SERVICE_KEY)}&page=1&perPage=30&returnType=JSON`

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`API 오류: ${res.status}`)
        return res.json()
      })
      .then(json => {
        if (cancelled) return
        const items = json.data ?? []
        setJobs(items.map(transform))
      })
      .catch(err => {
        if (cancelled) return
        setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return { jobs, loading, error }
}
