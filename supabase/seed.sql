-- Loaded after migrations on every `bun run db:reset`, which starts from an
-- empty database. Keep it free of environment-specific ids and secrets.
--
-- `public.profiles` is intentionally not seeded. A profile belongs to a row in
-- `auth.users`, and the trigger creates it during signup. Writing rows here
-- would mean inserting fake users into `auth.users` by hand, which skips the
-- real signup path this project verifies. Sign in through the app or the local
-- OTP flow instead: see README.md "로컬 이메일 로그인 확인".
--
-- Add inserts here for tables that carry no user data, such as reference or
-- lookup rows.

-- 공식 스토리 다섯 편. `position`이 스토리 탭의 순서이고, `cover_image_path`는
-- `story-covers` 버킷 안의 파일 이름이다. 그 파일들은 `supabase/story-covers/`에
-- 있고 로컬 스택이 시작할 때 버킷으로 올라간다.
insert into public.stories (
  id,
  position,
  slug,
  title,
  hook,
  intro,
  cover_emoji,
  cover_image_path,
  target_language,
  completion_title,
  completion_copy
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    1,
    'mia-cafe',
    $content$우리 동네 카페$content$,
    $content$늘 가던 동네 카페인데, 오늘은 커피부터 잘못 나왔어요$content$,
    $content$매일 들르는 동네 카페에서 벌어지는 다섯 번의 사건. 바리스타 Mia와 조금씩 가까워져요.$content$,
    $content$☕$content$,
    'mia-cafe.png',
    'en',
    $content$첫 이야기를 끝냈어요$content$,
    $content$잘못 나온 커피 한 잔에서 Mia의 새 출발까지, 다섯 번의 사건을 영어로 지나왔어요.$content$
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    2,
    'business-trip',
    $content$출장 일주일$content$,
    $content$첫 해외 출장인데, 호텔에 제 예약이 없대요$content$,
    $content$첫 해외 출장으로 떠난 낯선 도시에서 보내는 일주일. 호텔 직원 Anna, 현지 동료 Daniel과 함께 어긋난 계획을 하나씩 바로잡아요.$content$,
    $content$✈️$content$,
    'business-trip.png',
    'en',
    $content$일주일의 출장을 끝냈어요$content$,
    $content$계획이 어긋난 일주일을 영어로 지나왔어요.$content$
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    3,
    'roommate-month',
    $content$룸메이트 구함$content$,
    $content$이사 온 다음 날인데, 냉장고 제 칸이 룸메이트 짐으로 가득해요$content$,
    $content$룸메이트 Jamie와 함께 사는 첫 한 달 동안 벌어지는 다섯 번의 사건. 냉장고 칸부터 우리 집 규칙까지, 서로 다른 기준을 하나씩 맞춰 가요.$content$,
    $content$🏠$content$,
    'roommate-month.png',
    'en',
    $content$한 달을 함께 살았어요$content$,
    $content$냉장고 칸부터 우리 집 규칙까지, 다섯 번의 대화를 영어로 지나왔어요.$content$
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    4,
    'first-week-office',
    $content$첫 주의 사무실$content$,
    $content$첫 출근인데, 다들 제가 맡았다는 일을 저만 몰라요$content$,
    $content$영어로 일하는 회사에서 보내는 첫 일주일. 옆자리 동료 Dan, 팀장 Grace와 다섯 번의 고비를 넘어요.$content$,
    $content$🏢$content$,
    'first-week-office.png',
    'en',
    $content$첫 일주일을 마쳤어요$content$,
    $content$월요일의 첫 질문부터 금요일의 제안까지 영어로 지나왔어요.$content$
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    5,
    'upstairs-neighbor',
    $content$윗집 사람$content$,
    $content$이사 온 지 일주일, 윗집 소리에 오늘도 잠을 설쳤어요$content$,
    $content$새로 이사 온 건물에서 벌어지는 다섯 번의 곤란. 윗집의 Nora, 관리인 Frank와 조금씩 아는 사이가 돼요.$content$,
    $content$🌙$content$,
    'upstairs-neighbor.png',
    'en',
    $content$이웃이 생겼어요$content$,
    $content$다섯 번의 곤란을 지나 윗집 사람과 아는 사이가 됐어요.$content$
  )
on conflict (id) do update
set position = excluded.position,
    slug = excluded.slug,
    title = excluded.title,
    hook = excluded.hook,
    intro = excluded.intro,
    cover_emoji = excluded.cover_emoji,
    cover_image_path = excluded.cover_image_path,
    target_language = excluded.target_language,
    completion_title = excluded.completion_title,
    completion_copy = excluded.completion_copy;

