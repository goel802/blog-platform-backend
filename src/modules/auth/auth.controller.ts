import * as service from './auth.service';


export const register = async (req: any, res: any) => {
const token = await service.registerUser(req.body);
res.json({ token });
};


export const login = async (req: any, res: any) => {
const token = await service.loginUser(req.body.email, req.body.password);
res.json({ token });
};