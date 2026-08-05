import { profileToolbarIcons } from "./profile-toolbar-icons.android";

describe("Android profile toolbar icons", () => {
  it("닫기와 저장을 Material image resource로 제공한다", () => {
    expect(profileToolbarIcons.close).toBeDefined();
    expect(profileToolbarIcons.close).not.toBe("xmark");
    expect(profileToolbarIcons.save).toBeDefined();
    expect(profileToolbarIcons.save).not.toBe("checkmark");
  });
});
