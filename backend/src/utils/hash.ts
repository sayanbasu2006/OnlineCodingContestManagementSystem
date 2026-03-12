import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password
 */
export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(password, salt);
};

/**
 * Compare a plain text password with a hashed password
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate a salt for hashing
 */
export const generateSalt = async (): Promise<string> => {
    return bcrypt.genSalt(SALT_ROUNDS);
};
