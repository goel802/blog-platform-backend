export const allowRoles = (roles:string[]) => (req:any, res:any, next:any) => {
  roles.includes(req.user.role) ? next() : res.status(403).json({ message: "Forbidden" });
}