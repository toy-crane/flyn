-- 만든 스토리의 표지를 누가 넣을 수 있는지.
--
-- 아바타 버킷과 같은 이유로 손으로 쓴다. 선언형 diff는 `public` 스키마만 보므로
-- `storage.objects`의 정책은 diff에 나타나지 않는다.
--
-- 표지 버킷을 만들 때는 쓰기 정책을 하나도 두지 않았다. 그때 표지는 콘텐츠를
-- 싣는 쪽만 넣었기 때문이다. 이제 사용자가 만든 스토리에도 표지가 붙고, 그
-- 표지는 사용자의 요청을 받아 서버가 그 사람의 권한으로 넣는다. 서버는 secret
-- key를 들고 있지 않다. RLS가 그대로 판정하는 것이 이 구조의 요지이므로,
-- 넣을 수 있는 자리를 정책으로 좁힌다.
--
-- 좁히는 방법은 경로다. `made/<사용자 id>/<내용 해시>.png` 한 단계만 허용한다.
-- 공식 표지는 버킷 뿌리에 있으므로 이 정책으로는 닿지 않고, 남의 폴더에도
-- 닿지 않는다. 폴더 깊이를 한 단계로 묶어 두면 나중에 계정을 지울 때 폴더
-- 하나만 훑으면 된다.
--
-- `(select auth.uid())`로 감싸는 것은 줄마다가 아니라 문장마다 한 번 값을
-- 읽기 위해서다.
--
-- 아바타와 같은 울타리를 함께 본다. `account_deletion_started_at`은 계정 삭제가
-- 파일을 지우기 전에 올리는 표시다. `for share` 잠금이 이미 지나간 쓰기를
-- 기다리게 하고, 그 뒤에 오는 쓰기는 거절한다. 이것이 없으면 삭제가 끝난 뒤에도
-- 살아 있는 토큰이 표지를 다시 만들어 주인 없는 파일을 남긴다.
create policy story_covers_insert_own_made on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'story-covers'
    and storage.foldername(name) = array['made', (select auth.uid())::text]
    and exists (
      select 1
      from public.profiles
      where public.profiles.id = (select auth.uid())
        and public.profiles.account_deletion_started_at is null
      for share
    )
  );

-- 넣기만 연다. 바꾸기와 지우기는 열지 않는다.
--
-- 파일 이름이 내용의 해시라 같은 그림은 같은 이름이고, 다른 그림은 다른
-- 이름이다. 이미 있는 파일을 바꿀 일이 없다. 지우기를 열면 남의 스토리가
-- 가리키는 파일까지 없앨 수 있다. 두 이름이 같은 그림을 가리키는 일이 실제로
-- 일어나기 때문이다.
