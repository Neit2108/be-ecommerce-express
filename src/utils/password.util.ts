import bcrypt from 'bcryptjs';

export class PasswordUtils {
  private static readonly SALT_ROUNDS = 12;

  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async verify(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static validateStrength(password: string): {
    isValid: boolean;
    errors: string[];
    score: number;
  } {
    const errors: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      errors.push('Password must be at least 8 characters long');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      errors.push('Password must contain at least one number');
    }

    // Special character check
    if (/[@$!%*?&]/.test(password)) {
      score += 1;
    } else {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      score
    };
  }
}