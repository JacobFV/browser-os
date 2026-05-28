import React, { useState, useCallback } from 'react';
import './Slides.css';

export interface SlidesProps {
  windowId?: string;
  appId?: string;
  os?: any;
}

interface Slide {
  id: string;
  title: string;
  body: string;
  notes: string;
}

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `slide-${Date.now()}-${idCounter}`;
}

const SEED_SLIDES: Slide[] = [
  {
    id: nextId(),
    title: 'Quarterly Review',
    body: 'Q2 2026 Business Update\nPrepared by the Strategy Team',
    notes: 'Welcome everyone. Keep this intro short, about 30 seconds.',
  },
  {
    id: nextId(),
    title: 'Highlights',
    body: '• Revenue up 18% QoQ\n• Launched 3 new product lines\n• Customer NPS reached 62',
    notes: 'Emphasize the NPS jump — biggest win this quarter.',
  },
  {
    id: nextId(),
    title: 'Next Steps',
    body: '1. Expand into EU market\n2. Hire 5 engineers\n3. Ship the mobile app',
    notes: 'Open the floor for questions after this slide.',
  },
];

export const Slides: React.FC<SlidesProps> = () => {
  const [slides, setSlides] = useState<Slide[]>(SEED_SLIDES);
  const [activeIndex, setActiveIndex] = useState(0);

  const active = slides[activeIndex];

  const updateActive = useCallback(
    (patch: Partial<Slide>) => {
      setSlides((prev) =>
        prev.map((s, i) => (i === activeIndex ? { ...s, ...patch } : s))
      );
    },
    [activeIndex]
  );

  const addSlide = () => {
    const slide: Slide = {
      id: nextId(),
      title: 'New Slide',
      body: '',
      notes: '',
    };
    setSlides((prev) => {
      const next = [...prev, slide];
      setActiveIndex(next.length - 1);
      return next;
    });
  };

  const deleteSlide = (index: number) => {
    setSlides((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, i) => i !== index);
      setActiveIndex((cur) => Math.min(cur, next.length - 1));
      return next;
    });
  };

  return (
    <div className="slides">
      <aside className="slides-rail">
        <div className="slides-rail-header">
          <span>Slides</span>
          <button className="slides-add-btn" type="button" onClick={addSlide} title="Add slide">
            +
          </button>
        </div>
        <div className="slides-thumbs">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`slides-thumb ${i === activeIndex ? 'slides-thumb-active' : ''}`}
              onClick={() => setActiveIndex(i)}
            >
              <span className="slides-thumb-num">{i + 1}</span>
              <div className="slides-thumb-preview">
                <div className="slides-thumb-title">{slide.title || 'Untitled'}</div>
                <div className="slides-thumb-body">{slide.body}</div>
              </div>
              {slides.length > 1 && (
                <button
                  className="slides-thumb-del"
                  type="button"
                  title="Delete slide"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSlide(i);
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </aside>

      <main className="slides-main">
        <div className="slides-canvas-wrap">
          <div className="slides-canvas">
            <textarea
              className="slide-title-input"
              value={active.title}
              onChange={(e) => updateActive({ title: e.target.value })}
              placeholder="Click to add title"
              spellCheck={false}
              rows={1}
            />
            <textarea
              className="slide-body-input"
              value={active.body}
              onChange={(e) => updateActive({ body: e.target.value })}
              placeholder="Click to add text"
              spellCheck={false}
            />
          </div>
        </div>
        <div className="slides-notes">
          <label className="slides-notes-label">Speaker notes</label>
          <textarea
            className="slide-notes-input"
            value={active.notes}
            onChange={(e) => updateActive({ notes: e.target.value })}
            placeholder="Add notes for the current slide"
            spellCheck={false}
          />
        </div>
      </main>
    </div>
  );
};
