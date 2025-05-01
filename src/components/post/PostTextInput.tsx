
import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface PostTextInputProps {
  value: string;
  onChange: (text: string) => void;
}

const PostTextInput = ({ value, onChange }: PostTextInputProps) => {
  const [postText, setPostText] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ajusta a altura do textarea ao digitar
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostText(e.target.value);
    onChange(e.target.value);
    adjustTextareaHeight();
  };

  const handleTextareaFocus = () => {
    if (postText === 'O que você está pensando?' && textareaRef.current) {
      setPostText('');
      onChange('');
    }
  };

  const handleTextareaBlur = () => {
    if (postText.trim() === '' && textareaRef.current) {
      setPostText('O que você está pensando?');
      onChange('O que você está pensando?');
    }
  };

  // Ajusta a altura do textarea quando o componente é montado ou o texto muda
  useEffect(() => {
    adjustTextareaHeight();
  }, [postText]);

  return (
    <div className="mb-4">
      <Textarea
        ref={textareaRef}
        value={postText}
        onChange={handleTextChange}
        onFocus={handleTextareaFocus}
        onBlur={handleTextareaBlur}
        className="border-none resize-none focus-visible:ring-0 p-0 text-base min-h-0"
        style={{
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          lineHeight: '1.5',
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          overflow: 'hidden',
          textAlign: 'left',
          width: '100%',
          padding: '0',
          margin: '0',
          border: 'none',
          outline: 'none',
          boxShadow: 'none'
        }}
        placeholder="O que você está pensando?"
      />
    </div>
  );
};

export default PostTextInput;
