import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Image Chat',
  description: 'Upload images and get AI-powered descriptions',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{
        backgroundColor: '#0d1117',
        color: '#c9d1d9',
        margin: 0,
        padding: 0,
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
        lineHeight: '1.5'
      }}>
        {children}
        
        {/* Global styles as inline style tag */}
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            a {
              color: #58a6ff;
              text-decoration: none;
            }
            
            button {
              cursor: pointer;
              font-family: inherit;
            }
            
            input, textarea, select {
              font-family: inherit;
            }
            
            ::-webkit-scrollbar {
              width: 10px;
            }
            
            ::-webkit-scrollbar-track {
              background: #161b22;
            }
            
            ::-webkit-scrollbar-thumb {
              background: #30363d;
              border-radius: 5px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
              background: #484f58;
            }
            
            @keyframes bounce {
              0%, 100% {
                transform: translateY(-25%);
                animation-timing-function: cubic-bezier(0.8,0,1,1);
              }
              50% {
                transform: translateY(0);
                animation-timing-function: cubic-bezier(0,0,0.2,1);
              }
            }
            
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `
        }} />
      </body>
    </html>
  );
}