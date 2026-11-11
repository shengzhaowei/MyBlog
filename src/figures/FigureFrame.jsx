import React, { useId } from 'react';

export function FigureFrame({ title, caption, className = '', children }) {
  const titleId = useId();
  return (
    <figure
      className={`ed-figure ${className}`.trim()}
      aria-labelledby={title ? titleId : undefined}
    >
      {title ? (
        <p className="ed-figure-title" id={titleId}>{title}</p>
      ) : null}
      {children}
      {caption ? <figcaption className="ed-figure-caption">{caption}</figcaption> : null}
    </figure>
  );
}

export function DataTable({ summary = '数据表', defaultOpen = false, children }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (defaultOpen && ref.current) ref.current.open = true;
  }, [defaultOpen]);

  return (
    <details className="ed-fig-data" ref={ref}>
      <summary>{summary}</summary>
      <div className="ed-fig-table-wrap">{children}</div>
    </details>
  );
}

export function LiveStatus({ id, children }) {
  return (
    <div id={id} className="ed-sr-only" aria-live="polite">
      {children}
    </div>
  );
}
