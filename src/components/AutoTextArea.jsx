import React, { useRef, useEffect } from 'react';

const AutoTextArea = ({ value, onChange, placeholder, className, minHeight = "12rem", id, maxLength }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = minHeight; 
      const scrollHeight = textareaRef.current.scrollHeight;
      
      textareaRef.current.style.height = `${Math.max(scrollHeight, parseInt(minHeight))}px`;
      textareaRef.current.style.overflowY = "hidden";
    }
  }, [value, minHeight]);

  return (
    <div className="relative">
        <textarea
        id={id}
        ref={textareaRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        style={{ minHeight }}
        maxLength={maxLength}
        />
        {maxLength && (
            <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                {value.length} / {maxLength}
            </div>
        )}
    </div>
  );
};

export default AutoTextArea;
