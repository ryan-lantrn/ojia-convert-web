const bcrypt = require('bcryptjs');
const { prisma } = require('./prisma');

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

async function createUser(email, password, name) {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  return { id: user.id, email: user.email, name: user.name };
}

async function authenticateUser(email, password) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await verifyPassword(password, user.password);
  
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  return { id: user.id, email: user.email, name: user.name };
}

module.exports = {
  hashPassword,
  verifyPassword,
  createUser,
  authenticateUser
};