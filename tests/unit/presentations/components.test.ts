/**
 * Phase D presentation components — structural + axe coverage:
 * SubjectVisual, PresentationMeta, TagRow, PresentationCard (ADR-0007
 * linked-card contract), ActionRow (TAD §24.5), LinkHealthAlert
 * (TAD §16.3).
 */
import { describe, expect, it } from 'vitest';

import ActionRow from '../../../src/features/presentations/components/ActionRow.astro';
import LinkHealthAlert from '../../../src/features/presentations/components/LinkHealthAlert.astro';
import PresentationCard from '../../../src/features/presentations/components/PresentationCard.astro';
import PresentationMeta from '../../../src/features/presentations/components/PresentationMeta.astro';
import SubjectVisual from '../../../src/features/presentations/components/SubjectVisual.astro';
import TagRow from '../../../src/features/presentations/components/TagRow.astro';
import { expectNoA11yViolations, parse, render } from '../helpers/render';

const cardProps = {
  slug: 'photosynthesis',
  title: 'Photosynthesis: How Plants Make Food',
  subject: 'Science',
  date: new Date('2026-08-01'),
  tags: ['biology', 'plants'],
};

describe('SubjectVisual', () => {
  it('renders a decorative gradient block with the subject gradient', async () => {
    const html = await render(SubjectVisual, { props: { subject: 'Science', height: 120 } });
    const root = parse(html);
    const block = root.querySelector('.subject-visual') as HTMLElement;
    expect(block.getAttribute('aria-hidden')).toBe('true');
    expect(block.getAttribute('data-subject')).toBe('Science');
    expect(block.getAttribute('style')).toContain('var(--color-success-100)');
    expect(block.getAttribute('style')).toContain('height:120px');
  });

  it('supports the detail shape and height', async () => {
    const html = await render(SubjectVisual, {
      props: { subject: 'History', height: 240, shape: 'detail' },
    });
    const block = parse(html).querySelector('.subject-visual');
    expect(block?.className).toContain('subject-visual--detail');
    expect(block?.getAttribute('style')).toContain('height:240px');
  });
});

describe('PresentationMeta', () => {
  it('renders subject pill and formatted date with a time element', async () => {
    const html = await render(PresentationMeta, {
      props: { subject: 'Science', date: new Date('2026-08-01'), size: 'card' },
    });
    const root = parse(html);
    expect(root.textContent).toContain('Science');
    const time = root.querySelector('time');
    expect(time?.getAttribute('datetime')).toBe('2026-08-01');
    expect(time?.textContent).toMatch(/2026/); // en-IN medium format
  });
});

describe('TagRow', () => {
  it('shows up to five tags without an overflow pill', async () => {
    const html = await render(TagRow, {
      props: { tags: ['a', 'b', 'c', 'd', 'e'] },
    });
    const root = parse(html);
    expect(root.querySelectorAll('li')).toHaveLength(5);
    expect(root.textContent).not.toContain('more');
  });

  it('collapses to four tags + "+N more" when there are more than five', async () => {
    const html = await render(TagRow, {
      props: { tags: ['a', 'b', 'c', 'd', 'e', 'f'] },
    });
    const root = parse(html);
    expect(root.querySelectorAll('li')).toHaveLength(5); // 4 tags + pill
    expect(root.querySelector('.tag-row__more')?.textContent?.trim()).toBe('+2 more');
  });

  it('renders every tag when overflow is disabled (detail page)', async () => {
    const html = await render(TagRow, {
      props: { tags: ['a', 'b', 'c', 'd', 'e', 'f', 'g'], overflow: false },
    });
    expect(parse(html).querySelectorAll('li')).toHaveLength(7);
  });
});

describe('PresentationCard (ADR-0007 linked-card pattern)', () => {
  it('has exactly one anchor, wrapping the title', async () => {
    const html = await render(PresentationCard, { props: cardProps });
    const root = parse(html);
    const anchors = root.querySelectorAll('a');
    expect(anchors).toHaveLength(1);
    const anchor = anchors[0];
    expect(anchor.getAttribute('href')).toBe('/presentations/photosynthesis');
    expect(anchor.textContent).toContain('Photosynthesis: How Plants Make Food');
    expect(anchor.className).toContain('card__link');
  });

  it('keeps the anchor inside the h3 heading (title is the accessible name)', async () => {
    const root = parse(await render(PresentationCard, { props: cardProps }));
    const heading = root.querySelector('h3.card__title');
    expect(heading?.querySelector('a')).not.toBeNull();
  });

  it('contains no nested interactive elements', async () => {
    const root = parse(await render(PresentationCard, { props: cardProps }));
    expect(root.querySelectorAll('button')).toHaveLength(0);
    expect(root.querySelectorAll('a')).toHaveLength(1);
  });

  it('renders meta and tags and is axe-clean', async () => {
    const html = await render(PresentationCard, { props: cardProps });
    const root = parse(html);
    expect(root.querySelector('.meta')).not.toBeNull();
    expect(root.querySelector('.tag-row')).not.toBeNull();
    await expectNoA11yViolations(html);
  });
});

