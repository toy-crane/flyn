import { useEffect, useState } from "react";
import { checkUsernameAvailability } from "./use-profile";
import { isUsernameValid, normalizeUsername } from "./username";

export type UsernameAvailabilityStatus =
  | "available"
  | "checking"
  | "invalid"
  | "taken"
  | "unknown";

interface CheckedUsername {
  status: "available" | "taken" | "unknown";
  value: string | null;
}

const USERNAME_CHECK_DELAY_MS = 300;

export function useUsernameAvailability(
  raw: string
): UsernameAvailabilityStatus {
  const value = normalizeUsername(raw);
  const valid = isUsernameValid(value);
  const [checked, setChecked] = useState<CheckedUsername>({
    status: "unknown",
    value: null,
  });

  useEffect(() => {
    if (!valid) {
      return;
    }

    let current = true;
    const timer = setTimeout(() => {
      checkUsernameAvailability(value)
        .then((available) => {
          if (current) {
            setChecked({
              status: available ? "available" : "taken",
              value,
            });
          }
        })
        .catch(() => {
          if (current) {
            // 가용성 확인은 UX 힌트다. 요청 실패가 저장 자체를 막지는 않고,
            // 최종 중복은 DB 고유 인덱스가 다시 판단한다.
            setChecked({ status: "unknown", value });
          }
        });
    }, USERNAME_CHECK_DELAY_MS);

    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [valid, value]);

  if (!valid) {
    return "invalid";
  }

  if (checked.value !== value) {
    return "checking";
  }

  return checked.status;
}
