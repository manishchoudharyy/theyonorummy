"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";

function ToolbarButton({ onClick, active, disabled, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`rounded px-2 py-1 text-xs font-semibold transition disabled:opacity-30 ${
        active
          ? "bg-emerald-500 text-white"
          : "bg-white text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ name, label, defaultValue = "" }) {
  const [html, setHtml] = useState(defaultValue);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: defaultValue,
    immediatelyRender: false,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "min-h-[160px] px-3 py-2 text-sm text-slate-900 focus:outline-none",
      },
    },
  });

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
      {label}
      <div className="overflow-hidden rounded-lg border border-slate-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
        <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-1.5">
          <ToolbarButton
            label="Bold"
            disabled={!editor}
            active={editor?.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            B
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            disabled={!editor}
            active={editor?.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <span className="italic">I</span>
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            disabled={!editor}
            active={editor?.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <span className="underline">U</span>
          </ToolbarButton>
          <ToolbarButton
            label="Heading"
            disabled={!editor}
            active={editor?.isActive("heading", { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            H3
          </ToolbarButton>
          <ToolbarButton
            label="Bullet list"
            disabled={!editor}
            active={editor?.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            • List
          </ToolbarButton>
          <ToolbarButton
            label="Ordered list"
            disabled={!editor}
            active={editor?.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            1. List
          </ToolbarButton>
          <ToolbarButton
            label="Blockquote"
            disabled={!editor}
            active={editor?.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            &ldquo;&rdquo;
          </ToolbarButton>
          <ToolbarButton
            label="Link"
            disabled={!editor}
            active={editor?.isActive("link")}
            onClick={setLink}
          >
            Link
          </ToolbarButton>
          <ToolbarButton
            label="Undo"
            disabled={!editor}
            onClick={() => editor.chain().focus().undo().run()}
          >
            ↶
          </ToolbarButton>
          <ToolbarButton
            label="Redo"
            disabled={!editor}
            onClick={() => editor.chain().focus().redo().run()}
          >
            ↷
          </ToolbarButton>
        </div>
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none bg-white [&_.ProseMirror]:min-h-[160px] [&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_a]:text-blue-600 [&_.ProseMirror_a]:underline"
        />
      </div>
      <input type="hidden" name={name} value={html} readOnly />
    </div>
  );
}
