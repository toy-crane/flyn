-- 스토리 표지 그림이 사는 버킷.
--
-- 아바타 버킷과 같은 이유로 손으로 쓴다. `supabase/schemas/`는 `public` 스키마를
-- 설명하고, 선언형 diff는 준 스키마만 보고하므로 버킷 행도 `storage.objects`의
-- 정책도 diff에 나타나지 않는다. 이 파일이 표지 버킷 접근 제어의 전부다.
--
-- 읽기는 공개다. 표지는 로그인 화면 바깥에서도 보일 수 있는 공식 콘텐츠이고,
-- 공개 경로로 내보내면 렌더마다 서명 URL을 새로 받지 않고 평범한 이미지처럼
-- 불러온다. 버킷 안에 사적인 것은 없다.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'story-covers',
  'story-covers',
  true,
  -- 표지 한 장은 목록의 72pt 타일에 들어간다. 이 한도는 작업이 아니라 실수를
  -- 막는 천장이다.
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- 정책을 하나도 만들지 않는다. 그것이 이 버킷의 접근 제어다.
--
-- 공개 버킷은 `/object/public/...`을 RLS를 거치지 않고 내보내므로 읽기에는
-- 정책이 필요 없다. 쓰기는 여전히 RLS를 지나는데, 표지를 올리는 것은 콘텐츠
-- 제작이지 앱의 동작이 아니다. `authenticated`에게 쓰기 정책을 주지 않으면
-- 로그인한 어떤 클라이언트도 이 버킷에 파일을 넣거나 지울 수 없고, 콘텐츠를
-- 싣는 쪽만 `service_role`로 쓴다.
