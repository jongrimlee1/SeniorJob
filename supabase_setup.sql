-- =============================================
-- SeniorJob — Supabase 테이블 초기 설정
-- Supabase > SQL Editor 에서 실행하세요
-- =============================================

-- 1. 민간 구인 공고
create table if not exists jobs (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  company     text not null,
  logo        text,
  task        text not null,
  category    text default '기타',
  pay         integer not null,
  hours       numeric not null,
  time_slot   text,
  date_label  text default '오늘',
  address     text,
  urgent      boolean default false,
  description text,
  color       text default '#2D6A4F',
  status      text default '구인중'   -- 구인중 | 마감
);

-- 2. 시니어 지원 내역
create table if not exists applications (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  job_id       uuid references jobs(id) on delete cascade,
  senior_name  text default '김영자',
  senior_age   integer default 67,
  senior_region text default '해운대구',
  status       text default '검토중'  -- 검토중 | 수락 | 거절
);

-- =============================================
-- RLS: 인증 전까지 전체 공개 허용 (개발 단계)
-- =============================================
alter table jobs         enable row level security;
alter table applications enable row level security;

create policy "jobs_public_read"   on jobs         for select using (true);
create policy "jobs_public_insert" on jobs         for insert with check (true);
create policy "jobs_public_update" on jobs         for update using (true);

create policy "apps_public_read"   on applications for select using (true);
create policy "apps_public_insert" on applications for insert with check (true);
create policy "apps_public_update" on applications for update using (true);

-- =============================================
-- 샘플 데이터 (선택 — 필요 시 실행)
-- =============================================
insert into jobs (company, logo, task, category, pay, hours, time_slot, date_label, address, urgent, description, color)
values
  ('이마트 해운대점', '이마', '매장 상품 진열 및 정리', '매장',  45000, 3, '오전 9:00 ~ 12:00', '오늘', '부산시 해운대구', true,  '진열 보조 및 재고 정리. 무거운 물건 없어요.', '#2D6A4F'),
  ('CU 부산진점',    'CU',  '재고 정리 및 유통기한 확인', '편의점', 30000, 2, '오후 2:00 ~ 4:00',  '오늘', '부산시 부산진구', false, '편의점 재고 점검 및 진열 보조. 실내 작업.',   '#2563EB'),
  ('스타벅스 센텀점', '스벅', '홀 청소 및 테이블 정리', '음식점', 32000, 2, '오후 1:00 ~ 3:00',  '내일', '부산시 해운대구 센텀', false, '홀 테이블 정리 및 청소.', '#2D6A4F');
