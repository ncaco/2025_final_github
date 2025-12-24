/**
 * 폼 검증 유틸리티
 */

/**
 * 이메일 검증
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 비밀번호 검증
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다.');
  }
  if (!/[A-Za-z]/.test(password)) {
    errors.push('비밀번호에 영문자가 포함되어야 합니다.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('비밀번호에 숫자가 포함되어야 합니다.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 전화번호 검증
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone.replace(/[-\s]/g, ''));
}

/**
 * 사용자명 검증
 */
export function validateUsername(username: string): {
  valid: boolean;
  error?: string;
} {
  if (username.length < 3) {
    return {
      valid: false,
      error: '사용자명은 최소 3자 이상이어야 합니다.',
    };
  }
  if (username.length > 100) {
    return {
      valid: false,
      error: '사용자명은 최대 100자까지 가능합니다.',
    };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      valid: false,
      error: '사용자명은 영문, 숫자, 언더스코어만 사용할 수 있습니다.',
    };
  }
  return { valid: true };
}

