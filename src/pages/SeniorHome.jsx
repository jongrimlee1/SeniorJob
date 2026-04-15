import { useState } from 'react'
import { JOBS, CATEGORIES, WORK_HISTORY } from '../data/mockData.js'
import { usePublicJobs } from '../hooks/usePublicJobs.js'
import JobCard from '../components/JobCard.jsx'
import PublicJobCard from '../components/PublicJobCard.jsx'
import BottomNav from '../components/BottomNav.jsx'
import styles from './SeniorHome.module.css'

export default function SeniorHome({ nav }) {
  const [tab, setTab] = useState('home')
  const [sourceTab, setSourceTab] = useState('private') // 'public' | 'private'
  const [category, setCategory] = useState('전체')
  const [publicType, setPublicType] = useState('전체')
  const [applied, setApplied] = useState([])

  const { jobs: publicJobs, loading: pubLoading, error: pubError } = usePublicJobs()

  const PUBLIC_TYPES = ['전체', ...Array.from(new Set(publicJobs.map(j => j.type))).filter(Boolean)]

  const filtered = JOBS.filter(j => category === '전체' || j.category === category)
  const urgent = filtered.filter(j => j.urgent)
  const normal = filtered.filter(j => !j.urgent)

  const filteredPublic = publicJobs.filter(j => publicType === '전체' || j.type === publicType)

  const totalEarned = WORK_HISTORY.reduce((s, h) => s + h.pay, 0)

  return (
    <div className={styles.wrap}>
      {tab === 'home' && (
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.header}>
            <div>
              <div className={styles.greeting}>안녕하세요, 김영자 님 👋</div>
              <div className={styles.location}>📍 부산시 해운대구 근처</div>
            </div>
            <button className={styles.notifBtn}>🔔</button>
          </div>

          {/* Balance card */}
          <div className={styles.balanceCard}>
            <div className={styles.balanceLabel}>이번 달 수입</div>
            <div className={styles.balanceAmount}>94,000원</div>
            <div className={styles.balanceDetail}>3건 완료 · 오늘 출금 가능</div>
            <button className={styles.withdrawBtn}>출금하기</button>
          </div>

          {/* 소스 탭 — 공공 / 민간 */}
          <div className={styles.sourceTabRow}>
            <button
              className={`${styles.sourceTab} ${sourceTab === 'private' ? styles.sourceTabActive : ''}`}
              onClick={() => setSourceTab('private')}
            >
              🏪 민간 구인
            </button>
            <button
              className={`${styles.sourceTab} ${sourceTab === 'public' ? styles.sourceTabActive : ''}`}
              onClick={() => setSourceTab('public')}
            >
              🏛 공공 일자리
            </button>
          </div>

          {/* 민간 구인 섹션 */}
          {sourceTab === 'private' && (
            <>
              <div className={styles.catRow}>
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    className={`${styles.catBtn} ${category === c ? styles.catActive : ''}`}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {urgent.length > 0 && (
                <>
                  <div className={styles.sectionTitle}>
                    <span className={styles.urgentBadge}>🔥 급구</span> 오늘 바로 시작
                  </div>
                  {urgent.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      applied={applied.includes(job.id)}
                      onClick={() => nav('job-detail', job)}
                      onApply={(e) => {
                        e.stopPropagation()
                        setApplied(prev => [...prev, job.id])
                      }}
                    />
                  ))}
                </>
              )}

              <div className={styles.sectionTitle}>내 주변 일자리</div>
              {normal.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  applied={applied.includes(job.id)}
                  onClick={() => nav('job-detail', job)}
                  onApply={(e) => {
                    e.stopPropagation()
                    setApplied(prev => [...prev, job.id])
                  }}
                />
              ))}
            </>
          )}

          {/* 공공 일자리 섹션 */}
          {sourceTab === 'public' && (
            <>
              <div className={styles.publicNotice}>
                <span className={styles.publicNoticeIcon}>ℹ️</span>
                한국노인인력개발원 공식 사업 · 수행기관에 직접 신청
              </div>

              {pubLoading && (
                <div className={styles.loadingWrap}>
                  <div className={styles.spinner} />
                  <span>공공 일자리 불러오는 중...</span>
                </div>
              )}

              {pubError && (
                <div className={styles.errorBox}>
                  <span>⚠️ 데이터를 불러오지 못했습니다</span>
                  <span className={styles.errorSub}>{pubError}</span>
                </div>
              )}

              {!pubLoading && !pubError && (
                <>
                  <div className={styles.catRow}>
                    {PUBLIC_TYPES.map(t => (
                      <button
                        key={t}
                        className={`${styles.catBtn} ${publicType === t ? styles.catActive : ''}`}
                        onClick={() => setPublicType(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className={styles.sectionTitle}>
                    전국 노인일자리 사업
                    <span className={styles.countBadge}>{filteredPublic.length}건</span>
                  </div>
                  {filteredPublic.map(job => (
                    <PublicJobCard
                      key={job.id}
                      job={job}
                      applied={applied.includes(job.id)}
                      onApply={() => setApplied(prev => [...prev, job.id])}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.pageTitle}>근무 이력</div>
          </div>
          <div className={styles.totalCard}>
            <div className={styles.totalLabel}>누적 수입</div>
            <div className={styles.totalAmount}>{totalEarned.toLocaleString()}원</div>
            <div className={styles.totalSub}>총 {WORK_HISTORY.length}건 완료</div>
          </div>
          {WORK_HISTORY.map(h => (
            <div key={h.id} className={styles.historyCard}>
              <div className={styles.hLeft}>
                <div className={styles.hCompany}>{h.company}</div>
                <div className={styles.hTask}>{h.task} · {h.date}</div>
                <div className={styles.hStars}>{'★'.repeat(h.rating)}{'☆'.repeat(5 - h.rating)}</div>
              </div>
              <div className={styles.hRight}>
                <div className={styles.hPay}>{h.pay.toLocaleString()}원</div>
                <div className={styles.hStatus}>{h.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'profile' && (
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.pageTitle}>내 프로필</div>
          </div>
          <div className={styles.profileCard}>
            <div className={styles.avatar}>영</div>
            <div className={styles.profileName}>김영자 님</div>
            <div className={styles.profileInfo}>67세 · 부산 해운대구</div>
            <div className={styles.ratingRow}>
              <span className={styles.ratingNum}>4.9</span>
              <span className={styles.ratingStars}>★★★★★</span>
              <span className={styles.ratingCount}>23건 완료</span>
            </div>
          </div>
          <div className={styles.profileSection}>
            <div className={styles.profileSectionTitle}>선호 근무 조건</div>
            <div className={styles.tagRow}>
              <span className={styles.tag}>오전 선호</span>
              <span className={styles.tag}>3시간 이내</span>
              <span className={styles.tag}>실내 작업</span>
              <span className={styles.tag}>해운대구</span>
            </div>
          </div>
          <div className={styles.profileSection}>
            <div className={styles.profileSectionTitle}>뱃지</div>
            <div className={styles.tagRow}>
              <span className={`${styles.tag} ${styles.tagGold}`}>⭐ 성실왕</span>
              <span className={`${styles.tag} ${styles.tagGreen}`}>✓ 본인 인증</span>
            </div>
          </div>
        </div>
      )}

      <BottomNav tab={tab} setTab={setTab} mode="senior" />
    </div>
  )
}
