import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import ngrok from '@ngrok/ngrok'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ngrokPlugin() {
  return {
    name: 'ngrok-plugin',
    configureServer(server) {
      server.httpServer?.once('listening', async () => {
        const address = server.httpServer.address();
        const port = typeof address === 'object' ? address.port : 5173;
        
        let authtoken = '';
        let domain = '';
        try {
          const configPath = path.resolve(__dirname, 'src/ngrok-config.json');
          if (fs.existsSync(configPath)) {
            const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (configData.authtoken && configData.authtoken !== 'YOUR_NGROK_AUTHTOKEN_HERE') {
              authtoken = configData.authtoken.trim();
            }
            if (configData.domain) {
              domain = configData.domain.trim();
            }
          }
        } catch (e) {
          console.error('[TUNNEL] Could not read ngrok-config.json:', e);
        }

        if (!authtoken) {
          console.log('\n==================================================');
          console.log('⚠️  [TUNNEL] NGROK AUTHTOKEN NOT CONFIGURED!');
          console.log('👉 Please paste your authtoken in src/ngrok-config.json');
          console.log('👉 Fallback: Running local-only mode (same Wi-Fi required).');
          console.log('==================================================\n');
          
          try {
            fs.writeFileSync(
              path.resolve(__dirname, 'src/tunnel.json'),
              JSON.stringify({ url: "" }, null, 2)
            );
          } catch (e) { void e; }
          return;
        }

        // Check if there is an active tunnel with the same configuration to reuse
        const existing = globalThis.__ngrok__;
        if (
          existing &&
          existing.port === port &&
          existing.authtoken === authtoken &&
          existing.domain === domain
        ) {
          console.log(`\n==================================================`);
          console.log(`🚀 [TUNNEL] REUSING PUBLIC BATTLE TUNNEL ACTIVE!`);
          console.log(`👉 Access URL: ${existing.url}`);
          console.log(`💡 Note: Tunnel is reused across reloads.`);
          console.log(`==================================================\n`);
          
          try {
            fs.writeFileSync(
              path.resolve(__dirname, 'src/tunnel.json'),
              JSON.stringify({ url: existing.url }, null, 2)
            );
          } catch (e) { void e; }
          return;
        }

        // Close any mismatched active tunnel/session before opening a new one
        if (existing) {
          console.log('[TUNNEL] Configuration changed, closing existing tunnel...');
          try {
            if (existing.tunnel) await existing.tunnel.close();
            if (existing.session) await existing.session.close();
          } catch (e) {
            console.error('[TUNNEL] Error closing existing tunnel/session:', e);
          }
          globalThis.__ngrok__ = null;
        }

        console.log(`\n[TUNNEL] Establishing secure Ngrok tunnel for port ${port}...`);
        try {
          const session = await new ngrok.SessionBuilder()
            .authtoken(authtoken)
            .connect();
          
          let endpoint = session.httpEndpoint();
          if (domain) {
            endpoint = endpoint.domain(domain);
          }
          
          const ngrokTunnel = await endpoint.listenAndForward(`http://localhost:${port}`);
          const url = ngrokTunnel.url();
          
          console.log(`\n==================================================`);
          console.log(`🚀 [TUNNEL] PUBLIC BATTLE TUNNEL ACTIVE!`);
          console.log(`👉 Access URL: ${url}`);
          console.log(`💡 Note: Protected by Ngrok. ISP-friendly with zero browser blocks!`);
          console.log(`==================================================\n`);

          fs.writeFileSync(
            path.resolve(__dirname, 'src/tunnel.json'),
            JSON.stringify({ url }, null, 2)
          );

          // Save the configuration and references globally
          globalThis.__ngrok__ = {
            session,
            tunnel: ngrokTunnel,
            url,
            port,
            authtoken,
            domain
          };

          const cleanup = async () => {
            const current = globalThis.__ngrok__;
            if (current) {
              try {
                if (current.tunnel) await current.tunnel.close();
              } catch (e) { void e; }
              try {
                if (current.session) await current.session.close();
              } catch (e) { void e; }
              globalThis.__ngrok__ = null;
            }
            try {
              fs.writeFileSync(
                path.resolve(__dirname, 'src/tunnel.json'),
                JSON.stringify({ url: "" }, null, 2)
              );
            } catch (e) { void e; }
          };

          const syncCleanup = () => {
            try {
              fs.writeFileSync(
                path.resolve(__dirname, 'src/tunnel.json'),
                JSON.stringify({ url: "" }, null, 2)
              );
            } catch (e) { void e; }
          };

          // Register lifecycle handlers once
          if (!globalThis.__ngrok_handlers_registered__) {
            process.on('SIGINT', async () => {
              await cleanup();
              process.exit(0);
            });
            process.on('exit', syncCleanup);
            globalThis.__ngrok_handlers_registered__ = true;
          }

        } catch (err) {
          console.error('[TUNNEL] Failed to establish Ngrok tunnel:', err);
          try {
            fs.writeFileSync(
              path.resolve(__dirname, 'src/tunnel.json'),
              JSON.stringify({ url: "" }, null, 2)
            );
          } catch (e) { void e; }
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), ngrokPlugin()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('docx')) {
              return 'vendor-docx';
            }
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('canvg') || id.includes('jspdf-autotable')) {
              return 'vendor-pdf';
            }
            if (id.includes('xlsx') || id.includes('cpexcel') || id.includes('wmf')) {
              return 'vendor-xlsx';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('socket.io-client')) {
              return 'vendor-socket';
            }
            return 'vendor-misc';
          }
        }
      }
    }
  },
  server: {
    open: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
      }
    }
  }
})