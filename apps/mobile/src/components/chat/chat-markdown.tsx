import { Typography } from "heroui-native";
import type {
  List,
  ListItem,
  PhrasingContent,
  Root,
  RootContent,
  Table,
  TableCell,
  TableRow,
} from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmTableFromMarkdown } from "mdast-util-gfm-table";
import { gfmTable } from "micromark-extension-gfm-table";
import { Fragment, type ReactNode, useCallback, useMemo } from "react";
import { Linking, ScrollView, View } from "react-native";

/**
 * AI 응답 Markdown. HeroUI에 대응물이 없는 능력이라 직접 만들지만 표현은 전부
 * HeroUI `Typography`와 CSS 토큰이 나른다
 * (docs/decisions/uniwind-css-theme.md). 이미지와 syntax highlighting은
 * 지원하지 않는다(docs/decisions/ai-chat-experience.md).
 */

/** 제목 깊이는 본문 위 세 단계까지만 쓴다. 그 아래는 같은 크기로 접는다. */
function headingType(depth: number) {
  if (depth === 1) {
    return "h3" as const;
  }
  if (depth === 2) {
    return "h4" as const;
  }

  return "h5" as const;
}

function MarkdownLink({
  children,
  label,
  url,
}: {
  children: ReactNode;
  label: string;
  url: string;
}) {
  const openLink = useCallback(() => {
    Linking.openURL(url).catch(() => undefined);
  }, [url]);

  return (
    <Typography
      accessibilityLabel={label}
      accessibilityRole="link"
      // HeroUI의 `link` 토큰은 전경색과 같은 무채색이라 본문 안에서 링크로 읽히지
      // 않는다. 누를 수 있는 것은 앱의 action 색을 쓴다.
      className="text-accent underline"
      onPress={openLink}
    >
      {children}
    </Typography>
  );
}

function textContent(nodes: PhrasingContent[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case "text":
        case "inlineCode":
          return node.value;
        case "break":
          return "\n";
        case "emphasis":
        case "strong":
        case "link":
          return textContent(node.children);
        case "image":
        case "imageReference":
          return "";
        case "linkReference":
          return textContent(node.children);
        default:
          return "";
      }
    })
    .join("");
}

function renderInline(node: PhrasingContent, key: string): ReactNode {
  switch (node.type) {
    case "text":
      return node.value;
    case "break":
      return "\n";
    case "inlineCode":
      return (
        <Typography key={key} type="code">
          {node.value}
        </Typography>
      );
    case "strong":
      return (
        <Typography key={key} weight="bold">
          {renderInlineChildren(node.children, key)}
        </Typography>
      );
    case "emphasis":
      return (
        <Typography className="italic" key={key}>
          {renderInlineChildren(node.children, key)}
        </Typography>
      );
    case "delete":
      return (
        <Typography className="line-through" key={key}>
          {renderInlineChildren(node.children, key)}
        </Typography>
      );
    case "link": {
      const label = textContent(node.children);
      return (
        <MarkdownLink key={key} label={label} url={node.url}>
          {renderInlineChildren(node.children, key)}
        </MarkdownLink>
      );
    }
    case "linkReference":
      return (
        <Fragment key={key}>
          {renderInlineChildren(node.children, key)}
        </Fragment>
      );
    case "image":
    case "imageReference":
    case "footnoteReference":
    case "html":
      return null;
    default:
      return null;
  }
}

function renderInlineChildren(children: PhrasingContent[], prefix: string) {
  return children.map((child, index) =>
    renderInline(child, `${prefix}-inline-${index}`)
  );
}

function renderTableCell(cell: TableCell, key: string, header: boolean) {
  return (
    <View
      className="min-w-28 border-border border-r border-b px-3 py-2"
      key={key}
    >
      <Typography
        selectable
        type="body-sm"
        weight={header ? "semibold" : "normal"}
      >
        {renderInlineChildren(cell.children, key)}
      </Typography>
    </View>
  );
}

function renderTableRow(row: TableRow, key: string, header: boolean) {
  return (
    <View className="flex-row border-border border-l" key={key}>
      {row.children.map((cell, index) =>
        renderTableCell(cell, `${key}-cell-${index}`, header)
      )}
    </View>
  );
}

function renderTable(table: Table, key: string) {
  return (
    <ScrollView
      className="mb-4"
      horizontal
      key={key}
      showsHorizontalScrollIndicator={false}
    >
      <View className="border-border border-t">
        {table.children.map((row, index) =>
          renderTableRow(row, `${key}-row-${index}`, index === 0)
        )}
      </View>
    </ScrollView>
  );
}

function renderListItem(item: ListItem, key: string, marker: string) {
  return (
    <View className="mb-1 flex-row" key={key}>
      <Typography className="w-6">{marker}</Typography>
      <View className="flex-1">
        {item.children.map((child, index) =>
          renderBlock(child, `${key}-block-${index}`, true)
        )}
      </View>
    </View>
  );
}

function renderList(list: List, key: string) {
  const start = list.start ?? 1;

  return (
    <View className="mb-3" key={key}>
      {list.children.map((item, index) =>
        renderListItem(
          item,
          `${key}-item-${index}`,
          list.ordered ? `${start + index}.` : "•"
        )
      )}
    </View>
  );
}

function renderBlock(
  node: RootContent,
  key: string,
  compact = false
): ReactNode {
  switch (node.type) {
    case "paragraph":
      return (
        <Typography
          className={compact ? undefined : "mb-3"}
          key={key}
          selectable
        >
          {renderInlineChildren(node.children, key)}
        </Typography>
      );
    case "heading":
      return (
        <Typography.Heading
          className="mt-1 mb-2"
          key={key}
          selectable
          type={headingType(node.depth)}
        >
          {renderInlineChildren(node.children, key)}
        </Typography.Heading>
      );
    case "code":
      return (
        <ScrollView
          className="mb-4"
          horizontal
          key={key}
          showsHorizontalScrollIndicator={false}
        >
          <Typography className="px-4 py-3" selectable type="code">
            {node.value}
          </Typography>
        </ScrollView>
      );
    case "blockquote":
      return (
        <View className="mb-3 border-muted border-l-2 pl-3" key={key}>
          {node.children.map((child, index) =>
            renderBlock(child, `${key}-quote-${index}`)
          )}
        </View>
      );
    case "list":
      return renderList(node, key);
    case "table":
      return renderTable(node, key);
    case "thematicBreak":
      return <View className="mt-1 mb-4 h-px bg-separator" key={key} />;
    case "html":
    case "definition":
    case "footnoteDefinition":
    case "yaml":
      return null;
    default:
      return null;
  }
}

function parseMarkdown(markdown: string): Root | null {
  try {
    return fromMarkdown(markdown, {
      extensions: [gfmTable()],
      mdastExtensions: [gfmTableFromMarkdown()],
    });
  } catch {
    return null;
  }
}

export function ChatMarkdown({ children }: { children: string }) {
  const document = useMemo(() => parseMarkdown(children), [children]);

  if (!document) {
    return <Typography selectable>{children}</Typography>;
  }

  return (
    <View>
      {document.children.map((node, index) =>
        renderBlock(node, `markdown-${index}`)
      )}
    </View>
  );
}