-- 각 스토리의 다섯 화. 사람이 쓴 무대이고, 그 뒤의 대사와 전개는 모델이 쓴다.
-- 근거는 docs/decisions/episode-authoring.md가 소유한다.
insert into public.episodes (
  id,
  story_id,
  number,
  title,
  preview,
  situation,
  situation_emoji,
  opening,
  stage,
  cast_names,
  ending_success,
  ending_compromise,
  ending_failure
)
values
(
  '11000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  1,
  $content$잘못 나온 첫 잔$content$,
  $content$주문과 다른 커피가 나왔는데, 직원은 벌써 다음 손님을 부르고 있어요.$content$,
  $content$잘못 나온 커피를 원하는 커피로 바꿔 보세요$content$,
  $content$☕$content$,
  $content$늘 오던 동네 카페, 계산대 앞이다. 아이스 아메리카노를 시켰는데, 받아 든 잔은 뜨겁고 위에는 우유 거품이 얹혀 있다.
Mia: Next in line, please!
명찰에 Mia라고 적힌 직원은 벌써 다음 손님 쪽을 보고 있다. 뒤로 줄이 길다.
잔을 쥔 손바닥이 점점 뜨거워진다.$content$,
  $content$상황:
- 붐비는 동네 카페의 계산대 앞이다. 사용자는 아이스 아메리카노를 주문했는데 뜨거운 라떼를 받았다.
- Mia는 잘못 나온 것을 모른 채 다음 손님을 부르고 있고, 뒤에는 줄이 서 있다.
- 사용자가 말을 걸어야 이 일이 풀린다. 짧게 한마디만 해도 Mia는 알아듣고 반응한다.
- 주문 내역은 영수증으로 바로 확인할 수 있어서, 누가 틀렸는지는 다툼거리가 아니다.

등장인물은 Mia 한 명뿐이다. 새 인물을 만들지 않는다. 다른 손님과 주변 상황은 지문으로 전한다.
- Mia: 20대 후반의 바리스타. 바쁘고 말이 빠르지만 나쁜 사람은 아니다. 쉬운 단어로 짧게 말하고, 잘못이 확인되면 사과하며 바로 다시 만들어 준다. 애매하게 말하면 무엇이 필요한지 되묻는다.$content$,
  array[$content$Mia$content$],
  $content$주문한 아이스 아메리카노를 다시 받아냈을 때$content$,
  $content$다른 음료나 보상으로 만족하고 정리했을 때$content$,
  $content$잘못 나온 커피를 그대로 든 채 물러났을 때$content$
),
(
  '11000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000001',
  2,
  $content$계산이 꼬인 아침$content$,
  $content$다음 날 아침, 카드가 자꾸 튕기는데 뒤에 선 남자의 한숨 소리가 점점 커져요.$content$,
  $content$다른 방법을 찾아 계산을 끝내 보세요$content$,
  $content$💳$content$,
  $content$다음 날 아침, 같은 카페다. 아이스 아메리카노를 시키고 카드를 댔는데, 단말기가 짧은 오류음을 낸다.
Mia: Hmm, it says declined. Do you want to try again?
한 번 더 대도 같은 소리가 난다. 지갑 속 현금은 눈으로 봐도 조금 모자란다.
Owen: Sorry, I have a meeting in ten minutes. Is this going to take long?$content$,
  $content$상황:
- 다음 날 아침, 붐비는 카페 계산대다. 사용자는 아이스 아메리카노를 주문했고 결제만 남았다.
- 카드가 계속 거절된다. 카드 쪽 문제라서 몇 번을 다시 대도 되지 않는다.
- 사용자가 가진 현금은 음료값에 조금 모자란다. 이 카페는 폰 결제와 기프트 카드도 받는다.
- Mia는 방법을 같이 찾아 주려 하지만 외상은 규정상 해 줄 수 없다.
- 바로 뒤에 선 Owen은 회의에 늦어 마음이 급하다. 사용자가 다른 방법을 말해야 이 일이 풀린다.

등장인물은 Mia와 Owen 두 명뿐이다. 새 인물을 만들지 않는다. 다른 손님과 주변 상황은 지문으로 전한다.
- Mia: 20대 후반의 바리스타. 어제 사용자의 주문을 처리한 그 직원이다. 바쁘지만 손님이 곤란해하면 방법을 같이 찾는다. 규정을 어기지는 못한다.
- Owen: 30대 초반의 회사원. 아침 회의에 늦어 재촉하지만, 사용자가 정중하게 사정을 말하면 대신 계산해 주겠다고 나설 수도 있다.$content$,
  array[$content$Mia$content$, $content$Owen$content$],
  $content$사용자가 스스로 다른 결제 방법을 찾아 주문한 음료를 받았을 때$content$,
  $content$음료를 바꾸거나 남의 도움을 받아 겨우 계산을 정리했을 때$content$,
  $content$계산하지 못하고 음료를 받지 못한 채 물러났을 때$content$
),
(
  '11000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000001',
  3,
  $content$창가 자리의 남자$content$,
  $content$잠깐 자리를 비운 사이, 창가 자리에 어제 아침의 그 남자가 앉아 있어요.$content$,
  $content$맡아 둔 자리를 되찾아 보세요$content$,
  $content$🪑$content$,
  $content$오후의 카페다. 전화를 받느라 오 분쯤 나갔다 온 사이, 늘 앉던 창가 자리에 누가 앉아 노트북을 펴고 있다. 가방은 옆 테이블로 옮겨져 있다.
어제 아침 계산대 뒤에서 한숨을 쉬던 그 남자다.
Owen: Oh, is this your bag? Sorry, the table looked empty.
카운터에 있던 Mia가 이쪽을 보다가 눈이 마주친다.$content$,
  $content$상황:
- 오후의 카페다. 사용자는 창가 자리에 가방을 두고 전화를 받으러 잠깐 나갔다 왔다.
- 돌아와 보니 Owen이 그 자리에 앉아 있고, 사용자의 가방은 옆 테이블로 옮겨져 있다.
- Owen은 어제 아침 계산대 뒤에서 재촉하던 그 손님이다. 자리를 뺏을 생각은 없었지만 이미 짐을 펼쳤고, 삼십 분 뒤 화상 회의가 있어 콘센트가 있는 이 자리가 필요하다.
- Mia는 사용자를 단골로 알아본다. 부탁을 받으면 콘센트가 있는 다른 자리를 찾아봐 주지만, 손님끼리의 일에 먼저 끼어들지는 않는다.
- 사용자가 말을 걸어야 자리 문제가 정리된다.

등장인물은 Mia와 Owen 두 명뿐이다. 새 인물을 만들지 않는다. 다른 손님과 주변 상황은 지문으로 전한다.
- Mia: 20대 후반의 바리스타. 사용자를 알아보고 반가워한다. 부탁받으면 자리를 같이 찾아 주지만 누가 앉을지를 대신 정해 주지는 않는다.
- Owen: 30대 초반의 회사원. 예의는 있지만 그냥 물러서지 않는다. 어제 아침의 일을 기억하고 있어서, 사용자가 사정을 구체적으로 말하면 조정할 여지가 있다.$content$,
  array[$content$Mia$content$, $content$Owen$content$],
  $content$맡아 뒀던 자리를 돌려받았을 때$content$,
  $content$다른 자리나 나눠 앉는 것으로 정리됐을 때$content$,
  $content$자리를 잃고 아무것도 정리하지 못한 채 물러났을 때$content$
),
(
  '11000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000001',
  4,
  $content$이름 없는 신메뉴$content$,
  $content$Mia가 메뉴판에 없는 음료를 내밀며 솔직한 감상을 부탁해요.$content$,
  $content$맛에 대한 생각을 솔직하게 전해 보세요$content$,
  $content$🥤$content$,
  $content$한산한 오후, 카운터에 서자 Mia가 처음 보는 분홍빛 음료를 잔에 담아 내민다. 메뉴판 어디에도 없는 것이다.
Mia: Try this. I made it myself. The manager tastes it on Friday, so be honest, okay?
한 모금 마셔 본다. 자몽 향은 좋은데 뒷맛이 꽤 쓰고, 단맛이 따로 논다.
Mia가 앞치마에 손을 닦으며 대답을 기다린다.$content$,
  $content$상황:
- 한산한 오후의 카페 카운터다. Mia가 직접 만든 시제품 음료를 사용자에게 시음시킨다.
- 이 음료는 자몽 향은 좋지만 뒷맛이 쓰고 단맛이 겉돈다. 사용자는 이미 한 모금 마셨다.
- Mia는 금요일에 이 음료를 매니저에게 보여 준다. 통과하면 정식 메뉴가 된다. 솔직한 말을 듣고 싶어 하면서도 자기가 만든 것이라 조심스럽다.
- 음료에는 아직 이름이 없다. 대화가 잘 풀리면 Mia는 이름 후보를 같이 고민해 달라고 부탁할 수 있다.
- 사용자가 무엇을 어떻게 말하느냐에 따라 Mia가 얻어 가는 것이 달라진다.

등장인물은 Mia 한 명뿐이다. 새 인물을 만들지 않는다. 다른 손님과 주변 상황은 지문으로 전한다.
- Mia: 20대 후반의 바리스타. 사용자를 단골로 안다. 칭찬만 들으면 실망하고, 근거 없이 깎아내리면 방어적으로 변한다. 무엇이 어떻게 아쉬운지 짚어 주는 말에는 고마워한다.$content$,
  array[$content$Mia$content$],
  $content$솔직한 감상이 구체적으로 전해져 Mia가 고칠 지점을 얻었을 때$content$,
  $content$좋은 말만 하거나 두루뭉술하게 넘겨 Mia가 얻은 것이 없을 때$content$,
  $content$말이 상처가 되거나 대화를 피해 Mia가 마음을 닫았을 때$content$
),
(
  '11000000-0000-4000-8000-000000000005',
  '10000000-0000-4000-8000-000000000001',
  5,
  $content$마지막 잔$content$,
  $content$Mia의 음료가 정식 메뉴가 된 날, Mia는 오늘이 마지막 근무라며 짐을 싸고 있어요.$content$,
  $content$문 닫기 전에 하고 싶은 말을 건네 보세요$content$,
  $content$👋$content$,
  $content$저녁 여덟 시, 문 닫기 직전의 카페다. 메뉴판 맨 위에 새 음료 한 줄이 붙어 있고, 카운터 옆 종이 상자 위에는 앞치마가 개어져 있다.
Mia: Oh, you came. Today is my last shift. They asked me to run the new branch across town.
Mia가 묻지도 않고 잔에 얼음을 채우기 시작한다.
Mia: Iced americano, right? I got it wrong the first time we met.
문 닫기까지 십 분 남았다.$content$,
  $content$상황:
- 문 닫기 십 분 전의 카페다. 오늘이 이 가게에서 Mia의 마지막 근무다. Mia는 다음 주부터 건너편 동네의 새 지점을 맡는다.
- 지난주 시음했던 Mia의 음료는 매니저를 통과해 정식 메뉴가 됐고, 그 일이 이번 발령의 계기가 됐다.
- 사용자는 방금 이 사실을 알았다. 지금 말하지 않으면 기회가 없다.
- Mia는 마감 정리를 하면서도 대화를 이어 갈 여유가 있다. 다만 십 분이 지나면 인사하고 나가야 한다.
- 사용자가 무엇을 말하느냐에 따라 이 관계가 어떻게 끝나는지 달라진다.

등장인물은 Mia 한 명뿐이다. 새 인물을 만들지 않는다. 다른 손님과 주변 상황은 지문으로 전한다.
- Mia: 20대 후반의 바리스타. 잘못 나온 커피부터 신메뉴 시음까지, 그동안의 일로 사용자를 손님 이상으로 여긴다. 담담한 척하지만 인사를 받으면 반가워하고, 새 지점에 놀러 오라는 말을 먼저 꺼내지는 못한다.$content$,
  array[$content$Mia$content$],
  $content$하고 싶은 말을 전하고 다시 만날 약속까지 이어졌을 때$content$,
  $content$짧은 인사만 주고받고 헤어졌을 때$content$,
  $content$하고 싶은 말을 전하지 못한 채 Mia가 나갔을 때$content$
)
,
(
  '12000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  1,
  $content$체크인이 막힌 밤$content$,
  $content$예약 확인 메일은 분명히 있는데, 프런트에서는 이름이 없다고 해요.$content$,
  $content$예약 확인 메일로 오늘 밤 묵을 방을 받아 보세요$content$,
  $content$🏨$content$,
  $content$밤 열 시, 낯선 도시의 호텔 프런트다. 긴 비행을 마치고 캐리어를 끌고 와 이름을 말했다.
Anna: Hmm, that's strange. I can't find your name in our system.
휴대폰 화면에는 예약 확인 메일이 떠 있다. 예약 번호까지 또렷하다.
Anna: Could you show me anything that has your booking details?$content$,
  $content$상황:
- 밤 열 시의 호텔 프런트다. 사용자는 긴 비행 끝에 막 도착했고, 내일 아침부터 일정이 있다.
- 사용자의 휴대폰에는 예약 확인 메일과 예약 번호가 있다. 그런데 호텔 시스템에는 이름이 없다.
- 원인은 예약 사이트가 성과 이름을 바꿔 넘긴 것이다. 예약 번호를 말하거나 철자를 하나씩 맞추면 찾을 수 있다.
- Anna는 규정 밖의 일은 못 하지만, 단서를 받으면 끝까지 찾아본다. 오늘 밤 남는 방도 몇 개 있다.
- 사용자가 예약을 증명하거나 다른 방법을 말해야 이 일이 풀린다.

등장인물은 Anna 한 명뿐이다. 새 인물을 만들지 않는다. 다른 투숙객과 주변 상황은 지문으로 전한다.
- Anna: 30대 초반의 프런트 직원. 차분하고 일 처리가 정확하다. 근거가 없으면 움직이지 않지만, 근거가 보이면 방법을 끝까지 찾아 준다.$content$,
  array[$content$Anna$content$],
  $content$잘못 넘어간 예약을 찾아내 원래 조건 그대로 방을 받았을 때$content$,
  $content$예약은 찾지 못했지만 다른 방이나 조건으로 오늘 밤을 해결했을 때$content$,
  $content$예약도 방도 확인하지 못한 채 사용자가 그만뒀을 때$content$
),
(
  '12000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000002',
  2,
  $content$줄어든 발표 시간$content$,
  $content$회의 날 아침이에요. 한 시간짜리 발표가 갑자기 십 분으로 줄었대요.$content$,
  $content$줄어든 십 분에 무엇을 보여 줄지 Daniel과 정해 보세요$content$,
  $content$📊$content$,
  $content$다음 날 아침, 현지 사무소의 회의실 앞이다. 일주일을 준비한 발표 자료가 노트북에 들어 있다.
Daniel: There you are. Bad news. The director has to leave early today, so your hour is now ten minutes.
노트북 가방이 갑자기 무겁게 느껴진다. 회의 시작까지 이십 분 남았다.
Daniel: So, what do you want to do? Ten minutes goes fast.$content$,
  $content$상황:
- 출장 이틀째 아침, 현지 사무소다. 사용자는 한 시간짜리 발표를 준비해 왔다.
- 디렉터의 일정이 바뀌어 발표 시간이 십 분으로 줄었다. 회의 시작까지 이십 분 남았다.
- 디렉터의 오늘 시간은 십 분이 전부다. Daniel도 그것은 바꿀 수 없다.
- Daniel은 내일 실무 팀과의 자리를 잡아 줄 수 있고, 자료를 미리 돌려 줄 수도 있다.
- 사용자가 무엇을 남기고 무엇을 미룰지 말해야 회의 준비가 끝난다.

등장인물은 Daniel 한 명뿐이다. 새 인물을 만들지 않는다. 디렉터와 다른 직원은 지문으로 전한다.
- Daniel: 30대 중반의 현지 동료. 이번 방문을 준비한 사람이라 회의가 잘되기를 바란다. 사용자가 필요한 것을 짚어 말하면 움직이고, 애매하게 말하면 무엇이 제일 중요한지 되묻는다.$content$,
  array[$content$Daniel$content$],
  $content$보여 줄 것을 추리고 이어질 자리까지 정해 회의로 들어갔을 때$content$,
  $content$일부만 정한 채 회의로 들어갔을 때$content$,
  $content$아무것도 정하지 못한 채 회의 시간이 됐거나 사용자가 그만뒀을 때$content$
),
(
  '12000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000002',
  3,
  $content$끝나지 않는 저녁$content$,
  $content$Daniel의 단골집이에요. 배는 벌써 가득한데 Daniel은 새 접시를 또 시키려고 해요.$content$,
  $content$기분 상하지 않게 이제 충분하다고 말해 보세요$content$,
  $content$🍽️$content$,
  $content$저녁, Daniel의 단골 식당이다. 테이블에는 빈 접시가 쌓였고, 방금 큰 접시가 하나 더 나왔다.
Daniel: You have to try this one too. It's the best thing they make.
배는 이미 가득 찼고, 내일 아침에는 일찍부터 일정이 있다. Daniel이 직원을 부르려고 손을 든다.
Daniel: Should I get us two more plates?$content$,
  $content$상황:
- 출장 중반의 저녁, Daniel의 단골 식당이다. Daniel이 사용자를 대접하려고 데려왔다.
- 테이블에는 이미 음식이 많고 사용자는 배가 가득 찼다. 내일 아침 일찍 일정이 있어 오래 있을 수도 없다.
- Daniel은 좋은 주인 노릇을 하고 싶어서 계속 권한다. 사용자가 분명하게 말하면 웃으며 멈추고, 애매하게 말하면 더 권한다.
- 음식을 남기는 것을 Daniel은 아쉬워하지만, 이유를 들으면 이해한다. 남은 음식은 포장할 수 있다.
- 사용자가 그만 먹고 싶다는 뜻과 일어날 때를 전해야 저녁이 정리된다.

등장인물은 Daniel 한 명뿐이다. 새 인물을 만들지 않는다. 식당 직원과 주변 상황은 지문으로 전한다.
- Daniel: 30대 중반의 현지 동료. 손님 대접에 진심이라 자꾸 더 시키려 한다. 분명한 말에는 바로 물러서고, 빈말에는 접시를 하나 더 시킨다.$content$,
  array[$content$Daniel$content$],
  $content$더 시키지 않게 멈추고 좋은 분위기로 저녁을 끝냈을 때$content$,
  $content$접시를 하나 더 받거나 예정보다 늦어졌지만 저녁을 마무리했을 때$content$,
  $content$뜻을 전하지 못해 저녁이 계속 길어졌거나 분위기가 상했을 때$content$
),
(
  '12000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000002',
  4,
  $content$오지 않는 택시$content$,
  $content$제일 중요한 회의가 있는 아침인데, 불러 둔 택시가 취소됐어요.$content$,
  $content$회의에 늦지 않을 방법을 찾아 출발해 보세요$content$,
  $content$🚕$content$,
  $content$출장 나흘째 아침, 호텔 로비다. 삼십 분 전에 불러 둔 택시가 아직 오지 않는다.
Anna: Your taxi? Let me check. Oh no, the app says the driver canceled a few minutes ago.
시내 건너편의 거래처 사무실까지 가야 한다. 회의 시작까지 사십 분 남았다.
Anna: There are a few other ways to get there. What would you like to do?$content$,
  $content$상황:
- 출장 나흘째 아침, 호텔 로비다. 사용자는 시내 건너편 거래처 사무실에서 열리는 이번 출장의 제일 중요한 회의에 가야 한다.
- 불러 둔 택시가 취소됐고, 회의 시작까지 사십 분 남았다.
- 길이 막히는 시간이다. 새 택시는 이십 분 넘게 기다려야 하고, 차로는 도착이 아슬아슬하다. 지하철은 한 번 갈아타면 삼십 분이면 도착하고, 역까지는 걸어서 오 분이다.
- Anna는 길을 알려 주고, 역 이름을 적어 주고, 필요하면 거래처에 전화를 대신 걸어 줄 수 있다. 무엇을 해 줄지는 사용자가 골라야 한다.
- 사용자가 가는 방법을 정하고 필요한 도움을 청해야 출발할 수 있다.

등장인물은 Anna 한 명뿐이다. 새 인물을 만들지 않는다. 택시 기사와 주변 상황은 지문으로 전한다.
- Anna: 30대 초반의 프런트 직원. 체크인 날의 소동 뒤로 사용자를 기억한다. 묻는 만큼 정확히 알려 주지만, 사용자 대신 결정하지는 않는다.$content$,
  array[$content$Anna$content$],
  $content$제시간에 도착할 방법을 정해 출발했을 때$content$,
  $content$조금 늦는 것을 거래처에 알리고 차선책으로 출발했을 때$content$,
  $content$방법을 정하지 못하고 로비에서 시간을 다 써 버렸을 때$content$
),
(
  '12000000-0000-4000-8000-000000000005',
  '10000000-0000-4000-8000-000000000002',
  5,
  $content$십오 분의 배웅$content$,
  $content$출장 마지막 날이에요. 비행기 시간이 당겨져서 Daniel과의 점심이 십오 분 배웅으로 줄었어요.$content$,
  $content$떠나기 전에 남은 일을 정리하고 하고 싶은 말을 전해 보세요$content$,
  $content$🧳$content$,
  $content$출장 마지막 날 아침, 캐리어를 끌고 내려온 호텔 로비다. 항공사가 비행기를 두 시간 앞당긴다는 문자가 와 있다.
Daniel과 하기로 한 점심은 취소할 수밖에 없었다. 그때 로비 문이 열리고 Daniel이 종이 가방을 들고 들어온다.
Daniel: I got your message. Forget lunch, I had to come anyway. We have about fifteen minutes, right?
프런트의 Anna가 계산서를 준비하며 이쪽을 본다. 공항 버스는 십오 분 뒤에 떠난다.$content$,
  $content$상황:
- 출장 마지막 날 아침, 호텔 로비다. 항공사가 비행기 시간을 두 시간 앞당겨서 Daniel과의 점심이 사라졌다.
- Daniel이 배웅하러 로비로 왔다. 공항 버스가 떠나기까지 십오 분 남았다.
- 일 쪽에는 정할 것이 하나 남아 있다. 이번 주에 이야기한 내용의 정리를 누가 언제 보낼지다. Daniel은 사용자가 정해 주기를 기다린다.
- Daniel은 손에 든 작은 선물을 언제 줄지 재고 있다. 사용자가 마음을 전하면 선물을 내밀고, 일 이야기만 하면 가방을 든 채 끝난다.
- Anna는 체크아웃을 처리하며 짧게 인사를 건넬 수 있다.
- 사용자가 남은 일을 정리하고 하고 싶은 말을 전해야 이 일주일이 닫힌다.

등장인물은 Daniel과 Anna 두 명뿐이다. 새 인물을 만들지 않는다. 다른 투숙객과 주변 상황은 지문으로 전한다.
- Daniel: 30대 중반의 현지 동료. 일주일 동안 사용자와 붙어 다녔다. 무뚝뚝한 척해도 이 배웅을 위해 아침 일정을 비웠다.
- Anna: 30대 초반의 프런트 직원. 체크인 날부터 사용자를 지켜봤다. 체크아웃을 처리하며 따뜻하게 인사한다.$content$,
  array[$content$Daniel$content$, $content$Anna$content$],
  $content$남은 일을 정하고 마음까지 전해 다음을 기약하며 떠났을 때$content$,
  $content$일과 인사 중 한쪽만 정리한 채 버스를 탔을 때$content$,
  $content$아무것도 정리하지 못한 채 쫓기듯 떠났을 때$content$
)
,
(
  '13000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000003',
  1,
  $content$사라진 냉장고 칸$content$,
  $content$이사 온 다음 날 아침, 냉장고를 열었는데 제 칸이 룸메이트의 짐으로 가득해요.$content$,
  $content$냉장고 칸을 나눠 쓰는 방법을 정해 보세요$content$,
  $content$🧊$content$,
  $content$이사 온 다음 날 아침이다. 장 봐 온 것을 넣으려고 냉장고를 열자, 어제 비워 두기로 한 아래 칸까지 Jamie의 소스병과 밀폐 용기가 빼곡하다.
Jamie: Morning! I did some grocery shopping last night. Just push my stuff aside if you need space.
Jamie는 소파에서 시리얼을 먹으며 대수롭지 않게 말한다. 손에 든 장바구니는 여전히 무겁다.$content$,
  $content$상황:
- 이사 온 다음 날 아침, 함께 쓰는 집의 부엌이다. 사용자 몫으로 비워 두기로 한 냉장고 칸이 Jamie의 식재료로 가득 차 있다.
- 사용자는 방금 장 봐 온 것을 들고 있고, 넣을 자리가 없다.
- Jamie는 나쁜 뜻이 없다. 빈 공간은 먼저 쓰는 사람이 쓰면 된다고 생각할 뿐이다.
- Jamie는 정리를 귀찮아하지 않는다. 기준이 정해지면 바로 옮긴다. 다만 사용자가 말하지 않으면 문제가 있는지도 모른다.
- 사용자가 원하는 것을 말해야 칸 문제가 정리된다.

등장인물은 Jamie 한 명뿐이다. 새 인물을 만들지 않는다. 집과 물건은 지문으로 전한다.
- Jamie: 20대 후반의 룸메이트. 격의 없고 잘 웃지만 정리에는 무심하다. 기준을 정하자고 하면 순순히 따르고, 애매하게 말하면 대충 넘어간다.$content$,
  array[$content$Jamie$content$],
  $content$냉장고 칸을 어떻게 나눌지 둘이 정했을 때$content$,
  $content$당장 넣을 자리만 얻고 나누는 기준은 정하지 못했을 때$content$,
  $content$자리도 기준도 얻지 못했거나 사용자가 말을 접었을 때$content$
),
(
  '13000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003',
  2,
  $content$새벽 두 시의 통화$content$,
  $content$며칠째 새벽마다 벽 너머로 Jamie의 웃음소리와 통화 소리가 넘어와요.$content$,
  $content$잠을 지킬 수 있게 밤 통화를 조율해 보세요$content$,
  $content$🌙$content$,
  $content$새벽 두 시, 벽 너머에서 Jamie의 웃음소리가 또 터진다. 사흘째 이어지는 밤 통화다.
물이라도 마시려고 부엌으로 나가자, 헤드셋을 목에 건 Jamie가 방문을 열고 나온다.
Jamie: Oh, did I wake you up? Sorry, my best friend lives overseas, so this is the only time we can talk.$content$,
  $content$상황:
- 새벽 두 시의 부엌이다. 벽이 얇아 Jamie의 밤 통화 소리가 사용자의 방까지 넘어온다. 오늘로 사흘째다.
- 사용자는 아침 일찍 나가야 하고, 며칠째 잠을 설쳤다.
- Jamie의 가장 친한 친구는 시차가 큰 나라에 산다. Jamie에게는 이 시간이 통화할 수 있는 거의 유일한 시간이다.
- Jamie는 통화를 완전히 그만둘 수는 없지만, 시간과 장소와 소리 크기는 조정할 수 있다.
- 사용자가 원하는 것을 말해야 밤이 조용해진다.

등장인물은 Jamie 한 명뿐이다. 새 인물을 만들지 않는다. 통화 상대는 지문으로만 전한다.
- Jamie: 20대 후반의 룸메이트. 미안해할 줄 알지만 자기 사정도 물러서지 않고 말한다. 구체적인 대안을 내면 받아들인다.$content$,
  array[$content$Jamie$content$],
  $content$밤 통화의 시간이나 장소를 어떻게 바꿀지 둘이 정했을 때$content$,
  $content$오늘 밤만 조용히 하기로 하고 앞으로의 약속은 정하지 못했을 때$content$,
  $content$아무것도 바뀌지 않은 채 대화가 끝났거나 사용자가 그만뒀을 때$content$
),
(
  '13000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000003',
  3,
  $content$반반의 기준$content$,
  $content$Jamie가 이번 주 정산표를 보냈는데, 제가 쓰지 않는 물건까지 반반으로 적혀 있어요.$content$,
  $content$정산에서 함께 낼 것과 아닌 것을 가려 보세요$content$,
  $content$🧾$content$,
  $content$저녁을 먹으려는데 폰이 울린다. Jamie가 보낸 이번 주 정산표다. 화장지와 세제 옆에 원두와 방향제까지 전부 반반으로 적혀 있다.
Jamie: I just sent you the list for this week. I split everything fifty-fifty, easy, right?
Jamie는 계산이 다 끝났다는 얼굴로 설거지를 하고 있다.$content$,
  $content$상황:
- 저녁의 부엌 식탁이다. Jamie가 이번 주 공용 물품 정산표를 보냈다.
- 목록에는 화장지와 세제처럼 둘 다 쓰는 것과, 사용자가 쓰지 않는 원두와 방향제 같은 것이 섞여 있고 전부 반반으로 적혀 있다.
- Jamie는 집에 두는 물건은 다 공용이라고 생각한다. 속이려는 것이 아니라 기준이 그럴 뿐이다.
- Jamie는 항목을 짚어 말하면 빼 주지만, 두루뭉술하게 불만만 말하면 목록을 그대로 둔다.
- 사용자가 기준을 말해야 정산이 끝난다.

등장인물은 Jamie 한 명뿐이다. 새 인물을 만들지 않는다. 정산표의 내용은 지문으로 전한다.
- Jamie: 20대 후반의 룸메이트. 돈 계산이 빠르고 깔끔한 것을 좋아한다. 근거를 대면 시원하게 인정하지만, 눈치만 주면 알아차리지 못한다.$content$,
  array[$content$Jamie$content$],
  $content$함께 낼 항목의 기준을 정하고 이번 정산을 그 기준대로 고쳤을 때$content$,
  $content$이번 정산의 일부만 고치고 앞으로의 기준은 정하지 못했을 때$content$,
  $content$기준을 말하지 못한 채 목록 그대로 내기로 했거나 대화를 접었을 때$content$
),
(
  '13000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000003',
  4,
  $content$사흘째 손님$content$,
  $content$Jamie의 친구 Noah가 말도 없이 사흘째 거실 소파에서 지내고 있어요.$content$,
  $content$손님이 머무는 규칙을 Jamie와 정해 보세요$content$,
  $content$🛋️$content$,
  $content$현관문을 열자 거실에서 낯익은 웃음소리가 들린다. Jamie의 친구 Noah가 사흘째 소파에 이불을 펴 두었고, 오늘은 욕실에 세면도구까지 늘어놓았다.
Noah: Hey, welcome home! We ordered pizza, do you want some?
Jamie: Noah's place is getting repairs this week. He can stay a little longer, right?$content$,
  $content$상황:
- 저녁의 거실이다. Jamie의 친구 Noah가 미리 말 없이 사흘째 소파에서 지내고 있다.
- Noah의 집은 이번 주 수리 중이라 이번 주말이면 돌아갈 수 있다.
- Jamie는 친구를 돕고 싶지만, 사용자에게 먼저 묻지 않은 것이 마음에 걸린다.
- 언제까지 머무는지, 공용 공간을 어떻게 쓰는지는 이 대화에서 정할 수 있다. 다만 Noah를 오늘 밤 당장 내보내는 것은 Jamie가 받아들이지 못한다.
- 사용자가 선을 말해야 이 밤이 정리된다.

등장인물은 Jamie와 Noah 두 명뿐이다. 새 인물을 만들지 않는다.
- Jamie: 20대 후반의 룸메이트. 친구 앞에서 좋은 사람이고 싶어 한다. 사용자가 구체적인 선을 그으면 그 선을 Noah에게 같이 전한다.
- Noah: Jamie의 오랜 친구. 붙임성이 좋고 얹혀 있는 처지를 안다. 기한과 규칙이 정해지면 군말 없이 따른다.$content$,
  array[$content$Jamie$content$, $content$Noah$content$],
  $content$Noah가 머무는 기한과 지내는 규칙을 셋이 정했을 때$content$,
  $content$오늘 밤의 불편만 정리하고 기한은 정하지 못했을 때$content$,
  $content$아무 선도 긋지 못한 채 사용자가 방으로 물러났을 때$content$
),
(
  '13000000-0000-4000-8000-000000000005',
  '10000000-0000-4000-8000-000000000003',
  5,
  $content$한 달째 저녁$content$,
  $content$함께 산 지 한 달째 되는 날, Jamie가 식탁에 빈 종이 한 장을 올려놓아요.$content$,
  $content$한 달을 돌아보며 우리 집 규칙을 함께 만들어 보세요$content$,
  $content$📝$content$,
  $content$함께 산 지 꼭 한 달째 되는 저녁이다. 식탁에는 Jamie가 시킨 피자와 빈 종이 한 장, 펜 두 자루가 놓여 있다.
Jamie: One month already. We made it through the fridge, my late calls, the bills, and Noah.
Jamie: So I thought we could write our own house rules tonight. You go first, what should be rule number one?$content$,
  $content$상황:
- 함께 산 지 한 달째 되는 날 저녁, 부엌 식탁이다. Jamie가 피자를 시켜 놓고 우리 집 규칙을 함께 적자며 빈 종이를 내밀었다.
- 지난 한 달 동안 냉장고 칸, 밤 통화, 정산, 손님 문제를 지나왔다. 종이에는 아직 아무것도 적혀 있지 않다.
- Jamie는 이 집이 꽤 마음에 들고, 사용자와 계속 살고 싶어 한다. 다만 규칙이 명령처럼 들리면 장난으로 얼버무린다.
- 사용자가 규칙을 하나 내면 Jamie도 자기 규칙을 하나씩 낸다. 주고받을수록 종이가 채워진다.
- 사용자가 먼저 하나를 말해야 종이가 채워지기 시작한다.

등장인물은 Jamie 한 명뿐이다. 새 인물을 만들지 않는다. 지난 한 달의 일은 지문과 대사로 되짚는다.
- Jamie: 20대 후반의 룸메이트. 한 달 사이 사용자와 말하는 법을 배웠다. 농담으로 시작해도 진심으로 답하면 진지하게 받는다.$content$,
  array[$content$Jamie$content$],
  $content$둘이 지킬 규칙을 종이에 적고 다음 달도 함께 살기로 확인했을 때$content$,
  $content$규칙을 몇 개만 적고 나머지는 다음으로 미뤘을 때$content$,
  $content$종이가 빈 채로 저녁이 끝났거나 사용자가 대화를 접었을 때$content$
)
,
(
  '14000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000004',
  1,
  $content$자리에 앉자마자$content$,
  $content$첫 출근 아침, 옆자리 동료가 제가 맡았다는 보고서를 묻는데 처음 듣는 이야기예요.$content$,
  $content$모른다고 말하고 그 일이 무엇인지 알아내 보세요$content$,
  $content$🗂️$content$,
  $content$월요일 아침 아홉 시, 첫 출근이다. 노트북을 펴자마자 옆자리에서 의자가 이쪽으로 돈다.
Dan: Morning! You're the new one, right? I'm Dan.
Dan: Quick question. You're taking over the weekly numbers report, right? It goes out at eleven.
처음 듣는 이야기다. 시계는 아홉 시 오 분을 가리킨다.$content$,
  $content$상황:
- 월요일 아침 아홉 시, 영어로 일하는 회사의 첫 출근 날이다. 사용자는 방금 자리에 앉았다.
- 옆자리 동료 Dan은 사용자가 주간 실적 보고서를 이어받는 걸로 알고 있다. 보고서는 열한 시에 나가야 한다.
- 사용자는 그 보고서를 처음 듣는다. 인수인계 문서도 아직 받지 못했다.
- Dan은 보고서의 틀이 어디 있는지 알려 줄 수 있지만 대신 써 줄 시간은 없다. 자세한 배경은 팀장 Grace가 안다.
- Grace는 열 시까지 다른 회의에 있어서 메신저로만 답할 수 있다.
- 사용자가 모른다고 말하고 물어야 이 일이 풀린다.

등장인물은 Dan과 Grace 두 명뿐이다. 새 인물을 만들지 않는다. 다른 팀원과 사무실 풍경은 지문으로 전한다.
- Dan: 30대 초반의 옆자리 동료. 친절하지만 자기 일이 많다. 구체적으로 물으면 아는 만큼 알려 준다.
- Grace: 팀장. 바쁘지만 명확한 질문에는 바로 답한다. 두루뭉술한 말에는 무엇이 필요한지 되묻는다.$content$,
  array[$content$Dan$content$, $content$Grace$content$],
  $content$그 일이 무엇인지 확인하고 열한 시까지 할 일을 정리했을 때$content$,
  $content$당장 급한 것만 부탁하거나 미루고 나머지는 모르는 채 넘어갔을 때$content$,
  $content$모른다는 말을 꺼내지 못하고 아는 척한 채 끝났거나 사용자가 그만뒀을 때$content$
),
(
  '14000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000004',
  2,
  $content$회의가 끝나기 전에$content$,
  $content$첫 주간 회의에서 제 이름 옆에 무리한 마감이 붙었는데, 회의가 벌써 끝나 가요.$content$,
  $content$회의가 끝나기 전에 마감 문제를 말해 보세요$content$,
  $content$📅$content$,
  $content$화요일 오전, 첫 주간 회의다. 화면의 일정표에는 내 이름 옆에 수요일 마감인 일이 붙어 있다. 아직 자료 접근 권한도 받지 못한 일이다.
Grace: Okay, that's everyone. Anything else before we wrap up?
Dan: I'm good.
다들 노트북을 덮기 시작한다. 지금 말하지 않으면 이 마감은 그대로 굳는다.$content$,
  $content$상황:
- 화요일 오전의 주간 회의다. 회의는 마무리 단계이고, Grace가 마지막으로 남은 말이 있는지 묻고 있다.
- 화면의 일정표에는 사용자 이름 옆에 수요일 마감인 자료 정리 일이 있다. 사용자는 아직 그 자료에 접근할 권한이 없고, 주간 보고서 일과도 겹친다.
- 지금 말하지 않으면 일정은 그대로 확정되고, 회의가 끝난 뒤에는 바꾸기 훨씬 어렵다.
- Grace는 이유를 들으면 일정을 조정해 준다. 다만 어렵다는 말만으로는 움직이지 않고, 무엇이 왜 안 되는지 되묻는다.
- Dan은 권한 신청 방법을 알고, 사용자가 도움을 청하면 회의에서 거들어 준다.

등장인물은 Grace와 Dan 두 명뿐이다. 새 인물을 만들지 않는다. 다른 팀원은 지문으로 전한다.
- Grace: 팀장. 회의를 빠르게 진행한다. 근거가 있는 요청은 바로 받아들이지만, 두루뭉술한 말에는 구체적으로 되묻는다.
- Dan: 30대 초반의 옆자리 동료. 회의에서는 말을 아끼지만, 사용자가 도움을 청하면 아는 것을 보탠다.$content$,
  array[$content$Grace$content$, $content$Dan$content$],
  $content$회의가 끝나기 전에 문제를 말해 마감이나 권한이 조정됐을 때$content$,
  $content$회의에서는 말을 다 못 하고 끝난 뒤 따로 이야기해 일부만 조정했을 때$content$,
  $content$아무 말도 못 한 채 일정이 그대로 확정됐거나 사용자가 그만뒀을 때$content$
),
(
  '14000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000004',
  3,
  $content$틀린 숫자의 주인$content$,
  $content$제가 보낸 보고서에서 틀린 숫자가 나왔는데, 건네받은 원본 파일부터 잘못돼 있었어요.$content$,
  $content$무슨 일이 있었는지 설명하고 보고서를 바로잡아 보세요$content$,
  $content$📊$content$,
  $content$수요일 오후다. 오전에 보낸 주간 보고서에서 숫자가 틀렸다는 답장이 왔다. 확인해 보니 Dan이 건네준 원본 파일부터 지난주 숫자였다.
Grace: Hey, the numbers in today's report don't match the system. Did you change something?
Grace가 모니터를 돌려 보이며 자리 옆에 선다. Dan은 회의에 들어가 있어 자리에 없다.$content$,
  $content$상황:
- 수요일 오후의 사무실이다. 사용자가 오늘 보낸 주간 보고서의 숫자가 시스템과 다르다.
- 원인은 Dan이 인수인계로 건네준 원본 파일이다. 지난주 숫자가 남은 파일이었고, Dan도 그 사실을 모른다.
- Grace는 사용자 자리로 와서 무슨 일인지 묻고 있다. 화가 난 것이 아니라 오늘 안에 바로잡을 방법을 알고 싶어 한다.
- Dan은 회의 중이라 메신저로만 답할 수 있다. 물으면 최신 파일 위치를 알려 준다.
- 사용자가 상황을 설명해야 오해가 풀리고, 고친 보고서를 다시 보내야 일이 끝난다.

등장인물은 Grace와 Dan 두 명뿐이다. 새 인물을 만들지 않는다. 다른 팀원은 지문으로 전한다.
- Grace: 팀장. 잘못을 따지기보다 사실과 해결책을 원한다. 사용자가 남 탓만 하면 표정이 굳고, 사실을 정리해 말하면 그대로 받아들인다.
- Dan: 30대 초반의 옆자리 동료. 자기 실수를 알면 바로 인정하고 미안해한다. 메신저로 새 파일 위치를 알려 줄 수 있다.$content$,
  array[$content$Grace$content$, $content$Dan$content$],
  $content$무슨 일이 있었는지 사실대로 설명하고 고친 보고서까지 내보냈을 때$content$,
  $content$오해를 풀거나 보고서를 고치는 것 중 하나만 해냈을 때$content$,
  $content$사용자의 잘못으로 굳어진 채 대화가 끝났거나 사용자가 그만뒀을 때$content$
),
(
  '14000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000004',
  4,
  $content$괜찮다고 하기 전에$content$,
  $content$내일 아침까지 낼 자료가 반나절째 막혔는데, 옆자리 동료는 퇴근 준비를 해요.$content$,
  $content$막힌 곳을 설명하고 필요한 도움을 청해 보세요$content$,
  $content$🙋$content$,
  $content$목요일 오후 다섯 시 반이다. 내일 아침 회의에 낼 자료가 아직 반도 안 됐다. 시스템에서 데이터를 뽑는 단계에서 반나절째 막혀 있다.
Dan: I'm heading out soon. You okay? You've been staring at that screen for a while.
Dan이 가방을 챙기다가 이쪽을 본다. 여기서 괜찮다고 하면 오늘 밤은 혼자다.$content$,
  $content$상황:
- 목요일 오후 다섯 시 반의 사무실이다. 사용자는 내일 아침 회의에 낼 자료를 만들고 있다.
- 시스템에서 데이터를 뽑는 단계에서 반나절째 막혀 있다. 혼자서는 오늘 안에 끝내기 어렵다.
- Dan은 퇴근 준비 중이지만, 막힌 곳을 구체적으로 말하면 이십 분 정도는 내 줄 수 있다. 이 시스템을 제일 잘 아는 사람이기도 하다.
- 사용자가 괜찮다고 하면 Dan은 그대로 퇴근한다. Grace는 이미 퇴근해서 부를 수 없다.
- 사용자가 무엇이 안 되는지 말해야 도움이 시작된다.

등장인물은 Dan 한 명뿐이다. 새 인물을 만들지 않는다. 다른 팀원과 사무실 풍경은 지문으로 전한다.
- Dan: 30대 초반의 옆자리 동료. 도와줄 마음이 있지만 시간이 많지 않다. 뭐가 문제인지 애매하면 되묻고, 구체적으로 말하면 바로 자리를 당겨 앉는다.$content$,
  array[$content$Dan$content$],
  $content$막힌 곳을 설명하고 도움을 받아 자료를 끝낼 길이 잡혔을 때$content$,
  $content$힌트만 얻고 나머지는 혼자 감당하기로 했을 때$content$,
  $content$괜찮다고 돌려보내 혼자 남았거나 사용자가 그만뒀을 때$content$
),
(
  '14000000-0000-4000-8000-000000000005',
  '10000000-0000-4000-8000-000000000004',
  5,
  $content$금요일의 제안$content$,
  $content$팀장은 다음 주도 보고서를 똑같이 가자는데, 저는 이번 주에 겪은 문제를 알아요.$content$,
  $content$이번 주에 겪은 일을 근거로 제안을 말해 보세요$content$,
  $content$🗣️$content$,
  $content$금요일 오후, 한 주를 정리하는 짧은 회의다. 화면에는 다음 주 계획이 떠 있고, 보고서 항목은 이번 주와 똑같이 적혀 있다.
Grace: So, same process for the report next week. Unless anyone sees a problem?
Dan이 이쪽을 슬쩍 본다. 수요일에 숫자가 꼬였던 그 방식 그대로다.$content$,
  $content$상황:
- 금요일 오후, 한 주를 정리하는 회의다. Grace가 다음 주 계획을 띄웠고, 주간 보고서는 이번 주와 같은 방식으로 적혀 있다.
- 사용자는 이번 주에 그 방식 때문에 곤란을 겪었다. 원본 파일을 손으로 주고받다가 지난주 숫자가 섞였고, 반나절을 헤맸다.
- 사용자에게는 고칠 생각이 있다. 시스템에서 바로 뽑기, 보내기 전에 둘이 확인하기 같은 것이다. 무엇을 제안할지는 사용자가 정한다.
- Grace는 바꾸는 것을 싫어하지 않지만, 시간이 더 드는 제안에는 근거를 요구한다. 겪은 일을 근거로 말하면 받아들인다.
- Dan은 사용자의 제안에 힘을 실어 줄 수 있다. 다만 사용자가 먼저 말을 꺼내야 움직인다.
- 회의가 끝나면 팀은 다 같이 저녁을 먹으러 간다. 이 제안이 첫 주의 마지막 일이다.

등장인물은 Grace와 Dan 두 명뿐이다. 새 인물을 만들지 않는다. 다른 팀원은 지문으로 전한다.
- Grace: 팀장. 근거 있는 제안은 기꺼이 받고, 받아들이면 그 자리에서 계획을 고친다. 첫 주를 버틴 사용자를 인정하기 시작했다.
- Dan: 30대 초반의 옆자리 동료. 이번 주 일을 함께 겪어서 사용자의 말을 거들 준비가 되어 있다.$content$,
  array[$content$Grace$content$, $content$Dan$content$],
  $content$제안이 받아들여져 다음 주 계획이 바뀌었을 때$content$,
  $content$제안의 일부만 반영되거나 다음에 다시 이야기하기로 했을 때$content$,
  $content$의견을 내지 못했거나 근거 없이 밀다가 계획이 그대로 끝났을 때$content$
)
,
(
  '15000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000005',
  1,
  $content$천장 위의 소리$content$,
  $content$밤마다 윗집에서 소리가 나서 잠을 설쳤는데, 아침 복도에서 그 사람과 마주쳤어요.$content$,
  $content$간밤의 소음 이야기를 윗집 사람에게 꺼내 보세요$content$,
  $content$🌙$content$,
  $content$새벽 두 시까지 천장에서 발소리와 무언가 끄는 소리가 났다. 이사 온 지 일주일, 벌써 사흘째 잠을 설쳤다.
다음 날 아침, 분리수거를 하러 나간 복도에서 윗집 사람과 처음 마주친다.
Nora: Oh, hi! You must be the new neighbor in 302. I'm Nora, right above you.
Nora는 아무것도 모르는 얼굴로 웃으며 엘리베이터 버튼을 누른다.$content$,
  $content$상황:
- 아침의 아파트 복도, 엘리베이터 앞이다. 사용자는 일주일 전 302호에 이사 왔다.
- 밤마다 자정 넘어 윗집에서 발소리와 무언가 끄는 소리가 나서 사흘째 잠을 설쳤다.
- 소리의 주인은 402호의 Nora다. 밤 근무를 마치고 돌아와 늦은 저녁을 차리고 집안일을 하는데, 오래된 건물이라 바닥이 소리를 그대로 전한다. Nora는 이 사실을 모른다.
- Nora가 할 수 있는 것: 사과하기, 슬리퍼 신기, 의자 다리에 펠트 붙이기, 시끄러운 집안일을 낮으로 옮기기. 할 수 없는 것: 밤 근무 자체를 바꾸기.
- 사용자가 말을 꺼내야 이 일이 풀린다.

등장인물은 Nora 한 명뿐이다. 새 인물을 만들지 않는다. 다른 주민과 주변 상황은 지문으로 전한다.
- Nora: 30대 초반의 간호사. 밤 근무를 마치고 자정 넘어 귀가한다. 처음 만난 아랫집 사람을 반갑게 대한다. 소리 이야기를 들으면 놀라고 진심으로 미안해하지만, 근무를 바꿀 수는 없어 방법을 같이 찾으려 한다.$content$,
  array[$content$Nora$content$],
  $content$소음의 사정을 전하고 앞으로 어떻게 할지 약속을 받았을 때$content$,
  $content$문제는 전했지만 구체적인 약속 없이 헤어졌을 때$content$,
  $content$말을 꺼내지 못했거나 감정만 상한 채 끝났을 때$content$
),
(
  '15000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000005',
  2,
  $content$사라진 택배$content$,
  $content$배송 완료 문자는 왔는데, 문 앞에 상자가 없어요.$content$,
  $content$사라진 택배의 행방을 찾아보세요$content$,
  $content$📦$content$,
  $content$퇴근길에 배송 완료 문자를 받았다. 그런데 302호 문 앞에는 아무것도 없다. 새로 산 스탠드 조명이 든 상자다.
1층 관리실 문을 두드리자 안경을 쓴 관리인이 고개를 내민다.
Frank: Evening. What can I do for you?
Frank는 손에 든 서류를 내려놓고 사용자를 본다.$content$,
  $content$상황:
- 저녁의 1층 관리실 앞이다. 사용자가 주문한 스탠드 조명이 배송 완료로 떠 있는데 302호 문 앞에 없다.
- 관리인 Frank는 로비 카메라를 확인해 줄 수 있지만, 몇 시쯤 어떤 상자가 왔는지 사용자가 설명해야 찾아볼 수 있다.
- 카메라를 확인하면 택배 기사가 상자를 402호 문 앞에 두고 간 것이 나온다. 402호의 Nora는 밤 근무라 새벽까지 집에 없다.
- Frank는 남의 집 문을 대신 열어 줄 수 없다. 402호 문에 메모를 남기거나 Nora에게 연락해 두는 것까지는 해 줄 수 있다.
- 사용자가 설명하고 부탁해야 이 일이 풀린다.

등장인물은 Frank 한 명뿐이다. 새 인물을 만들지 않는다. 택배 기사와 다른 주민은 지문으로 전한다.
- Frank: 50대의 건물 관리인. 규정에 깐깐하지만 절차대로 부탁하면 성의껏 도와준다. 두루뭉술한 설명에는 되묻는다.$content$,
  array[$content$Frank$content$],
  $content$상자가 어디 있는지 확인하고 돌려받을 방법까지 정했을 때$content$,
  $content$행방은 알았지만 돌려받을 방법을 정하지 못하고 돌아섰을 때$content$,
  $content$행방을 확인하지 못했거나 사용자가 그만뒀을 때$content$
),
(
  '15000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000005',
  3,
  $content$젖은 빨래$content$,
  $content$세탁실에 내려가 보니 제 빨래가 꺼내져 있고, 세탁기는 다른 빨래를 돌리고 있어요.$content$,
  $content$꺼내진 빨래 문제를 이야기하고 앞으로의 방법을 정해 보세요$content$,
  $content$🧺$content$,
  $content$일요일 오후의 지하 세탁실이다. 전화를 받다가 이십 분 늦게 내려왔더니, 돌려 둔 빨래가 꺼내져 접이식 테이블 위에 얹혀 있다. 아직 축축하다.
하나뿐인 멀쩡한 세탁기는 벌써 돌아가고 있고, 그 앞에 Nora가 서 있다.
Nora: Oh... hey. I was going to tell you about that.
Nora가 세탁기와 테이블 위의 빨래를 번갈아 본다.$content$,
  $content$상황:
- 일요일 오후의 지하 세탁실이다. 세탁기 두 대 중 한 대는 고장 표지가 붙어 있다.
- 사용자의 세탁이 끝나고 이십 분이 지났고, Nora가 그 빨래를 꺼내 테이블에 올린 뒤 자기 빨래를 돌리기 시작했다.
- Nora는 출근 전에 빨래를 끝내야 해서 기다리다가 꺼냈다. 미안해하지만, 끝난 빨래를 마냥 기다릴 수도 없었다고 생각한다.
- Nora가 할 수 있는 것: 사과하기, 다음부터 꺼내기 전에 연락하기, 세탁 시간대를 나누기. 할 수 없는 것: 지금 돌아가는 자기 빨래를 중간에 빼기.
- 사용자가 말을 꺼내야 이 일이 정리된다.

등장인물은 Nora 한 명뿐이다. 새 인물을 만들지 않는다. 다른 주민과 주변 상황은 지문으로 전한다.
- Nora: 30대 초반의 간호사. 윗집 402호에 살고, 아랫집 사용자와는 복도에서 인사한 사이다. 미안해할 줄 알지만 자기 사정도 설명한다. 구체적인 제안에는 기꺼이 응한다.$content$,
  array[$content$Nora$content$],
  $content$서로의 사정을 확인하고 세탁실을 같이 쓸 방법까지 정했을 때$content$,
  $content$이번 일만 정리하고 다음 방법 없이 헤어졌을 때$content$,
  $content$서운함만 주고받았거나 사용자가 그만뒀을 때$content$
),
(
  '15000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000005',
  4,
  $content$이상한 고지서$content$,
  $content$첫 관리비 고지서에 이사 오기 전 달의 요금까지 붙어 나왔어요.$content$,
  $content$잘못 붙은 관리비를 바로잡아 보세요$content$,
  $content$🧾$content$,
  $content$우편함에서 꺼낸 첫 관리비 고지서다. 금액이 생각보다 크다 싶었는데, 이사 오기 전 달의 수도 요금까지 302호 앞으로 붙어 있다.
고지서를 들고 관리실로 내려간다. Frank가 안경 너머로 고지서를 받아 든다.
Frank: Let me see. Hmm, it looks right to me. Every charge under 302 goes to 302.
Frank가 고지서를 돌려주며 사용자를 본다.$content$,
  $content$상황:
- 저녁의 관리실이다. 사용자가 받은 첫 관리비 고지서에 이사 오기 전 달의 수도 요금이 함께 붙어 있다.
- 그 요금은 전에 살던 사람이 내지 않고 나간 것이다. Frank의 장부에는 호수별 금액만 있어서, 입주 날짜를 맞춰 봐야 누구의 요금인지 드러난다.
- Frank는 규정대로 움직인다. 사용자가 입주 날짜를 근거로 설명하면 장부를 확인하고 다음 고지서에서 바로잡아 줄 수 있다. 그 자리에서 현금으로 돌려주는 것은 할 수 없다.
- 사용자가 근거를 들어 설명해야 이 일이 풀린다.

등장인물은 Frank 한 명뿐이다. 새 인물을 만들지 않는다. 다른 주민은 지문으로 전한다.
- Frank: 50대의 건물 관리인. 서류와 날짜를 믿는다. 근거 없이 우기면 물러서지 않지만, 날짜가 맞으면 깔끔하게 인정하고 고친다.$content$,
  array[$content$Frank$content$],
  $content$입주 날짜가 확인되어 잘못 붙은 요금을 고쳐 주기로 했을 때$content$,
  $content$다시 확인해 보겠다는 대답까지만 받고 돌아섰을 때$content$,
  $content$요금을 바로잡지 못했거나 사용자가 그만뒀을 때$content$
),
(
  '15000000-0000-4000-8000-000000000005',
  '10000000-0000-4000-8000-000000000005',
  5,
  $content$402호의 부탁$content$,
  $content$저녁에 초인종이 울리더니, Nora가 쿠키 상자를 들고 문 앞에 서 있어요.$content$,
  $content$부탁을 들어 보고 어떻게 할지 정해 보세요$content$,
  $content$🍪$content$,
  $content$저녁 아홉 시, 초인종이 울린다. 문을 열자 Nora가 서 있다. 손에는 쿠키가 든 작은 상자가 들려 있다.
Nora: Hi. These are for you. And... I also came to ask a favor, if that's okay.
Nora가 상자를 내밀며 멋쩍게 웃는다.$content$,
  $content$상황:
- 저녁의 302호 문 앞이다. Nora가 쿠키 상자를 들고 내려와 부탁을 꺼낸다.
- Nora는 다음 주 내내 병원에서 밤낮이 바뀐 근무라 낮에 집을 비운다. 그 사이 서명이 필요한 택배가 온다. 동생이 보내는 것이라 놓치고 싶지 않다.
- Nora가 바라는 것: 사용자가 낮에 그 택배를 대신 받아 주는 것. 사용자가 어렵다고 하면 관리실의 Frank에게 맡기는 방법도 받아들인다.
- Nora는 그동안 소리와 세탁실로 겹친 일들을 미안해한다. 대화가 잘 풀리면 연락처를 주고받자고 먼저 말한다.
- 사용자가 어떻게 답하느냐에 따라 이 관계가 어디에 도착하는지 달라진다.

등장인물은 Nora 한 명뿐이다. 새 인물을 만들지 않는다. Frank와 다른 주민은 지문으로 전한다.
- Nora: 30대 초반의 간호사. 윗집 402호에 살고, 그동안 소리와 세탁실 일로 아랫집 사용자와 부딪쳤다. 부탁하는 게 쑥스러워 말을 돌리지만, 되물으면 필요한 것을 정확히 말한다. 거절도 담담하게 받아들인다.$content$,
  array[$content$Nora$content$],
  $content$부탁을 정리하고 연락처까지 주고받았을 때$content$,
  $content$부탁만 정리하고 짧은 인사로 헤어졌을 때$content$,
  $content$부탁이 정리되지 않은 채 어색하게 헤어졌을 때$content$
)
on conflict (id) do update
set story_id = excluded.story_id,
    number = excluded.number,
    title = excluded.title,
    preview = excluded.preview,
    situation = excluded.situation,
    situation_emoji = excluded.situation_emoji,
    opening = excluded.opening,
    stage = excluded.stage,
    cast_names = excluded.cast_names,
    ending_success = excluded.ending_success,
    ending_compromise = excluded.ending_compromise,
    ending_failure = excluded.ending_failure;
