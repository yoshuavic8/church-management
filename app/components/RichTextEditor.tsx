'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill').catch(() => () => null), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write something...',
  className = '',
  minHeight = '200px'
}: RichTextEditorProps) {
  // State to handle SSR and editor availability
  const [mounted, setMounted] = useState(false);
  const [editorError, setEditorError] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if react-quill is available
    import('react-quill')
      .then(() => {
        // Also try to import CSS
        import('react-quill/dist/quill.snow.css')
          .catch(() => {
            console.warn('Quill CSS not available');
            setEditorError(true);
          });
      })
      .catch(() => {
        console.warn('React Quill not available');
        setEditorError(true);
      });
  }, []);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'script',
    'indent', 'direction',
    'color', 'background',
    'align',
    'link', 'image', 'video'
  ];

  // Fallback to textarea if editor not available or error loading
  if (!mounted || editorError) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`border border-gray-300 rounded-md p-4 w-full ${className}`}
        style={{ minHeight }}
        rows={10}
      />
    );
  }

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className={className}
        style={{ minHeight }}
      />
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: ${minHeight};
          max-height: 500px;
          overflow-y: auto;
        }
        .rich-text-editor .ql-editor {
          min-height: ${minHeight};
        }
      `}</style>
    </div>
  );
}
