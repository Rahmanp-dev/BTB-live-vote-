'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function ManagerScan() {
    const [scanResult, setScanResult] = useState<any>(null);
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isScannerActive = useRef(false);

    useEffect(() => {
        // Check if user is logged in as Manager or Admin
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user.role !== 'Manager' && data.user.role !== 'Admin' && data.user.role !== 'SuperAdmin') {
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

        return () => {
            // Cleanup: Only stop if active
            if (scannerRef.current && isScannerActive.current) {
                scannerRef.current.stop().catch(err => console.warn('Scanner cleanup warning:', err));
            }
        };
    }, []);

    const startScanning = async () => {
        setError(null);
        setScanning(true);

        // If already active, don't start again
        if (isScannerActive.current) return;

        try {
            // Check for secure context
            if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                throw new Error('Camera access requires HTTPS or localhost. Please use a secure connection.');
            }

            // Initialize if not exists
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode("reader");
            }

            await scannerRef.current.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                onScanSuccess,
                onScanFailure
            );
            isScannerActive.current = true;
        } catch (err: any) {
            console.error("Error starting scanner:", err);
            setScanning(false);
            isScannerActive.current = false;

            if (err.name === 'NotAllowedError') {
                setError('Camera permission denied. Please allow camera access in your browser settings.');
            } else if (err.name === 'NotFoundError') {
                setError('No camera found on this device.');
            } else if (err.name === 'NotReadableError') {
                setError('Camera is currently in use by another application.');
            } else {
                setError(err.message || 'Failed to start camera.');
            }
        }
    };

    const stopScanning = async () => {
        if (scannerRef.current && isScannerActive.current) {
            try {
                await scannerRef.current.stop();
                isScannerActive.current = false;
                setScanning(false);
            } catch (err) {
                console.warn("Failed to stop scanner", err);
                // Even if it fails, assume it's stopped or invalid
                isScannerActive.current = false;
                setScanning(false);
            }
        } else {
            setScanning(false);
        }
    };

    const onScanSuccess = async (decodedText: string, decodedResult: any) => {
        // Pause scanning temporarily
        if (scannerRef.current && isScannerActive.current) {
            try {
                await scannerRef.current.pause();
            } catch (e) {
                console.warn("Failed to pause", e);
            }
        }

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
        } finally {
            // Stop scanning after success
            await stopScanning();
        }
    };

    const onScanFailure = (error: any) => {
        // console.warn(`Code scan error = ${error}`);
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-card border border-border rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-foreground">QR Verification Portal</h1>

            {error && (
                <div className="bg-red-900/20 border border-red-900 text-red-400 p-4 rounded mb-4">
                    {error}
                </div>
            )}

            <div id="reader" className="w-full bg-black rounded-lg overflow-hidden mb-4 min-h-[300px]"></div>

            {!scanning ? (
                <button
                    onClick={startScanning}
                    className="w-full bg-primary text-primary-foreground p-2 rounded hover:bg-primary/90 mb-4"
                >
                    {scanResult ? 'Scan Another' : 'Start Scanning'}
                </button>
            ) : (
                <button
                    onClick={stopScanning}
                    className="w-full bg-destructive text-destructive-foreground p-2 rounded hover:bg-destructive/90 mb-4"
                >
                    Stop Scanning
                </button>
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
