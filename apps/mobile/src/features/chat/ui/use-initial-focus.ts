import type { LegendListRef } from "@legendapp/list/react-native";
import type { UIMessage } from "ai";
import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { ChatFocusTarget } from "./chat-focus";

/**
 * 목록이 첫 배치를 마쳤다는 신호가 오지 않아도 짚을 자리를 잡는 시각.
 *
 * 그 신호를 끝내 받지 못하면 최신 내용 추적과 최신 메시지 버튼이 자리를 잡는
 * 동안의 상태에 묶여 풀리지 않는다.
 */
const PLACEMENT_FALLBACK_MS = 1000;

/**
 * 대화를 처음 보여 줄 때 맞출 자리. 표현 노트에서 저장한 표현이 나온 대화로
 * 들어올 때만 넘긴다.
 */
export interface ChatPanelFocus {
  /** 인물 대사면 장면 안 몇 번째 대사인지. 없으면 메시지와 그 아래 매달린 것을 본다. */
  dialogueIndex?: number;
  /** 짚는 테두리를 지금 그리는지. 화면이 도착과 자리 잡기를 보고 정한다. */
  isHighlighting: boolean;
  messageId: string;
  /** 테두리가 사라졌다. */
  onHighlightEnd: () => void;
  /** 첫 자리를 잡았다. 한 번만 부른다. */
  onPositioned: () => void;
}

/** 다음 화면 프레임까지 기다린다. 행과 입력창이 잰 높이가 목록에 닿는 틈이다. */
function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

/**
 * 짚을 메시지의 첫 자리. 목록 좌표로 행의 위쪽 끝과 크기를 받아 스크롤 위치를 답한다.
 *
 * 인물 대사는 장면 안의 그 대사를 위쪽에 맞춘다. 사용자 문장과 그 아래 매달린
 * 표현이 한 화면에 들어가면 사용자 문장 위쪽에 맞추고, 한 화면보다 길면 매달린
 * 표현의 위쪽을 맞춰 저장한 영어부터 읽게 한다. 위로 스크롤하면 사용자 문장을 읽을
 * 수 있다. 대화의 처음과 끝을 넘어가지 않는다.
 */
function focusOffset({
  addonTop,
  contentLength,
  rowSize,
  rowTop,
  scrollLength,
  topSpacing,
  utteranceTop,
  viewport,
}: {
  /** 행 안에서 매달린 것이 선 높이. 아직 재지 못했으면 행의 위쪽을 쓴다. */
  addonTop: number;
  contentLength: number;
  rowSize: number;
  rowTop: number;
  scrollLength: number;
  topSpacing: number;
  /** 인물 대사를 짚을 때만 온다. 장면 안에서 그 대사가 선 높이다. */
  utteranceTop: number | undefined;
  viewport: number;
}): number {
  let offset = rowTop + addonTop - topSpacing;

  if (utteranceTop !== undefined) {
    offset = rowTop + utteranceTop - topSpacing;
  } else if (rowSize + topSpacing <= viewport) {
    offset = rowTop - topSpacing;
  }

  return Math.min(
    Math.max(0, contentLength - scrollLength),
    Math.max(0, offset)
  );
}

/**
 * 저장한 표현이 나온 자리에서 여는 대화.
 *
 * 목록은 처음부터 그 메시지 근처를 그리고, 첫 배치가 끝나면 잰 높이로 한 번만
 * 정확한 자리로 옮긴다. 이 동안에는 최신 내용 추적과 최신 메시지 버튼을 멈춰 두고,
 * 옮긴 뒤에는 실제로 끝에 닿았는지로 정한다. 짚을 메시지가 목록에 없으면 아무것도
 * 하지 않아 대화는 평소처럼 열린다.
 */
