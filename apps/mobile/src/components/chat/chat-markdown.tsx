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
import { Linking, ScrollView, Text, View } from "react-native";

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
    <Text
      accessibilityLabel={label}
      accessibilityRole="link"
      className="text-foreground underline"
      onPress={openLink}
    >
      {children}
    </Text>
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
        <Text
          className="rounded bg-surface font-mono text-[15px] text-foreground"
          key={key}
        >
          {node.value}
        </Text>
      );
    case "strong":
      return (
        <Text className="font-bold" key={key}>
          {renderInlineChildren(node.children, key)}
        </Text>
      );
    case "emphasis":
      return (
        <Text className="italic" key={key}>
          {renderInlineChildren(node.children, key)}
        </Text>
      );
    case "delete":
      return (
        <Text className="line-through" key={key}>
          {renderInlineChildren(node.children, key)}
        </Text>
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

function headingClass(depth: number) {
  if (depth === 1) {
    return "mb-3 mt-2 font-bold text-[24px] text-foreground leading-8";
  }
  if (depth === 2) {
    return "mb-2 mt-2 font-bold text-[21px] text-foreground leading-7";
  }
  return "mb-2 mt-1 font-semibold text-[18px] text-foreground leading-6";
}

function renderTableCell(cell: TableCell, key: string, header: boolean) {
  return (
    <View
      className="min-w-28 border-border border-r border-b px-3 py-2"
      key={key}
    >
      <Text
        className={
          header
            ? "font-semibold text-[14px] text-foreground"
            : "text-[14px] text-foreground"
        }
        selectable
      >
        {renderInlineChildren(cell.children, key)}
      </Text>
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
      <Text className="w-6 text-base text-foreground leading-[23px]">
        {marker}
      </Text>
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
        <Text
          className={`text-base text-foreground leading-[23px] ${
            compact ? "" : "mb-3"
          }`}
          key={key}
          selectable
        >
          {renderInlineChildren(node.children, key)}
        </Text>
      );
    case "heading":
      return (
        <Text className={headingClass(node.depth)} key={key} selectable>
          {renderInlineChildren(node.children, key)}
        </Text>
      );
    case "code":
      return (
        <ScrollView
          className="mb-4 rounded-xl bg-surface"
          horizontal
          key={key}
          showsHorizontalScrollIndicator={false}
        >
          <Text
            className="p-4 font-mono text-[14px] text-foreground leading-5"
            selectable
          >
            {node.value}
          </Text>
        </ScrollView>
      );
    case "blockquote":
      return (
        <View
          className="mb-3 border-muted-foreground border-l-2 pl-3"
          key={key}
        >
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
      return <View className="mt-1 mb-4 h-px bg-border" key={key} />;
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
    return (
      <Text className="text-base text-foreground leading-[23px]" selectable>
        {children}
      </Text>
    );
  }

  return (
    <View>
      {document.children.map((node, index) =>
        renderBlock(node, `markdown-${index}`)
      )}
    </View>
  );
}
