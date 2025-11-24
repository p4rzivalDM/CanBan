import * as React from "react";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    id?: string;
    height?: number;
}

// Lazy load MDEditor to avoid SSR issues
const MDEditor = React.lazy(async () => {
    const mdEditor = await import("@uiw/react-md-editor");
    await import("@uiw/react-md-editor/markdown-editor.css");
    await import("@uiw/react-markdown-preview/markdown.css");
    return { default: mdEditor.default };
});

// CSS for larger icons
const styles = `
    .w-md-editor-toolbar button svg {
        width: 16px;
        height: 16px;
    }
`;

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
    value,
    onChange,
    placeholder = "Enter description (supports Markdown)",
    className,
    id,
    height = 500,
}) => {
    return (
        <React.Suspense fallback={<div className="w-full h-96 bg-gray-100 rounded-md animate-pulse" />}>
            <style>{styles}</style>
            <div 
                className={cn("w-full border rounded-md overflow-hidden", className)} 
                data-color-mode="light"
            >
                <MDEditor
                    value={value}
                    onChange={(val) => onChange(val || '')}
                    preview="live"
                    hideToolbar={false}
                    height={height}
                    visibleDragbar={false}
                    textareaProps={{
                        placeholder: placeholder,
                        id: id,
                    }}
                    className="w-full"
                    style={{
                        borderRadius: 0,
                        border: 'none',
                    }}
                />
            </div>
        </React.Suspense>
    );
};

export { MarkdownEditor };
