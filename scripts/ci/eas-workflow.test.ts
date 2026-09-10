import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { YAML } from "bun";

test("EAS는 같은 운영 환경에서 호환 빌드를 찾고 설치 가능 여부 뒤에만 Update를 발행한다", () => {
  const workflow = YAML.parse(
    readFileSync(
      new URL("../../apps/mobile/.eas/workflows/internal.yml", import.meta.url),
      "utf8"
    )
  ) as {
    on: Record<string, unknown>;
    defaults: { tools: { node: string; bun: string } };
    jobs: Record<
      "get_build" | "build_ios" | "update_ios" | "submit_ios" | "verify_new",
      {
        type?: string;
        environment: string;
        needs?: string[];
        if?: string;
        params?: Record<string, unknown>;
      }
    >;
  };
  expect(Object.keys(workflow.on)).toEqual(["workflow_dispatch"]);
  expect(workflow.defaults.tools).toEqual({ bun: "1.4.0", node: "22.23.2" });
  expect(
    Object.values(workflow.jobs).every(
      (job) => job.environment === "production"
    )
  ).toBe(true);
  expect(workflow.jobs.get_build.params).toMatchObject({
    channel: "internal",
    distribution: "store",
    platform: "ios",
    profile: "production",
    simulator: false,
    wait_for_in_progress: true,
  });
  expect(workflow.jobs.build_ios.if).toContain(
    "!needs.get_build.outputs.build_id"
  );
  expect(workflow.jobs.update_ios.needs).toContain("verify_existing");
  expect(workflow.jobs.update_ios.params).toMatchObject({
    channel: "internal",
    platform: "ios",
  });
  expect(workflow.jobs.submit_ios.params?.build_id).toBe(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: EAS 표현식 원문을 검증한다.
    "${{ needs.build_ios.outputs.build_id }}"
  );
  expect(workflow.jobs.verify_new.needs).toEqual(["build_ios", "submit_ios"]);
});
