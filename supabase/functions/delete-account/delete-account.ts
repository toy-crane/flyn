const AVATAR_BUCKET = "avatars";
/** 만든 스토리의 표지가 사는 곳. 한 사람 몫이 이 폴더 하나에 모인다. */
const COVER_BUCKET = "story-covers";
const MADE_COVER_FOLDER = "made";
const STORAGE_PAGE_SIZE = 100;

export interface AccountDeletionError {
  code?: string;
  message: string;
  status?: number;
}

interface StorageEntry {
  id: string | null;
  name: string;
}

interface StorageFolder {
  list: (
    folder: string,
    options?: { limit?: number },
  ) => Promise<{
    data: StorageEntry[] | null;
    error: AccountDeletionError | null;
  }>;
  remove: (
    paths: string[],
  ) => Promise<{ error: AccountDeletionError | null }>;
}

export interface AccountDeletionAdmin {
  auth: {
    admin: {
      deleteUser: (
        userId: string,
      ) => Promise<{ error: AccountDeletionError | null }>;
    };
  };
  from: (table: "profiles") => {
    update: (values: { account_deletion_started_at: string }) => {
      eq: (
        column: "id",
        value: string,
      ) => Promise<{ error: AccountDeletionError | null }>;
    };
  };
  storage: {
    from: (bucket: string) => StorageFolder;
  };
}

async function deleteStorageFolder(
  bucket: StorageFolder,
  folder: string,
): Promise<void> {
  let hasMoreEntries = true;

  while (hasMoreEntries) {
    const { data, error: listError } = await bucket.list(folder, {
      limit: STORAGE_PAGE_SIZE,
    });

    if (listError) {
      throw listError;
    }

    const entries = data ?? [];
    const nestedFolders = entries.filter(({ id }) => id === null);

    for (const entry of nestedFolders) {
      await deleteStorageFolder(bucket, `${folder}/${entry.name}`);
    }

    const paths = entries
      .filter(({ id }) => id !== null)
      .map(({ name }) => `${folder}/${name}`);

    if (paths.length > 0) {
      const { error: removeError } = await bucket.remove(paths);

      if (removeError) {
        throw removeError;
      }
    }

    hasMoreEntries = entries.length === STORAGE_PAGE_SIZE;
  }
}

/** Permanently removes the data owned by one verified Supabase user. */
export async function deleteCurrentAccount(
  admin: AccountDeletionAdmin,
  userId: string,
  deletionStartedAt = new Date().toISOString(),
): Promise<void> {
  // This update is also a write fence. Storage RLS takes a row lock while an
  // avatar write checks this value, so once this returns every earlier write is
  // done and every later write is refused.
  const { error: markError } = await admin
    .from("profiles")
    .update({ account_deletion_started_at: deletionStartedAt })
    .eq("id", userId);

  if (markError) {
    throw markError;
  }

  await deleteStorageFolder(admin.storage.from(AVATAR_BUCKET), userId);
  /*
    만든 스토리의 표지도 이 계정의 것이다. 스토리 행은 프로필을 지울 때 함께
    사라지지만 저장소의 파일은 그 연쇄를 따르지 않는다. 주인이 사라진 뒤에는
    누구 것이었는지 되짚을 길도 없으므로 여기서 지운다.
  */
  await deleteStorageFolder(
    admin.storage.from(COVER_BUCKET),
    `${MADE_COVER_FOLDER}/${userId}`,
  );

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);

  if (
    deleteError &&
    deleteError.status !== 404 &&
    deleteError.code !== "user_not_found"
  ) {
    throw deleteError;
  }
}
