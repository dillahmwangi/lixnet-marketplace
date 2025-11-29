import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Zap, X, AlertCircle, CheckCircle, RotateCcw, TrendingUp, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { router } from '@inertiajs/react';

interface SubscriptionTier {
  price: number;
  features: string;
}

interface Product {
  id: number;
  title: string;
  description: string;
  is_subscription: boolean;
  subscription_tiers: Record<string, SubscriptionTier> | null;
}

interface Subscription {
  id: number;
  product_id: number;
  tier: string;
  status: string;
  price: number;
  currency: string;
  subscription_reference: string;
  started_at: string;
  next_billing_date: string;
  renewal_reminded_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  product: Product;
}

interface SubscriptionsResponse {
  success: boolean;
  data: {
    data: Subscription[];
  };
}

export default function UserSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [upgradeModalId, setUpgradeModalId] = useState<number | null>(null);
  const [selectedNewTier, setSelectedNewTier] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscriptions', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }

      const data: SubscriptionsResponse = await response.json();
      setSubscriptions(data.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load your subscriptions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (id: number) => {
    try {
      setCancelingId(id);
      const response = await fetch(`/api/subscriptions/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          reason: cancelReason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      toast.success('Subscription cancelled successfully');
      setShowCancelModal(null);
      setCancelReason('');
      fetchSubscriptions();
    } catch (err) {
      toast.error('Failed to cancel subscription');
      console.error(err);
    } finally {
      setCancelingId(null);
    }
  };

  const handleUpgradeTier = async (id: number, newTier: string) => {
    try {
      const response = await fetch(`/api/subscriptions/${id}/change-tier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          tier: newTier,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to change subscription tier');
      }

      const data = await response.json();
      
      if (data.data?.payment_url) {
        toast.success('Redirecting to payment...');
        window.location.href = data.data.payment_url;
      } else {
        toast.success('Subscription tier changed successfully');
        fetchSubscriptions();
      }
      
      setUpgradeModalId(null);
      setSelectedNewTier(null);
    } catch (err) {
      toast.error('Failed to change subscription tier');
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilRenewal = (renewalDate: string) => {
    const today = new Date();
    const renewal = new Date(renewalDate);
    const diffTime = renewal.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const tierRanking = { free: 0, basic: 1, premium: 2 };
  const tierColors = { free: 'gray', basic: 'blue', premium: 'purple' };

  const getAvailableTiers = (currentTier: string, availableTiers: Record<string, SubscriptionTier> | null) => {
    if (!availableTiers) return [];
    const currentRank = tierRanking[currentTier as keyof typeof tierRanking] || 0;
    return Object.entries(availableTiers)
      .filter(([tier]) => tier !== currentTier)
      .map(([tier, data]) => ({
        tier,
        data,
        isUpgrade: (tierRanking[tier as keyof typeof tierRanking] || 0) > currentRank,
      }));
  };

  const activeSubscriptionsCount = subscriptions.filter(s => s.status === 'active').length;
  const totalSpend = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + parseFloat(s.price.toString()), 0)
    .toFixed(2);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() =>  window.history.back()}
            className="flex items-center gap-2 text-brand-blue mb-8 hover:text-dark-blue transition font-semibold"
          >
            <ArrowLeft size={20} />
            Back to Marketplace
          </button>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your subscriptions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <button
          onClick={() =>  window.history.back()}
          className="flex items-center gap-2 text-brand-blue mb-8 hover:text-dark-blue transition font-semibold"
        >
          <ArrowLeft size={20} />
          Back to Marketplace
        </button>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-blue mb-2">My Subscriptions</h1>
          <p className="text-gray-600 text-lg">Manage and track your active subscriptions</p>
        </div>

        {/* Stats Cards */}
        {subscriptions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-border-color p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Subscriptions</p>
                  <p className="text-3xl font-bold text-dark-blue mt-2">{activeSubscriptionsCount}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Heart className="text-brand-blue" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-border-color p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Monthly Spend</p>
                  <p className="text-3xl font-bold text-dark-blue mt-2">KES {totalSpend}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {subscriptions.length === 0 ? (
          <div className="bg-white border border-border-color rounded-lg p-12 text-center shadow-sm">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Active Subscriptions</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Start exploring our software solutions and choose a plan that works best for your business needs.</p>
            <button
              onClick={() => router.visit('/')}
              className="bg-brand-blue hover:bg-[#0052a3] text-white px-8 py-3 rounded-lg font-semibold transition inline-block"
            >
              Browse Plans
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
            {subscriptions.map((subscription) => {
              const daysLeft = getDaysUntilRenewal(subscription.next_billing_date);
              const availableTiers = getAvailableTiers(subscription.tier, subscription.product.subscription_tiers);
              const tierTitles: Record<string, string> = { free: 'Free', basic: 'Basic', premium: 'Premium' };
              const tierColor = tierColors[subscription.tier as keyof typeof tierColors] || 'gray';

              return (
                <div
                  key={subscription.id}
                  className="bg-white border border-border-color rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header with Status */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-dark-blue">{subscription.product.title}</h3>
                        <div className={`inline-block bg-${tierColor === 'blue' ? 'blue' : tierColor === 'purple' ? 'purple' : 'gray'}-100 text-${tierColor === 'blue' ? 'brand-blue' : tierColor === 'purple' ? 'purple' : 'gray'}-600 border border-${tierColor === 'blue' ? 'brand-blue' : tierColor === 'purple' ? 'purple' : 'gray'}-300 text-sm px-3 py-1 rounded-full font-semibold mt-2`}>
                          {tierTitles[subscription.tier]} Plan
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-brand-blue">
                          {subscription.currency} {subscription.price}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">/month</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-200">
                      {subscription.status === 'active' ? (
                        <>
                          <CheckCircle className="text-green-600" size={20} />
                          <span className="text-green-600 font-semibold">Active & Running</span>
                        </>
                      ) : (
                        <>
                          <X className="text-red-600" size={20} />
                          <span className="text-red-600 font-semibold">Cancelled</span>
                        </>
                      )}
                    </div>

                    {/* Subscription Details */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded">
                          <Calendar size={16} className="text-brand-blue" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 font-medium">Subscription Start Date</p>
                          <p className="font-semibold text-gray-800">{formatDate(subscription.started_at)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded">
                          <Clock size={16} className="text-brand-blue" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 font-medium">Next Renewal</p>
                          <div>
                            <p className="font-semibold text-gray-800">{formatDate(subscription.next_billing_date)}</p>
                            {subscription.status === 'active' && (
                              <p className="text-xs text-green-600 font-medium mt-1">
                                {daysLeft > 0 ? `Renews in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}` : 'Renews today'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {subscription.cancelled_at && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-red-800">
                            Cancelled on {formatDate(subscription.cancelled_at)}
                          </p>
                          {subscription.cancellation_reason && (
                            <p className="text-sm text-red-700 mt-2">{subscription.cancellation_reason}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Reference ID */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-6">
                      <p className="text-xs text-gray-600 font-medium">Reference ID</p>
                      <p className="text-sm font-mono text-gray-800 mt-1">{subscription.subscription_reference}</p>
                    </div>

                    {/* Action Buttons */}
                    {subscription.status === 'active' && (
                      <div className="flex flex-col gap-2">
                        {availableTiers.length > 0 && (
                          <button
                            onClick={() => setUpgradeModalId(subscription.id)}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
                          >
                            <RotateCcw size={18} />
                            Change Plan
                          </button>
                        )}
                        <button
                          onClick={() => setShowCancelModal(subscription.id)}
                          className="w-full border-2 border-red-500 text-red-600 hover:bg-red-50 font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
                        >
                          <X size={18} />
                          Cancel Subscription
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-border-color rounded-lg w-full max-w-md shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-dark-blue mb-2 text-center">Cancel Subscription?</h3>
              <p className="text-gray-600 mb-6 text-center">
                This action will end your subscription. You can resubscribe at any time.
              </p>

              <textarea
                placeholder="Tell us why you're cancelling (optional)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-sm focus:outline-none focus:border-brand-blue"
                rows={3}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(null);
                    setCancelReason('');
                  }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Keep Plan
                </button>
                <button
                  onClick={() => handleCancelSubscription(showCancelModal)}
                  disabled={cancelingId === showCancelModal}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {cancelingId === showCancelModal ? 'Cancelling...' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {upgradeModalId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-border-color rounded-lg w-full max-w-2xl my-8 shadow-xl">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-dark-blue mb-2">Change Your Plan</h3>
              <p className="text-gray-600 mb-6">Upgrade or downgrade your subscription tier</p>

              {subscriptions.find((s) => s.id === upgradeModalId)?.product.subscription_tiers && (
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {Object.entries(
                    subscriptions.find((s) => s.id === upgradeModalId)?.product.subscription_tiers || {}
                  ).map(([tier, tierData]) => {
                    const tierTitles: Record<string, string> = { free: 'Free', basic: 'Basic', premium: 'Premium' };
                    const isSelected = selectedNewTier === tier;
                    const currentSub = subscriptions.find((s) => s.id === upgradeModalId);
                    const isCurrentTier = tier === currentSub?.tier;

                    return (
                      <div
                        key={tier}
                        onClick={() => !isCurrentTier && setSelectedNewTier(tier)}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                          isSelected
                            ? 'border-brand-blue bg-blue-50 shadow-md'
                            : isCurrentTier
                            ? 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-60'
                            : 'border-gray-200 hover:border-brand-blue hover:shadow-sm'
                        }`}
                      >
                        <h4 className="font-bold text-dark-blue mb-2">{tierTitles[tier]}</h4>
                        <div className="text-2xl font-bold text-brand-blue mb-2">
                          KES {(tierData as any).price}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{(tierData as any).features}</p>
                        {isCurrentTier && (
                          <p className="text-xs text-gray-500 font-semibold italic">Current plan</p>
                        )}
                        {isSelected && !isCurrentTier && (
                          <p className="text-xs text-brand-blue font-semibold">✓ Selected</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setUpgradeModalId(null);
                    setSelectedNewTier(null);
                  }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedNewTier && handleUpgradeTier(upgradeModalId, selectedNewTier)}
                  disabled={!selectedNewTier}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2.5 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  Confirm Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}