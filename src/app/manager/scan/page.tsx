'use client';

import { useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';

export default function ManagerScan() {
    const [scanResult, setScanResult] = useState<any>(null);
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        // Check if user is logged in as Manager or Admin
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user.role !== 'Manager' && data.user.role !== 'Admin') {
                        alert('Access Denied: Managers only');
                        window.location.href = '/login';
                    }
                } else {
                    window.location.href = '/login';
                }
            } catch (error) {
                console.error('Auth check failed', error);
            }
        };
        checkAuth();
    }, []);

    useEffect(() => {
        if (scanning) {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
            );

            scanner.render(onScanSuccess, onScanFailure);

            return () => {
                scanner.clear().catch(error => console.error("Failed to clear scanner", error));
            };
        }
    }, [scanning]);

    const onScanSuccess = async (decodedText: string, decodedResult: any) => {
        // Handle the scanned code
        console.log(`Code matched = ${decodedText}`, decodedResult);

        try {
            const res = await fetch('/api/ticket/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrCodeData: decodedText }),
            });
            const data = await res.json();
            setScanResult(data);
        } catch (err) {
            console.error(err);
            setScanResult({ status: 'Error', message: 'Verification failed' });
        }
    };

    const onScanFailure = (error: any) => {
        // handle scan failure, usually better to ignore and keep scanning.
        // console.warn(`Code scan error = ${error}`);
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-card border border-border rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-foreground">QR Verification Portal</h1>

            {!scanning ? (
                <button
                    onClick={() => setScanning(true)}
                    className="w-full bg-primary text-primary-foreground p-2 rounded hover:bg-primary/90 mb-4"
                >
                    Start Scanning
                </button>
            ) : (
                <div id="reader" style={{ width: '500px' }}></div>
            )}

            {scanResult && (
                <div className={`mt-6 p-4 rounded text-center border ${scanResult.status === 'Valid' ? 'bg-green-900/20 text-green-400 border-green-900' :
                    scanResult.status === 'Already Scanned' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-900' :
                        'bg-red-900/20 text-red-400 border-red-900'
                    }`}>
                    <h2 className="text-xl font-bold">{scanResult.status}</h2>
                    <p>{scanResult.message}</p>
                    {scanResult.user && (
                        <div className="mt-2 text-sm">
                            <p>User: {scanResult.user.name}</p>
                            <p>Email: {scanResult.user.email}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
