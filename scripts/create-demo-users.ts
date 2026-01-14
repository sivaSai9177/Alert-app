#!/usr/bin/env bun
import { log } from '@/lib/core/logger';

const BASE_URL = 'http://localhost:8081';

async function createDemoUsers() {
  log.info('Creating healthcare demo users via API...', 'SETUP');
  
  const demoUsers = [
    {
      email: 'johncena@gmail.com',
      password: 'password123',
      name: 'John Operator',
    },
    {
      email: 'doremon@gmail.com',
      password: 'password123',
      name: 'Nurse Doremon',
    },
    {
      email: 'johndoe@gmail.com',
      password: 'password123',
      name: 'Dr. John Doe',
    },
    {
      email: 'saipramod273@gmail.com',
      password: 'password123',
      name: 'Dr. Saipramod (Head)',
    },
  ];
  
  for (const userData of demoUsers) {
    try {
      log.info(`Creating user ${userData.email}...`, 'SETUP');
      
      const response = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          name: userData.name,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        log.info(`Created user: ${userData.email}`, 'SETUP', data);
      } else {
        const error = await response.text();
        log.warn(`User might already exist: ${userData.email}`, 'SETUP', error);
      }
    } catch (error) {
      log.error(`Failed to create user ${userData.email}`, 'SETUP', error);
    }
  }
  
  log.info('Demo users creation completed!', 'SETUP');
  log.info('', 'SETUP');
  log.info('Demo User Credentials:', 'SETUP');
  log.info('=====================', 'SETUP');
  demoUsers.forEach(user => {
    log.info(`${user.email} / ${user.password}`, 'SETUP');
  });
  
  // Wait a moment to ensure server processes requests
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  process.exit(0);
}

// Run the script
createDemoUsers();