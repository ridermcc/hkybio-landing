import React, { useEffect, useRef } from 'react';

interface InlineEditProps {
    value: string;
    onChange: (val: string) => void;
    as?: any;
    className?: string;
    placeholder?: string;
    multiline?: boolean;
}

export const InlineEdit: React.FC<InlineEditProps> = ({
    value,
    onChange,
    as: Component = 'span',
    className = '',
    placeholder = '',
    multiline = false,
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize for textarea
    useEffect(() => {
        if (multiline && textareaRef.current) {
            textareaRef.current.style.height = '0px';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = scrollHeight + 'px';
        }
    }, [value, multiline]);

    if (multiline) {
        return (
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`bg-transparent outline-none focus:ring-1 focus:ring-white/40 rounded px-1 resize-none w-full overflow-hidden ${className}`}
                placeholder={placeholder}
                rows={1}
            />
        );
    }

    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`bg-transparent outline-none focus:ring-1 focus:ring-white/40 rounded px-1 w-full text-center ${className}`}
            placeholder={placeholder}
        />
    );
};
