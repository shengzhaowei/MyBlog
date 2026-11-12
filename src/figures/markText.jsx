import React from 'react';

// 把正文里已经出现的词标出来（数字、专名）。不发明高亮规则以外的内容。
export function markText(text, terms) {
  if (typeof text !== 'string' || !terms || !terms.length) return text;
  const unique = [...new Set(terms.filter(Boolean))].sort((a, b) => b.length - a.length);
  if (!unique.length) return text;
  const pattern = unique.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const parts = text.split(new RegExp(`(${pattern})`, 'g'));
  if (parts.length === 1) return text;
  return parts.map((part, index) => (
    unique.includes(part)
      ? <span className="ed-fig-mark" key={`${part}-${index}`}>{part}</span>
      : part
  ));
}

export function asBlocks(body) {
  if (Array.isArray(body)) return body;
  if (body == null) return [];
  return [body];
}
