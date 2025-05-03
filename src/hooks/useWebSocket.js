import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const useWebSocket = (kdDisplay) => {
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const socketRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  
  // Fungsi untuk memulai polling sebagai fallback
  const startPolling = useCallback(() => {
    console.log("Starting fallback polling...");
    // Bersihkan interval polling yang mungkin sudah ada
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    // Mulai polling setiap 5 detik
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await axios.get(`/api/display/poli/${kdDisplay}`);
        console.log("Polling data received:", response.data);
        
        // Deteksi perubahan dibandingkan dengan lastMessage
        if (lastMessage) {
          response.data.forEach(poli => {
            if (poli.kd_ruang_poli === lastMessage.kd_ruang_poli && 
                poli.getPasien && 
                poli.getPasien.length > 0 &&
                poli.getPasien[0].no_reg !== lastMessage.no_reg) {
              // Ada perubahan, buat message baru
              setLastMessage({
                kd_display: kdDisplay,
                kd_ruang_poli: poli.kd_ruang_poli,
                nm_pasien: poli.getPasien[0].nm_pasien,
                no_reg: poli.getPasien[0].no_reg,
                nama_dokter: poli.getPasien[0].nama_dokter,
                jam_mulai: poli.getPasien[0].jam_mulai
              });
            }
          });
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 5000);
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [kdDisplay, lastMessage]);
  
  // Fungsi untuk membuat koneksi WebSocket dengan beberapa alternatif
  const createWebSocketConnection = useCallback(() => {
    if (!kdDisplay) return;
    
    // Reset status koneksi
    setConnectionStatus('connecting');
    
    // Fungsi untuk mencoba koneksi WebSocket dengan beberapa URL alternatif
    const attemptConnection = (urls) => {
      if (urls.length === 0 || reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.log("Semua upaya koneksi WebSocket gagal, beralih ke polling");
        setConnectionStatus('error');
        return startPolling();
      }
      
      reconnectAttemptsRef.current++;
      const currentUrl = urls[0];
      
      // Bersihkan socket yang mungkin sudah ada
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch (e) {
          console.error("Error closing existing socket:", e);
        }
        socketRef.current = null;
      }
      
      try {
        // Coba buat koneksi WebSocket
        const socket = new WebSocket(currentUrl);
        
        // Set timeout untuk koneksi
        const connectionTimeoutId = setTimeout(() => {
          if (socket.readyState !== WebSocket.OPEN) {
            socket.close();
            attemptConnection(urls.slice(1));
          }
        }, 5000);
        
        socket.onopen = () => {
          clearTimeout(connectionTimeoutId);
          console.log(`WebSocket connection established`);
          reconnectAttemptsRef.current = 0; // Reset upaya koneksi jika berhasil
          setConnectionStatus('connected');
          
          // Kirim pesan inisialisasi untuk memverifikasi koneksi
          try {
            const initMessage = JSON.stringify({ 
              type: 'INIT', 
              kdDisplay
            });
            socket.send(initMessage);
          } catch (error) {
            console.error('Error sending initialization message:', error);
          }
        };
        
        socket.onmessage = (event) => {
          try {
            // Periksa apakah pesan adalah string yang dapat di-parse sebagai JSON
            if (typeof event.data === 'string') {
              try {
                const data = JSON.parse(event.data);
                
                if (data.kd_display === kdDisplay || !data.kd_display) {
                  setLastMessage(data);
                }
              } catch (parseError) {
                console.warn('Message is not JSON:', event.data);
              }
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        };
        
        socket.onclose = (event) => {
          clearTimeout(connectionTimeoutId);
          
          setConnectionStatus('disconnected');
          
          // Jangan reconnect jika koneksi ditutup secara normal (kode 1000, 1001)
          const normalClosure = event.code === 1000 || event.code === 1001;
          
          // Coba hubungkan kembali setelah delay jika koneksi tidak ditutup secara normal
          if (!normalClosure && reconnectAttemptsRef.current < maxReconnectAttempts) {
            const delayMs = 5000 + (reconnectAttemptsRef.current * 1000); // Backoff strategy
            
            setTimeout(() => {
              // Coba koneksi alternatif jika koneksi gagal dengan kode tertentu
              if (event.code === 1006 || event.code === 1011 || event.code === 1012 || event.code === 1013) {
                // Koneksi gagal karena masalah jaringan atau server, coba URL alternatif
                attemptConnection(urls.slice(1));
              } else {
                // Coba lagi dengan URL yang sama untuk error lainnya
                attemptConnection([currentUrl, ...urls.slice(1)]);
              }
            }, delayMs);
          } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            startPolling(); // Beralih ke polling setelah semua upaya gagal
          }
        };
        
        socket.onerror = (error) => {
          console.error('WebSocket Error:', error);
        };
        
        socketRef.current = socket;
        return () => {
          clearTimeout(connectionTimeoutId);
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.close();
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        
        // Tunggu sebentar lalu coba URL alternatif
        setTimeout(() => {
          attemptConnection(urls.slice(1));
        }, 1000);
        return null;
      }
    };
    
    // Daftar URL untuk dicoba (berbagai kombinasi protokol dan host)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    // Urutan penting - coba koneksi langsung terlebih dahulu
    const urlsToTry = [
      // Koneksi langsung ke backend
      `ws://localhost:8080/ws/${kdDisplay}`,
      // Koneksi melalui IP lokal
      `ws://127.0.0.1:8080/ws/${kdDisplay}`,
      // Koneksi melalui proxy React
      `${protocol}//${host}/ws/${kdDisplay}`
    ];
    
    return attemptConnection(urlsToTry);
  }, [kdDisplay, startPolling, maxReconnectAttempts]);
  
  // Efek untuk mengelola koneksi WebSocket
  useEffect(() => {
    console.log("Initializing WebSocket connection to backend...");
    let cleanupFn;
    
    // Buat timeout yang sedikit lebih panjang untuk memberikan waktu pada koneksi
    const initTimeoutId = setTimeout(() => {
      cleanupFn = createWebSocketConnection();
    }, 500);
    
    // Mulai polling sebagai backup jika koneksi WebSocket gagal
    const pollingBackupTimer = setTimeout(() => {
      if (connectionStatus !== 'connected') {
        console.log("WebSocket tidak terhubung setelah beberapa saat, mulai polling sebagai backup");
        startPolling();
      }
    }, 15000); // Tunggu 15 detik, jika WebSocket masih belum terhubung, mulai polling
    
    // Cleanup ketika komponen unmount
    return () => {
      clearTimeout(initTimeoutId);
      
      if (typeof cleanupFn === 'function') {
        cleanupFn();
      }
      
      clearTimeout(pollingBackupTimer);
      
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch (e) {
          console.error("Error closing socket during cleanup:", e);
        }
      }
      
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [createWebSocketConnection, connectionStatus, startPolling]);
  
  return { lastMessage, connectionStatus };
};

export default useWebSocket;