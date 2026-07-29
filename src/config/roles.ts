const allRoles = {
  user: ['common', 'user'],
  employee: ['common', 'employee'],
  admin: ['common', 'admin'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

export { roles, roleRights };