describe('ActionRow (TAD §24.5 / §16.4)', () => {
  it('renders Present as a real external anchor with subtitle inside', async () => {
    const html = await render(ActionRow, {
      props: {
        presentUrl: 'https://docs.google.com/presentation/d/x/present',
        backupUrl: 'https://www.dropbox.com/s/x/y?dl=0',
      },
    });
    const root = parse(html);
    const present = root.querySelector('a[href*="docs.google.com"]');
    expect(present).not.toBeNull();
    expect(present?.getAttribute('target')).toBe('_blank');
    expect(present?.getAttribute('rel')).toBe('noopener noreferrer');
    // Subtitle inside the anchor — part of the accessible name.
    expect(present?.textContent).toContain('Present');
    expect(present?.textContent).toContain('Opens in Google Slides');
    await expectNoA11yViolations(html);
  });

  it('renders the backup as a secondary external link', async () => {
    const root = parse(
      await render(ActionRow, {
        props: {
          presentUrl: 'https://docs.google.com/presentation/d/x/present',
          backupUrl: 'https://www.dropbox.com/s/x/y?dl=0',
        },
      }),
    );
    const backup = root.querySelector('a[href*="dropbox.com"]');
    expect(backup?.textContent).toContain('Open Backup (Dropbox)');
    expect(backup?.getAttribute('target')).toBe('_blank');
    expect(backup?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('omits the backup without error when no Dropbox URL exists', async () => {
    const root = parse(
      await render(ActionRow, {
        props: { presentUrl: 'https://docs.google.com/presentation/d/x/present' },
      }),
    );
    expect(root.querySelectorAll('a')).toHaveLength(1);
    expect(root.textContent).not.toContain('Dropbox');
  });

  it('disables Present and promotes the backup when Slides are unreachable', async () => {
    const root = parse(
      await render(ActionRow, {
        props: {
          presentUrl: 'https://docs.google.com/presentation/d/x/present',
          backupUrl: 'https://www.dropbox.com/s/x/y?dl=0',
          slidesDown: true,
        },
      }),
    );
    const disabled = root.querySelector('button[disabled]');
    expect(disabled).not.toBeNull();
    expect(disabled?.textContent).toContain('Present');
    // Backup promoted to primary styling.
    const backup = root.querySelector('a[href*="dropbox.com"]');
    expect(backup?.className).toContain('btn--primary');
  });
});

describe('LinkHealthAlert (TAD §16.3)', () => {
  it('warns when Slides are unreachable', async () => {
    const html = await render(LinkHealthAlert, {
      props: { linkHealth: { slides: 'unreachable', dropbox: 'ok' } },
    });
    const root = parse(html);
    expect(root.textContent).toContain('Presentation unavailable');
    expect(root.querySelector('[role="status"]')).not.toBeNull();
    await expectNoA11yViolations(html);
  });

  it('warns subtly when only the backup is unreachable', async () => {
    const root = parse(
      await render(LinkHealthAlert, {
        props: { linkHealth: { slides: 'ok', dropbox: 'unreachable' } },
      }),
    );
    expect(root.textContent).toContain('Backup may be unavailable');
  });

  it('escalates to an error alert when both are unreachable', async () => {
    const root = parse(
      await render(LinkHealthAlert, {
        props: { linkHealth: { slides: 'unreachable', dropbox: 'unreachable' } },
      }),
    );
    expect(root.querySelector('[role="alert"]')).not.toBeNull();
    expect(root.textContent).toContain('Both presentation links');
  });

  it('renders nothing for healthy or unknown links', async () => {
    for (const linkHealth of [
      { slides: 'ok', dropbox: 'ok' },
      { slides: 'unknown', dropbox: 'unknown' },
      { slides: 'ok', dropbox: 'absent' },
    ]) {
      const html = await render(LinkHealthAlert, { props: { linkHealth } });
      expect(parse(html).querySelector('[role]')).toBeNull();
    }
  });
});
