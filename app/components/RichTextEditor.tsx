'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
        // Add CSS for image resizing
        if (typeof window !== 'undefined') {
          const style = document.createElement('style');
          style.textContent = `
            .ql-editor img {
              cursor: pointer;
              max-width: 100%;
              height: auto;
              transition: box-shadow 0.2s ease;
            }
            .ql-editor img:hover {
              box-shadow: 0 0 0 3px rgba(66, 165, 245, 0.3);
            }
            .ql-editor img.selected {
              box-shadow: 0 0 0 3px rgba(66, 165, 245, 0.6);
              resize: both;
              overflow: auto;
              border: 2px dashed #42a5f5;
            }
            .image-resize-toolbar {
              position: absolute;
              background: white;
              border: 1px solid #ccc;
              border-radius: 4px;
              padding: 8px;
              display: none;
              z-index: 99999;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              min-width: 200px;
            }
            .image-resize-toolbar button {
              margin: 2px;
              padding: 6px 10px;
              border: 1px solid #ccc;
              background: white;
              cursor: pointer;
              border-radius: 3px;
              font-size: 12px;
              display: inline-block;
            }
            .image-resize-toolbar button:hover {
              background: #f5f5f5;
            }
            .image-resize-toolbar .toolbar-section {
              margin-bottom: 8px;
              padding-bottom: 8px;
              border-bottom: 1px solid #eee;
            }
            .image-resize-toolbar .toolbar-section:last-child {
              margin-bottom: 0;
              padding-bottom: 0;
              border-bottom: none;
            }
            .image-resize-toolbar .section-label {
              font-size: 10px;
              color: #666;
              margin-bottom: 4px;
              font-weight: bold;
            }
            .ql-editor img.float-left {
              float: left;
              margin: 0 15px 10px 0;
              clear: left;
            }
            .ql-editor img.float-right {
              float: right;
              margin: 0 0 10px 15px;
              clear: right;
            }
            .ql-editor img.center {
              display: block;
              margin: 15px auto;
              float: none;
              clear: both;
            }
            .ql-editor img.inline {
              display: inline;
              margin: 0 8px 4px 8px;
              vertical-align: middle;
              float: none;
            }
            .ql-editor p {
              line-height: 1.6;
              margin-bottom: 10px;
            }
            .ql-editor {
              text-align: left;
            }
            .ql-editor::after {
              content: "";
              display: table;
              clear: both;
            }
          `;
          document.head.appendChild(style);
        }
      })
      .catch(() => {
        console.warn('React Quill not available');
        setEditorError(true);
      });
  }, []);

  // Add image click handler for resize functionality
  useEffect(() => {
    if (!mounted) return;

    const handleImageClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' && target.closest('.ql-editor')) {
        e.preventDefault();
        
        // Remove previous selections
        document.querySelectorAll('.ql-editor img.selected').forEach(img => {
          img.classList.remove('selected');
        });
        
        // Add selection to clicked image
        target.classList.add('selected');
        
        // Create resize toolbar
        let toolbar = document.querySelector('.image-resize-toolbar') as HTMLElement;
        if (!toolbar) {
          toolbar = document.createElement('div');
          toolbar.className = 'image-resize-toolbar';
          toolbar.innerHTML = `
            <div class="toolbar-section">
              <div class="section-label">SIZE</div>
              <button data-action="size" data-value="25">Small</button>
              <button data-action="size" data-value="50">Medium</button>
              <button data-action="size" data-value="75">Large</button>
              <button data-action="size" data-value="100">Full</button>
            </div>
            <div class="toolbar-section">
              <div class="section-label">ALIGNMENT</div>
              <button data-action="align" data-value="left">↰ Left</button>
              <button data-action="align" data-value="center">↕ Center</button>
              <button data-action="align" data-value="right">↱ Right</button>
              <button data-action="align" data-value="inline">⟷ Inline</button>
            </div>
          `;
          document.body.appendChild(toolbar);
          
          // Add click handlers to toolbar buttons
          toolbar.addEventListener('click', (e) => {
            const button = e.target as HTMLButtonElement;
            const action = button.dataset.action;
            const value = button.dataset.value;
            const selectedImg = document.querySelector('.ql-editor img.selected') as HTMLImageElement;
            
            if (selectedImg && action && value) {
              if (action === 'size') {
                // Handle size changes
                selectedImg.style.width = `${value}%`;
                selectedImg.style.height = 'auto';
              } else if (action === 'align') {
                // Remove all alignment classes
                selectedImg.classList.remove(
                  'float-left', 'float-right', 'center', 'inline'
                );
                
                // Reset special styles
                selectedImg.style.position = '';
                selectedImg.style.zIndex = '';
                selectedImg.style.opacity = '';
                selectedImg.style.filter = '';
                selectedImg.style.boxShadow = '';
                selectedImg.style.borderRadius = '';
                selectedImg.style.shapeOutside = '';
                
                // Add new alignment class and styles
                switch (value) {
                  case 'left':
                    selectedImg.classList.add('float-left');
                    break;
                  case 'right':
                    selectedImg.classList.add('float-right');
                    break;
                  case 'center':
                    selectedImg.classList.add('center');
                    break;
                  case 'inline':
                    selectedImg.classList.add('inline');
                    break;
                }
              }
            }
            // Don't hide toolbar immediately to allow multiple adjustments
            // toolbar.style.display = 'none';
          });
        }
        
        // Position toolbar near the image
        const rect = target.getBoundingClientRect();
        toolbar.style.display = 'block';
        toolbar.style.left = `${rect.left}px`;
        toolbar.style.top = `${rect.bottom + 5}px`;
      }
    };

    const handleClickOutside = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.ql-editor img') && !target.closest('.image-resize-toolbar')) {
        document.querySelectorAll('.ql-editor img.selected').forEach(img => {
          img.classList.remove('selected');
        });
        const toolbar = document.querySelector('.image-resize-toolbar') as HTMLElement;
        if (toolbar) {
          toolbar.style.display = 'none';
        }
      }
    };

    document.addEventListener('click', handleImageClick);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleImageClick);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [mounted]);

  // Custom image handler to upload images to server
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/files/upload-article-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          // Find the active Quill editor by looking for the focused editor
          const activeEditor = document.querySelector('.ql-editor:focus') || 
                              document.querySelector('.ql-editor');
          
          if (activeEditor) {
            // Look for the Quill instance in the parent elements
            let parent = activeEditor.parentElement;
            let quillInstance = null;
            
            while (parent && !quillInstance) {
              if ((parent as any).__quill) {
                quillInstance = (parent as any).__quill;
                break;
              }
              parent = parent.parentElement;
            }
            
            if (quillInstance) {
              const range = quillInstance.getSelection() || { index: 0, length: 0 };
              quillInstance.insertEmbed(range.index, 'image', result.data.url);
              quillInstance.setSelection(range.index + 1);
            }
          }
        } else {
          alert(`Upload failed: ${result.error?.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Image upload error:', error);
        alert('Failed to upload image. Please try again.');
      }
    };
  }, []);

  // Function to detect orphaned images and suggest cleanup
  const detectOrphanedImages = useCallback(async (content: string) => {
    try {
      const response = await fetch('/api/files/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      const result = await response.json();
      
      if (result.success && result.data.summary.orphanedFiles > 0) {
        // Show a subtle notification for cleanup suggestion
        console.log(`💡 Cleanup suggestion: ${result.data.summary.orphanedFiles} orphaned files found (${result.data.summary.potentialSavings} potential savings)`);
        
        // You can show a toast notification here or add to a cleanup queue
        // For now, we'll just log it
      }
    } catch (error) {
      console.error('Error checking orphaned files:', error);
    }
  }, []);

  // Monitor content changes to trigger cleanup detection
  const handleContentChange = useCallback((newValue: string) => {
    onChange(newValue);
    
    // Debounce the orphaned file detection
    const timeoutId = setTimeout(() => {
      detectOrphanedImages(newValue);
    }, 2000); // Check after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [onChange, detectOrphanedImages]);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
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
      handlers: {
        image: imageHandler
      }
    },
  }), [imageHandler]);

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
    <div className="rich-text-editor w-full">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleContentChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ 
          minHeight: minHeight,
          backgroundColor: 'white'
        }}
      />
    </div>
  );
}
