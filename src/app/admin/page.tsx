'use client';

import { useState, useEffect } from 'react';

type InfluencerCoupon = {
  _id: string;
  code: string;
  discountAmount: number;
  usageLimit: number | null;
  usedCount: number;
  expiryDate: Date | null;
  isActive: boolean;
};

export default function AdminDashboard() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<InfluencerCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [showCollegeForm, setShowCollegeForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountAmount: 200,
    usageLimit: null as number | null,
    expiryDate: ''
  });
  const [newCollege, setNewCollege] = useState({
    name: '',
    couponCode: '',
    discountAmount: 200
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [collegesRes, usersRes, couponsRes] = await Promise.all([
        fetch('/api/admin/college'),
        fetch('/api/admin/reports?type=master'),
        fetch('/api/admin/coupon')
      ]);

      // Handle colleges response
      if (collegesRes.ok) {
        const collegesData = await collegesRes.json();
        setColleges(Array.isArray(collegesData) ? collegesData : []);
      } else {
        console.error('Failed to fetch colleges:', collegesRes.status);
        setColleges([]);
      }

      // Handle users response
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
      } else {
        console.error('Failed to fetch users:', usersRes.status);
        setUsers([]);
      }

      // Handle coupons response
      if (couponsRes.ok) {
        const couponsData = await couponsRes.json();
        setCoupons(couponsData.data || []);
      } else {
        console.error('Failed to fetch coupons:', couponsRes.status);
        setCoupons([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set defaults on error
      setColleges([]);
      setUsers([]);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (type: string, format: 'csv' | 'excel', collegeId?: string) => {
    window.open(`/api/admin/reports?type=${type}&format=${format}${collegeId ? `&collegeId=${collegeId}` : ''}`, '_blank');
  };

  const createCoupon = async () => {
    try {
      const res = await fetch('/api/admin/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon)
      });

      if (res.ok) {
        alert('Coupon created successfully!');
        setShowCouponForm(false);
        setNewCoupon({ code: '', discountAmount: 200, usageLimit: null, expiryDate: '' });
        fetchData();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
    }
  };

  const toggleCoupon = async (id: string, isActive: boolean) => {
    try {
      await fetch('/api/admin/coupon', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !isActive })
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling coupon:', error);
    }
  };

  const createCollege = async () => {
    try {
      const res = await fetch('/api/admin/college', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCollege)
      });

      if (res.ok) {
        alert('College created successfully!');
        setShowCollegeForm(false);
        setNewCollege({ name: '', couponCode: '', discountAmount: 200 });
        fetchData();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating college:', error);
      alert('Failed to create college');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-card border border-border p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Reports</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2 text-muted-foreground">Master Report</h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => downloadReport('master', 'csv')} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 text-sm">
                  Export CSV
                </button>
                <button onClick={() => downloadReport('master', 'excel')} className="bg-green-600 text-white p-2 rounded hover:bg-green-700 text-sm">
                  Export Excel
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2 text-muted-foreground">College Summary</h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => downloadReport('college', 'csv')} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 text-sm">
                  Export CSV
                </button>
                <button onClick={() => downloadReport('college', 'excel')} className="bg-green-600 text-white p-2 rounded hover:bg-green-700 text-sm">
                  Export Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Stats</h2>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">Total Colleges: <span className="font-bold text-foreground">{colleges.length}</span></p>
            <p className="text-muted-foreground">Total Registrations: <span className="font-bold text-foreground">{users.length || 0}</span></p>
            <p className="text-muted-foreground">Active Coupons: <span className="font-bold text-foreground">{coupons.filter(c => c.isActive).length}</span></p>
          </div>
        </div>
      </div>

      {/* Influencer Coupon Management */}
      <div className="bg-card border border-border p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-foreground">Influencer Coupons</h2>
          <button
            onClick={() => setShowCouponForm(!showCouponForm)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            {showCouponForm ? 'Cancel' : '+ Create Coupon'}
          </button>
        </div>

        {showCouponForm && (
          <div className="bg-secondary/20 p-4 rounded-lg mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Coupon Code</label>
                <input
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full bg-secondary border-input text-foreground p-2 rounded border"
                  placeholder="INF2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Discount Amount (₹)</label>
                <input
                  type="number"
                  value={newCoupon.discountAmount}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountAmount: parseInt(e.target.value) })}
                  className="w-full bg-secondary border-input text-foreground p-2 rounded border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Usage Limit (optional)</label>
                <input
                  type="number"
                  value={newCoupon.usageLimit || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full bg-secondary border-input text-foreground p-2 rounded border"
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Expiry Date (optional)</label>
                <input
                  type="date"
                  value={newCoupon.expiryDate}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                  className="w-full bg-secondary border-input text-foreground p-2 rounded border"
                />
              </div>
            </div>
            <button
              onClick={createCoupon}
              className="w-full bg-primary text-primary-foreground p-2 rounded hover:bg-primary/90"
            >
              Create Coupon
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="text-left">
                <th className="p-2 text-foreground">Code</th>
                <th className="p-2 text-foreground">Discount</th>
                <th className="p-2 text-foreground">Usage</th>
                <th className="p-2 text-foreground">Expiry</th>
                <th className="p-2 text-foreground">Status</th>
                <th className="p-2 text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="border-b border-border">
                  <td className="p-2 font-mono text-foreground">{coupon.code}</td>
                  <td className="p-2 text-foreground">₹{coupon.discountAmount}</td>
                  <td className="p-2 text-muted-foreground">
                    {coupon.usedCount} / {coupon.usageLimit || '∞'}
                  </td>
                  <td className="p-2 text-muted-foreground">
                    {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'No expiry'}
                  </td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${coupon.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => toggleCoupon(coupon._id, coupon.isActive)}
                      className="text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded hover:bg-secondary/80"
                    >
                      {coupon.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No coupons created yet</p>
          )}
        </div>
      </div>

      {/* Colleges Management */}
      <div className="bg-card border border-border p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-foreground">Colleges</h2>
          <button
            onClick={() => setShowCollegeForm(!showCollegeForm)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            {showCollegeForm ? 'Cancel' : '+ Add College'}
          </button>
        </div>

        {showCollegeForm && (
          <div className="bg-muted/50 p-4 rounded-lg mb-4 space-y-3">
            <input
              type="text"
              placeholder="College Name"
              value={newCollege.name}
              onChange={(e) => setNewCollege({ ...newCollege, name: e.target.value })}
              className="w-full p-2 border border-border rounded bg-background text-foreground"
            />
            <input
              type="text"
              placeholder="Coupon Code (e.g., COLLEGE2024)"
              value={newCollege.couponCode}
              onChange={(e) => setNewCollege({ ...newCollege, couponCode: e.target.value.toUpperCase() })}
              className="w-full p-2 border border-border rounded bg-background text-foreground font-mono"
            />
            <input
              type="number"
              placeholder="Discount Amount (₹)"
              value={newCollege.discountAmount}
              onChange={(e) => setNewCollege({ ...newCollege, discountAmount: parseInt(e.target.value) || 0 })}
              className="w-full p-2 border border-border rounded bg-background text-foreground"
            />
            <button
              onClick={createCollege}
              className="w-full bg-primary text-primary-foreground p-2 rounded hover:bg-primary/90"
            >
              Create College
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="text-left">
                <th className="p-2 text-foreground">Name</th>
                <th className="p-2 text-foreground">Code</th>
                <th className="p-2 text-foreground">Discount</th>
                <th className="p-2 text-foreground">Earnings</th>
                <th className="p-2 text-foreground">Registrations</th>
              </tr>
            </thead>
            <tbody>
              {colleges.map((college: any) => (
                <tr key={college._id} className="border-b border-border">
                  <td className="p-2 text-foreground">{college.name}</td>
                  <td className="p-2 font-mono text-muted-foreground">{college.code}</td>
                  <td className="p-2 text-foreground">₹{college.discountAmount}</td>
                  <td className="p-2 text-green-500">₹{college.earnings || 0}</td>
                  <td className="p-2 text-muted-foreground">{college.registrations || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
