export const testIds = {
  loginForm: 'login-form',
  loginEmail: 'login-email',
  loginPassword: 'login-password',
  loginSubmit: 'login-submit',
  signOut: 'sign-out',
  langEn: 'lang-en',
  langAr: 'lang-ar',
  listSearch: 'list-search',
  navLink: (path: string) => `nav-${path.replace(/^\//, '').replace(/\//g, '-') || 'home'}`,
} as const;
