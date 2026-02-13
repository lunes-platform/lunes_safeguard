import { useId, useState } from 'react';

export type AccordionItem = {
  id: string;
  question: string;
  answer: string;
};

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
      {items.map((item) => (
        <AccordionRow
          key={item.id}
          item={item}
          open={openId === item.id}
          onToggle={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
        />
      ))}
    </div>
  );
}

function AccordionRow({ item, open, onToggle }: { item: AccordionItem; open: boolean; onToggle: () => void }) {
  const buttonId = useId();
  const panelId = `${buttonId}-panel`;

  return (
    <div>
      <h3>
        <button
          id={buttonId}
          aria-controls={panelId}
          aria-expanded={open}
          onClick={onToggle}
          className="w-full text-left px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center justify-between"
        >
          <span className="font-medium text-neutral-900">{item.question}</span>
          <span className="ml-4 text-neutral-400">{open ? '-' : '+'}</span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`px-4 pb-4 text-neutral-600 ${open ? 'block' : 'hidden'}`}
      >
        {item.answer}
      </div>
    </div>
  );
}

export default Accordion;
