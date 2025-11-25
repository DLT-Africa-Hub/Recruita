import { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';
import { sanitizeRichText } from '../../utils/richText';

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({
  label,
  value,
  onChange,
  required = false,
  error,
  placeholder,
  className = '',
}: RichTextEditorProps) => {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link'],
        ['clean'],
      ],
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = useMemo(
    () => [
      'header',
      'bold',
      'italic',
      'underline',
      'strike',
      'list',
      'bullet',
      'align',
      'link',
    ],
    []
  );

  const handleChange = (content: string) => {
    const sanitized = sanitizeRichText(content);
    onChange(sanitized);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-[#1C1C1C] text-[16px] font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        className={`rounded-xl border bg-white border-fade focus-within:ring-2 focus-within:ring-button focus-within:border-transparent transition-all overflow-hidden ${
          error ? 'border-red-500' : ''
        } ${className}`}
      >
        <ReactQuill
          theme="snow"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
        />
      </div>
      {error && (
        <p className="text-red-500 text-[14px] font-normal">{error}</p>
      )}
    </div>
  );
};

export default RichTextEditor;


