// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  }),
  useSegments: () => [],
  useFocusEffect: jest.fn(),
  Link: ({ children }) => children,
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

// Mock expo modules
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        apiUrl: 'http://localhost:8081',
      },
    },
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// React Native is mocked via moduleNameMapping in jest.config.js

// Mock Better Auth
const mockAuthClient = {
  useSession: jest.fn(() => ({
    data: null,
    isPending: false,
    refetch: jest.fn(),
  })),
  signIn: {
    email: jest.fn(),
  },
  signOut: jest.fn(),
  $fetch: jest.fn(),
  getCookie: jest.fn(),
};

jest.mock('@/lib/auth/auth-client', () => ({
  authClient: mockAuthClient,
}));

// Mock tRPC
jest.mock('@/lib/trpc', () => ({
  TRPCProvider: ({ children }) => children,
  api: {
    createClient: jest.fn(),
    Provider: ({ children }) => children,
  },
  trpc: {
    auth: {
      getSession: {
        useQuery: jest.fn(),
      },
    },
  },
}));

// Mock alert utility
jest.mock('@/lib/core/alert', () => ({
  showErrorAlert: jest.fn(),
  showSuccessAlert: jest.fn(),
}));

// Mock database for server tests
jest.mock('@/src/db', () => ({
  db: {
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockResolvedValue({}),
    }),
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([{
          id: 'test-id',
          checksum: 'mock-checksum',
        }]),
      }),
    }),
  },
}));

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mock-id'),
}));

// Global test utilities
global.mockAuthClient = mockAuthClient;
global.jest = jest;

// Polyfill jest for global usage
if (typeof global !== 'undefined') {
  global.jest = jest;
}

// Silence console warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('Warning:')) {
    return;
  }
  originalWarn(...args);
};