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
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { type AppTheme, useTheme } from "../../theme/app-theme";
import type { ThemeColors } from "../../theme/colors";
import { spacing } from "../../theme/tokens";

interface MarkdownRenderTheme extends ThemeColors {
  typography: AppTheme["typography"];
}

const styles = StyleSheet.create({
  blockquote: {
    borderLeftWidth: 2,
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
  },
  codeBlock: {
    borderRadius: spacing.sm,
    marginBottom: spacing.md,
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
    padding: spacing.md,
  },
  deleted: {
    textDecorationLine: "line-through",
  },
  emphasis: {
    fontStyle: "italic",
  },
  heading1: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 32,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  heading2: {
    fontSize: 21,
    fontWeight: "700",
    lineHeight: 28,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  heading3: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
    marginBottom: spacing.xs,
    marginTop: spacing.xxs,
  },
  inlineCode: {
    borderRadius: spacing.xxs,
    fontFamily: "monospace",
    fontSize: 15,
  },
  link: {
    textDecorationLine: "underline",
  },
  list: {
    marginBottom: spacing.sm,
  },
  listContent: {
    flex: 1,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: spacing.xxs,
  },
  listMarker: {
    width: spacing.xl,
  },
  paragraphSpacing: {
    marginBottom: spacing.sm,
  },
  strong: {
    fontWeight: "700",
  },
  table: {
    marginBottom: spacing.md,
  },
  tableBody: {
    borderTopWidth: 1,
  },
  tableCell: {
    borderBottomWidth: 1,
    borderRightWidth: 1,
    minWidth: 112,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tableHeader: {
    fontWeight: "600",
  },
  tableRow: {
    borderLeftWidth: 1,
    flexDirection: "row",
  },
  tableText: {
    fontSize: 14,
  },
  thematicBreak: {
    height: 1,
    marginBottom: spacing.md,
    marginTop: spacing.xxs,
  },
});

function MarkdownLink({
  children,
  label,
  url,
}: {
  children: ReactNode;
  label: string;
  url: string;
}) {
  const { colors } = useTheme();
  const openLink = useCallback(() => {
    Linking.openURL(url).catch(() => undefined);
  }, [url]);

  return (
    <Text
      accessibilityLabel={label}
      accessibilityRole="link"
      onPress={openLink}
      style={[styles.link, { color: colors.link }]}
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

function renderInline(
  node: PhrasingContent,
  key: string,
  colors: MarkdownRenderTheme
): ReactNode {
  switch (node.type) {
    case "text":
      return node.value;
    case "break":
      return "\n";
    case "inlineCode":
      return (
        <Text
          key={key}
          style={[
            styles.inlineCode,
            { backgroundColor: colors.surface, color: colors.text },
          ]}
        >
          {node.value}
        </Text>
      );
    case "strong":
      return (
        <Text key={key} style={styles.strong}>
          {renderInlineChildren(node.children, key, colors)}
        </Text>
      );
    case "emphasis":
      return (
        <Text key={key} style={styles.emphasis}>
          {renderInlineChildren(node.children, key, colors)}
        </Text>
      );
    case "delete":
      return (
        <Text key={key} style={styles.deleted}>
          {renderInlineChildren(node.children, key, colors)}
        </Text>
      );
    case "link": {
      const label = textContent(node.children);
      return (
        <MarkdownLink key={key} label={label} url={node.url}>
          {renderInlineChildren(node.children, key, colors)}
        </MarkdownLink>
      );
    }
    case "linkReference":
      return (
        <Fragment key={key}>
          {renderInlineChildren(node.children, key, colors)}
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

function renderInlineChildren(
  children: PhrasingContent[],
  prefix: string,
  colors: MarkdownRenderTheme
) {
  return children.map((child, index) =>
    renderInline(child, `${prefix}-inline-${index}`, colors)
  );
}

function headingStyle(depth: number) {
  if (depth === 1) {
    return styles.heading1;
  }
  if (depth === 2) {
    return styles.heading2;
  }
  return styles.heading3;
}

function renderTableCell(
  cell: TableCell,
  key: string,
  header: boolean,
  colors: MarkdownRenderTheme
) {
  return (
    <View key={key} style={[styles.tableCell, { borderColor: colors.border }]}>
      <Text
        selectable
        style={[
          styles.tableText,
          header && styles.tableHeader,
          { color: colors.text },
        ]}
      >
        {renderInlineChildren(cell.children, key, colors)}
      </Text>
    </View>
  );
}

function renderTableRow(
  row: TableRow,
  key: string,
  header: boolean,
  colors: MarkdownRenderTheme
) {
  return (
    <View key={key} style={[styles.tableRow, { borderColor: colors.border }]}>
      {row.children.map((cell, index) =>
        renderTableCell(cell, `${key}-cell-${index}`, header, colors)
      )}
    </View>
  );
}

function renderTable(table: Table, key: string, colors: MarkdownRenderTheme) {
  return (
    <ScrollView
      horizontal
      key={key}
      showsHorizontalScrollIndicator={false}
      style={styles.table}
    >
      <View style={[styles.tableBody, { borderColor: colors.border }]}>
        {table.children.map((row, index) =>
          renderTableRow(row, `${key}-row-${index}`, index === 0, colors)
        )}
      </View>
    </ScrollView>
  );
}

function renderListItem(
  item: ListItem,
  key: string,
  marker: string,
  colors: MarkdownRenderTheme
) {
  return (
    <View key={key} style={styles.listItem}>
      <Text
        style={[
          styles.listMarker,
          colors.typography.message,
          { color: colors.text },
        ]}
      >
        {marker}
      </Text>
      <View style={styles.listContent}>
        {item.children.map((child, index) =>
          renderBlock(child, `${key}-block-${index}`, colors, true)
        )}
      </View>
    </View>
  );
}

function renderList(list: List, key: string, colors: MarkdownRenderTheme) {
  const start = list.start ?? 1;
  return (
    <View key={key} style={styles.list}>
      {list.children.map((item, index) =>
        renderListItem(
          item,
          `${key}-item-${index}`,
          list.ordered ? `${start + index}.` : "•",
          colors
        )
      )}
    </View>
  );
}

function renderBlock(
  node: RootContent,
  key: string,
  colors: MarkdownRenderTheme,
  compact = false
): ReactNode {
  switch (node.type) {
    case "paragraph":
      return (
        <Text
          key={key}
          selectable
          style={[
            colors.typography.message,
            !compact && styles.paragraphSpacing,
            { color: colors.text },
          ]}
        >
          {renderInlineChildren(node.children, key, colors)}
        </Text>
      );
    case "heading":
      return (
        <Text
          key={key}
          selectable
          style={[headingStyle(node.depth), { color: colors.text }]}
        >
          {renderInlineChildren(node.children, key, colors)}
        </Text>
      );
    case "code":
      return (
        <ScrollView
          horizontal
          key={key}
          showsHorizontalScrollIndicator={false}
          style={[styles.codeBlock, { backgroundColor: colors.surface }]}
        >
          <Text selectable style={[styles.codeText, { color: colors.text }]}>
            {node.value}
          </Text>
        </ScrollView>
      );
    case "blockquote":
      return (
        <View
          key={key}
          style={[styles.blockquote, { borderColor: colors.secondaryText }]}
        >
          {node.children.map((child, index) =>
            renderBlock(child, `${key}-quote-${index}`, colors)
          )}
        </View>
      );
    case "list":
      return renderList(node, key, colors);
    case "table":
      return renderTable(node, key, colors);
    case "thematicBreak":
      return (
        <View
          key={key}
          style={[styles.thematicBreak, { backgroundColor: colors.separator }]}
        />
      );
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
  const { colors, typography } = useTheme();
  const document = useMemo(() => parseMarkdown(children), [children]);
  const renderTheme = useMemo<MarkdownRenderTheme>(
    () => ({ ...colors, typography }),
    [colors, typography]
  );

  if (!document) {
    return (
      <Text selectable style={[typography.message, { color: colors.text }]}>
        {children}
      </Text>
    );
  }

  return (
    <View>
      {document.children.map((node, index) =>
        renderBlock(node, `markdown-${index}`, renderTheme)
      )}
    </View>
  );
}