export function useInitialFocus({
  bottomOcclusion,
  focus,
  hasReachedEnd,
  listRef,
  messages,
  onFollowingLatest,
  topSpacing,
}: {
  /** 목록 아래를 가리는 입력창과 키보드의 높이. */
  bottomOcclusion: number;
  focus: ChatPanelFocus | undefined;
  hasReachedEnd: () => boolean;
  listRef: RefObject<LegendListRef | null>;
  messages: readonly UIMessage[];
  onFollowingLatest: (isFollowing: boolean) => void;
  topSpacing: number;
}) {
  const [focusIndex] = useState(() =>
    focus === undefined
      ? -1
      : messages.findIndex((message) => message.id === focus.messageId)
  );
  const [isPlacingFocus, setIsPlacingFocus] = useState(focusIndex >= 0);
  const focusRef = useRef(focus);
  const bottomOcclusionRef = useRef(bottomOcclusion);
  const utteranceTop = useRef<number | undefined>(undefined);
  const addonTop = useRef(0);
  const hasPlaced = useRef(false);
  const isMounted = useRef<boolean>(true);

  focusRef.current = focus;
  bottomOcclusionRef.current = bottomOcclusion;

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const reportUtteranceTop = useCallback((top: number) => {
    utteranceTop.current = top;
  }, []);
  const reportAddonTop = useCallback((top: number) => {
    addonTop.current = top;
  }, []);

  const placeFocus = useCallback(async () => {
    if (focusIndex < 0 || hasPlaced.current) {
      return;
    }

    hasPlaced.current = true;

    try {
      await nextFrame();
      await nextFrame();
      const list = listRef.current;

      if (list === null) {
        return;
      }

      const state = list.getState();

      await list.scrollToOffset({
        animated: false,
        offset: focusOffset({
          addonTop: addonTop.current,
          contentLength: state.contentLength,
          rowSize: state.sizeAtIndex(focusIndex),
          rowTop: state.positionAtIndex(focusIndex),
          scrollLength: state.scrollLength,
          topSpacing,
          utteranceTop:
            focusRef.current?.dialogueIndex === undefined
              ? undefined
              : (utteranceTop.current ?? 0),
          viewport: Math.max(
            1,
            state.scrollLength - bottomOcclusionRef.current
          ),
        }),
      });
    } catch {
      // 옮기지 못해도 사용자가 스크롤해 읽을 수 있다.
    } finally {
      // biome-ignore lint/suspicious/noUnnecessaryConditions: 기다리는 사이 화면을 닫으면 거짓이 된다
      if (isMounted.current) {
        setIsPlacingFocus(false);
        onFollowingLatest(hasReachedEnd());
        focusRef.current?.onPositioned();
      }
    }
  }, [focusIndex, hasReachedEnd, listRef, onFollowingLatest, topSpacing]);

  useEffect(() => {
    if (focusIndex < 0) {
      return;
    }
    const timer = setTimeout(() => {
      placeFocus().catch(() => undefined);
    }, PLACEMENT_FALLBACK_MS);

    return () => clearTimeout(timer);
  }, [focusIndex, placeFocus]);

  const onListLoad = useCallback(() => {
    placeFocus().catch(() => undefined);
  }, [placeFocus]);

  const focusTarget = useMemo<ChatFocusTarget | undefined>(
    () =>
      focus === undefined || focusIndex < 0
        ? undefined
        : {
            dialogueIndex: focus.dialogueIndex,
            isHighlighting: focus.isHighlighting,
            messageId: focus.messageId,
            onHighlightEnd: focus.onHighlightEnd,
            reportAddonTop,
            reportUtteranceTop,
          },
    [focus, focusIndex, reportAddonTop, reportUtteranceTop]
  );

  /*
    목록이 처음 그릴 자리. 짚을 메시지가 있으면 그 메시지를 화면 위쪽에 두고, 없으면
    평소처럼 최신 내용에서 연다.
  */
  const listStart = useMemo(
    () =>
      focusIndex < 0
        ? { initialScrollAtEnd: true, initialScrollIndex: undefined }
        : {
            initialScrollAtEnd: false,
            initialScrollIndex: { index: focusIndex, viewOffset: topSpacing },
          },
    [focusIndex, topSpacing]
  );

  return { focusTarget, isPlacingFocus, listStart, onListLoad };
}
