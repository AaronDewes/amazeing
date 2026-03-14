import { Fragment, type ReactNode } from "react";
import { QuotedText } from "../../../../../../shared/components/QuotedText/QuotedText.tsx";
import styles from "./TaskDescription.module.css";
import { IoIosBulb } from "react-icons/io";
import clsx from "clsx";
import { IconText } from "../../../../../../shared/components/IconText/IconText.tsx";

type TaskDescriptionProps = {
  description: string;
};

export function TaskDescription({ description }: TaskDescriptionProps) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(
    `<root>${description}</root>`,
    "text/xml",
  );
  const root = xmlDoc.documentElement;
  return <div>{Array.from(root.childNodes).map(renderNode)}</div>;
}

function renderNode(node: ChildNode, key: number): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    return <QuotedText key={key} text={node.textContent ?? ""} />;
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    const tag = el.tagName.toLowerCase() as Tag;
    const children = Array.from(el.childNodes).map(renderNode);
    const renderer = renderers[tag] ?? defaultRenderer(tag);
    return <Fragment key={key}>{renderer(children)}</Fragment>;
  }
}

type Tag = "hint" | "br";
type TagRenderer = (children: ReactNode[]) => ReactNode;

/**
 * Renderers for each tag
 */
const renderers: Partial<Record<Tag, TagRenderer>> = {
  // Can add custom renderers later
  hint: (children: ReactNode[]) => (
    <IconText
      icon={<IoIosBulb size={16} />}
      top="3px"
      className={clsx(styles["tag-hint"])}
    >
      <div>{children}</div>
    </IconText>
  ),
  br: () => <br />,
};

function defaultRenderer(tag: Tag): TagRenderer {
  return (children) => <div className={styles[`tag-${tag}`]}>{children}</div>;
}
