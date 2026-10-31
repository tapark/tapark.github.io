const copyButtons = [...document.querySelectorAll('[data-copy-resume]')];
const copyFeedback = document.querySelector('#copy-feedback');

const cleanText = (element) => (element?.innerText ?? element?.textContent ?? '').replace(/\s+/g, ' ').trim();
const textFrom = (scope, selector) => cleanText(scope.querySelector(selector));
const markdownLink = (anchor) => `[${cleanText(anchor).replace(/\s*↗$/, '')}](${anchor.href})`;

function resumeAsMarkdown() {
  const projects = [...document.querySelectorAll('#work article.project')].map((project) => {
    const heading = textFrom(project, 'h3');
    const period = textFrom(project, '.project-meta > span:last-child');
    const summary = textFrom(project, '.project-summary');
    const details = [...project.querySelectorAll('.project-points li')].map((item) => `- ${cleanText(item)}`);
    const technologies = [...project.querySelectorAll('.tags span')].map(cleanText).join(', ');
    const links = [...project.querySelectorAll('a[href]')].map((anchor) => `- ${markdownLink(anchor)}`);
    const photo = project.querySelector('.project-photo img');

    return [
      `### ${heading}`,
      period,
      summary,
      details.join('\n'),
      `기술: ${technologies}`,
      ...(photo ? [`현장 사진: ${new URL(photo.getAttribute('src'), location.href).href}`] : []),
      ...(links.length ? [`관련 링크:\n${links.join('\n')}`] : []),
    ].join('\n\n');
  });

  const career = [...document.querySelectorAll('.timeline-row')].map((row) => {
    const date = textFrom(row, '.timeline-date');
    const title = textFrom(row, 'h3');
    const description = textFrom(row, 'p');
    const details = [...row.querySelectorAll('.career-points li')].map((item) => `- ${cleanText(item)}`);
    const links = [...row.querySelectorAll('a[href]')].map((anchor) => `- ${markdownLink(anchor)}`);
    return [`### ${title} (${date})`, description, ...(details.length ? [details.join('\n')] : []), ...(links.length ? [links.join('\n')] : [])].join('\n\n');
  });

  const skills = [...document.querySelectorAll('.skill-group')].map((group) =>
    `- **${textFrom(group, 'h3')}**: ${textFrom(group, 'p')}`,
  );

  const utilitySection = document.querySelector('#utilities');
  const utilityApps = [...utilitySection.querySelectorAll('.utility-app')].map((anchor) => `- ${markdownLink(anchor)}`);
  const contactDialog = document.querySelector('#contact-dialog');
  const highlights = [...document.querySelectorAll('.aside-item')].map((item) =>
    `- **${textFrom(item, 'strong')}**: ${textFrom(item, 'span')}`,
  );

  const profileLinks = [...document.querySelectorAll('.site-footer a[href^="https://"]')].map((anchor) =>
    `- ${markdownLink(anchor)}`,
  );

  return [
    '# 박태규 | Android Developer',
    textFrom(document, '.eyebrow'),
    `## ${textFrom(document, '#hero-title')}`,
    textFrom(document, '.hero-lead'),
    '## 한눈에 보는 경험',
    highlights.join('\n'),
    textFrom(document, '.aside-note'),
    `## ${textFrom(document, '.intro-band .section-kicker')}`,
    textFrom(document, '.intro-band-inner p'),
    `## ${textFrom(document, '#work .section-kicker')} · ${textFrom(document, '#work-title')}`,
    textFrom(document, '#work > .section-heading > p'),
    ...projects,
    `## ${textFrom(document, '#career-title')}`,
    textFrom(document, '#career .section-heading > p'),
    ...career,
    `## ${textFrom(document, '#skills-title')}`,
    ...skills,
    `## ${textFrom(utilitySection, '.section-kicker')} · ${textFrom(utilitySection, 'h2')}`,
    textFrom(utilitySection, '.section-heading > p'),
    utilityApps.join('\n'),
    '## 연락처 및 링크',
    textFrom(document, '.contact-inner p'),
    `- 휴대폰: ${textFrom(contactDialog, '.contact-phone strong')}`,
    `- 이메일: ${textFrom(contactDialog, '.contact-mail strong')}`,
    ...profileLinks,
    `- 이력서 웹사이트: ${location.origin}${location.pathname}`,
  ].join('\n\n').trim() + '\n';
}

async function writeToClipboard(value) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch { /* Use the selection fallback below. */ }
  }

  const field = document.createElement('textarea');
  field.value = value;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.left = '-9999px';
  document.body.append(field);
  field.select();
  const copied = document.execCommand('copy');
  field.remove();
  if (!copied) throw new Error('Clipboard copy failed');
}

let feedbackTimer;
function showFeedback(state, message) {
  copyButtons.forEach((button) => {
    button.dataset.state = state;
    button.querySelector('.copy-label-desktop').textContent = state === 'copied' ? '복사 완료' : '다시 시도';
    button.querySelector('.copy-label-mobile').textContent = state === 'copied' ? '복사 완료' : '다시 시도';
    button.setAttribute('aria-label', message);
  });
  copyFeedback.textContent = message;
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => {
    copyButtons.forEach((button) => {
      delete button.dataset.state;
      button.querySelector('.copy-label-desktop').textContent = 'Copy for LLM';
      button.querySelector('.copy-label-mobile').textContent = 'LLM 복사';
      button.setAttribute('aria-label', '이력서를 LLM용 Markdown으로 복사');
    });
    copyFeedback.textContent = '';
  }, 2500);
}

copyButtons.forEach((button) => button.addEventListener('click', async () => {
  copyButtons.forEach((copyButton) => { copyButton.disabled = true; });
  try {
    await writeToClipboard(resumeAsMarkdown());
    showFeedback('copied', '이력서 전체가 Markdown으로 복사됐습니다.');
  } catch {
    showFeedback('error', '복사에 실패했습니다. 다시 시도해 주세요.');
  } finally {
    copyButtons.forEach((copyButton) => { copyButton.disabled = false; });
  }
}));
