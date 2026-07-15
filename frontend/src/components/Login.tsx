import React, { useEffect } from 'react'

export default function Login(): React.JSX.Element {
    useEffect(() => {
        const originalMargin = document.body.style.margin
        const originalPadding = document.body.style.padding
        const originalBgColor = document.body.style.backgroundColor

        document.body.style.margin = '0'
        document.body.style.padding = '0'
        document.body.style.backgroundColor = '#0f172a'

        return () => {
            document.body.style.margin = originalMargin
            document.body.style.padding = originalPadding
            document.body.style.backgroundColor = originalBgColor
        }
    }, [])

    const handleLogin = (): void => {
        window.location.href = 'https://devpulse-1-pxvk.onrender.com/api/v1/auth/login'
    }

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            width: '100vw',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            fontFamily: 'sans-serif',
            boxSizing: 'border-box'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '32px',
                backgroundColor: '#1e293b',
                borderRadius: '16px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                textAlign: 'center',
                border: '1px solid #334155',
                boxSizing: 'border-box'
            }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    marginBottom: '8px',
                    letterSpacing: '-0.5px'
                }}>Welcome to DevPulse</h1>

                <p style={{
                    color: '#94a3b8',
                    fontSize: '15px',
                    marginBottom: '32px'
                }}>Track your repository metrics seamlessly</p>

                <button
                    onClick={handleLogin}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        fontWeight: '600',
                        fontSize: '16px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.15)',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                >
                    <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    Sign in with GitHub
                </button>
            </div>
        </div>
    )
}