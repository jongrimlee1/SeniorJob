import styles from './PublicJobCard.module.css'

const TYPE_COLORS = {
  '공공형':       '#15803D',
  '시장형':       '#1D4ED8',
  '사회서비스형': '#9333EA',
  '인력파견형':   '#B45309',
  '취업알선형':   '#0E7490',
}

export default function PublicJobCard({ job, onApply, applied }) {
  const typeColor = job.color || TYPE_COLORS[job.type] || '#374151'

  return (
    <div className={styles.card}>
      {/* 상단: 정부 배지 + 사업유형 */}
      <div className={styles.top}>
        <div className={styles.govBadge}>
          <span className={styles.govIcon}>🏛</span>
          <span>공공일자리</span>
        </div>
        <span
          className={styles.typePill}
          style={{ background: typeColor + '18', color: typeColor, borderColor: typeColor + '40' }}
        >
          {job.type}
        </span>
      </div>

      {/* 사업명 + 수행기관 */}
      <div className={styles.title}>{job.programName}</div>
      {job.executingOrg ? (
        <div className={styles.org}>{job.executingOrg} · {job.agencyName}</div>
      ) : (
        <div className={styles.org}>{job.agencyName}</div>
      )}

      {/* 정보 그리드 */}
      <div className={styles.infoGrid}>
        {job.pay != null ? (
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>💰</span>
            <span className={styles.infoVal}>{job.pay.toLocaleString()}원</span>
            {job.hours && <span className={styles.infoSub}>/{job.hours}시간</span>}
          </div>
        ) : (
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>💰</span>
            <span className={styles.infoVal}>활동비 문의</span>
          </div>
        )}
        <div className={styles.infoItem}>
          <span className={styles.infoIcon}>📍</span>
          <span className={styles.infoVal}>{job.region}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoIcon}>📅</span>
          <span className={styles.infoVal}>{job.period}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoIcon}>👤</span>
          <span className={styles.infoVal}>{job.targetAge}</span>
        </div>
      </div>

      {/* 모집 현황 + 신청 버튼 */}
      <div className={styles.bottom}>
        <div className={styles.slotsWrap}>
          {job.remaining != null ? (
            <>
              <div className={styles.slotsBar}>
                <div
                  className={styles.slotsFill}
                  style={{
                    width: job.slots > 0
                      ? `${((job.slots - job.remaining) / job.slots) * 100}%`
                      : '0%',
                    background: typeColor,
                  }}
                />
              </div>
              <span className={styles.slotsText}>
                잔여 <strong>{job.remaining}</strong>/{job.slots}명
              </span>
            </>
          ) : (
            <span className={styles.slotsText}>
              목표 <strong>{job.slots > 0 ? job.slots.toLocaleString() : '-'}</strong>명 · 수행기관 문의
            </span>
          )}
        </div>
        <button
          className={`${styles.applyBtn} ${applied ? styles.applied : ''}`}
          onClick={onApply}
          disabled={applied || job.remaining === 0}
        >
          {applied ? '관심 등록됨' : '관심 등록'}
        </button>
      </div>
    </div>
  )
}
