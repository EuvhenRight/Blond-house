// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.ADMIN_EMAIL = 'admin@test.com'
process.env.ADMIN_PASSWORD = 'test-password'
process.env.RESEND_API_KEY = 'test-resend-key'
process.env.RESEND_FROM_EMAIL = 'test@test.com'
process.env.ADMIN_EMAIL_NOTIFICATION = 'admin@test.com'

// Mock Firebase
jest.mock('./app/lib/firebase/config', () => ({
	db: {},
	app: {},
}))

