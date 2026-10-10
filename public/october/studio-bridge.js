(() => {
  const host = window.parent !== window ? window.parent.getPinpromptStudioHost?.() : null;
  if (!host) return;
  const valueKey = `pinprompt.studio.values.${host.user.id}`;
  let values = {};
  try { values = JSON.parse(localStorage.getItem(valueKey) || '{}'); } catch {}
  db.vals = values && typeof values === 'object' ? values : {};
  const mapPrompts = prompts => prompts.map(p => ({
    id: p.id, title: p.title, body: p.content || '',
    cat: ['image', 'video', 'text', 'music'].includes(p.type) ? p.type : 'text',
    model: p.model || (p.platforms || []).join(' / '),
    tags: [...new Set([...(p.taskTags || []), ...(p.effectTags || []), ...(p.tags || [])])],
    tips: p.tips || '', fav: !!p.favorite,
    version: (p.platforms || [])[0] || '通用版',
  }));
  const mapProjects = (projects, prompts) => projects.map(p => ({
    id: p.id, name: p.name, dot: p.color || '#E8508A',
    items: prompts.filter(prompt =>
      (prompt.projectIds || [prompt.projectId]).includes(p.id)
    ).map(prompt => prompt.id),
  }));
  window.pinpromptRefresh = (prompts, projects) => {
    const nextPrompts = mapPrompts(prompts), nextProjects = mapProjects(projects, prompts);
    if (JSON.stringify(db.prompts) === JSON.stringify(nextPrompts) &&
        JSON.stringify(db.projects) === JSON.stringify(nextProjects)) return;
    db.prompts = nextPrompts;
    db.projects = nextProjects;
    render();
    if ($('archive').open) {
      if (getPrompt(state.openId)) renderArchive();
      else $('archive').close();
    }
  };
  window.pinpromptRefresh(host.prompts, host.projects);
  const who = document.querySelector('.who');
  who.querySelector('b').textContent = host.user.name;
  who.querySelector('span').textContent = host.user.email || '';
  avatar.replaceChildren();
  avatar.textContent = (host.user.name || 'P').slice(0, 1).toUpperCase();
  avatar.style.fontSize = '24px';
  avatar.style.background = 'var(--yellow)';
  avatar.setAttribute('aria-label', `${host.user.name} · 账户菜单`);

  save = () => {
    try { localStorage.setItem(valueKey, JSON.stringify(db.vals)); } catch {}
    host.save({ prompts: db.prompts, projects: db.projects });
  };
  nextId = () => crypto.randomUUID();
  const originalCopy = copyPrompt;
  copyPrompt = async p => {
    if (!p) return;
    await originalCopy(p);
    if (state.copiedId === p.id) host.copy(p.id, assemble(p));
  };
  document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (link?.getAttribute('href') === 'https://pinprompt.art') {
      e.preventDefault(); host.home();
    }
    const action = e.target.closest('[data-act]')?.dataset.act;
    if (action === 'logout') {
      e.stopImmediatePropagation(); setMenu(false);
      confirmAsk('退出登录？', '收藏和项目会继续保存在你的账号中。', '退出登录')
        .then(ok => { if (ok) host.logout(); });
    }
    if (action === 'account-settings') {
      e.stopImmediatePropagation(); setMenu(false);
      toast(`${host.user.name} · ${host.user.email || '已登录'}`);
    }
  }, true);
  render();
})();
