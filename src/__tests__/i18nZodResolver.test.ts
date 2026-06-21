import { describe, expect, it } from 'vitest';
import '@/i18n';
import i18n from '@/i18n';
import { loginFormSchema } from '@/schemas/auth.schema';
import { translateValidationMessage } from '@/lib/zodI18n';
import { i18nZodResolver } from '@/lib/i18nZodResolver';

describe('translateValidationMessage', () => {
  it('translates validation namespace keys in English', async () => {
    await i18n.changeLanguage('en');
    expect(translateValidationMessage('validation.passwordMin4')).toBe('Password must be at least 4 characters');
  });

  it('translates validation namespace keys in Arabic', async () => {
    await i18n.changeLanguage('ar');
    expect(translateValidationMessage('validation.passwordMin4')).toBe('يجب أن تكون كلمة المرور 4 أحرف على الأقل');
  });

  it('returns plain messages unchanged', async () => {
    await i18n.changeLanguage('en');
    expect(translateValidationMessage('Something else')).toBe('Something else');
  });
});

describe('i18nZodResolver', () => {
  it('translates schema validation keys for react-hook-form', async () => {
    await i18n.changeLanguage('en');
    const resolver = i18nZodResolver(loginFormSchema);
    const result = await resolver({ email: 'bad', password: 'ab' }, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    });
    expect(result.errors?.password?.message).toBe('Password must be at least 4 characters');
  });
});
