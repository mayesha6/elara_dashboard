import authReducer, { setUser, logout } from '@/redux/features/authSlice';

describe('authSlice reducer', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
  };

  it('should return initial state when passed empty action', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual({
      user: null,
      isAuthenticated: false,
    });
  });

  it('should handle setUser reducer', () => {
    const mockUser = {
      email: 'test@example.com',
      name: 'Test User',
      role: 'SUPER_ADMIN',
    };
    const nextState = authReducer(initialState, setUser({ user: mockUser }));

    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.user).toEqual(mockUser);
  });

  it('should handle logout reducer', () => {
    const loggedInState = {
      user: { email: 'test@example.com', role: 'USER' },
      isAuthenticated: true,
    };
    const nextState = authReducer(loggedInState, logout());

    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.user).toBeNull();
  });
});
