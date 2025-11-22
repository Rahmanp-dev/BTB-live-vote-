'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StallBooking() {
    const [stalls, setStalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchStalls();
    }, []);

    const fetchStalls = async () => {
        try {
            const res = await fetch('/api/stall/book');
            const data = await res.json();
            setStalls(data);
        } catch (error) {
            console.error('Error fetching stalls:', error);
        } finally {
            setLoading(false);
        }
    };

    const bookStall = async (stallId: string) => {
        // In a real app, we'd need the logged-in user's ID
        const userId = 'placeholder_user_id';

        try {
            const res = await fetch('/api/stall/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stallId, userId }),
            });

            if (res.ok) {
                alert('Stall booked successfully!');
                fetchStalls(); // Refresh list
            } else {
                const error = await res.json();
                alert(error.message);
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong');
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8 text-foreground">Stall Booking</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {stalls.map((stall: any) => (
                    <div key={stall._id} className={`p-4 rounded-lg border ${stall.status === 'Available' ? 'bg-card border-green-500/50' :
                        stall.status === 'Booked' ? 'bg-secondary border-border' :
                            'bg-yellow-900/10 border-yellow-500/50'
                        }`}>
                        <h3 className="font-bold text-lg text-foreground">{stall.name}</h3>
                        <p className="text-sm text-muted-foreground">{stall.category}</p>
                        <p className="text-lg font-semibold mt-2 text-foreground">₹{stall.price}</p>
                        <div className="mt-4">
                            {stall.status === 'Available' ? (
                                <button
                                    onClick={() => bookStall(stall._id)}
                                    className="w-full bg-primary text-primary-foreground p-2 rounded hover:bg-primary/90"
                                >
                                    Book Now
                                </button>
                            ) : (
                                <span className="block text-center text-muted-foreground font-medium">
                                    {stall.status}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
