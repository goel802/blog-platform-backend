import { prisma } from '../../prisma/client';
import { hashPassword, comparePassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';


export const registerUser = async (data: any) => {
const hashed = await hashPassword(data.password);
const user = await prisma.user.create({
data: { ...data, password: hashed }
});
return signToken({ id: user.id, role: user.role });
};


export const loginUser = async (email: string, password: string) => {
const user = await prisma.user.findUnique({ where: { email } });
if (!user || !(await comparePassword(password, user.password))) {
throw new Error('Invalid credentials');
}
return signToken({ id: user.id, role: user.role });
};