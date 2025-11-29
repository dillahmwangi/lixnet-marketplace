import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Zap, X, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';
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
      month: 'long',
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-brand-blue mb-6 hover:text-dark-blue transition font-semibold"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your subscriptions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-brand-blue mb-6 hover:text-dark-blue transition font-semibold"
      >
        <ArrowLeft size={20} />
        Back to Marketplace
      </button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-dark-blue mb-2">My Subscriptions</h1>
        <p className="text-gray-600">Manage your active subscriptions and plans</p>
      </div>

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
        <div className="bg-card-color border border-border-color rounded-lg p-8 text-center">
          <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Subscriptions</h3>
          <p className="text-gray-600 mb-6">You don't have any active subscriptions yet.</p>
          <button
            onClick={() => router.visit('/')}
            className="bg-brand-blue hover:bg-[#0052a3] text-white px-6 py-2 rounded font-semibold transition"
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

            return (
              <div
                key={subscription.id}
                className="bg-card-color border border-border-color rounded-lg hover:shadow-lg transition overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-dark-blue">{subscription.product.title}</h3>
                      <div className="inline-block bg-blue-100 text-brand-blue border border-brand-blue text-sm px-3 py-1 rounded mt-2">
                        {tierTitles[subscription.tier]} Plan
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-brand-blue">
                        {subscription.currency} {subscription.price}
                      </div>
                      <div className="text-xs text-gray-500">/month</div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 mb-4">
                    {subscription.status === 'active' ? (
                      <>
                        <CheckCircle className="text-green-600" size={20} />
                        <span className="text-green-600 font-semibold">Active</span>
                      </>
                    ) : (
                      <>
                        <X className="text-red-600" size={20} />
                        <span className="text-red-600 font-semibold">Cancelled</span>
                      </>
                    )}
                  </div>

                  {/* Subscription Details */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-border-color">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar size={18} className="text-brand-blue flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Started</p>
                        <p className="font-semibold">{formatDate(subscription.started_at)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                      <Clock size={18} className="text-brand-blue flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Renewal Date</p>
                        <p className="font-semibold">{formatDate(subscription.next_billing_date)}</p>
                        {subscription.status === 'active' && (
                          <p className="text-xs text-green-600 mt-1">
                            Renews in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    {subscription.cancelled_at && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-sm text-red-800">
                          <strong>Cancelled:</strong> {formatDate(subscription.cancelled_at)}
                        </p>
                        {subscription.cancellation_reason && (
                          <p className="text-sm text-red-700 mt-1">{subscription.cancellation_reason}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Reference */}
                  <div className="mb-6 text-xs text-gray-500 bg-gray-50 p-3 rounded">
                    <p><strong>Reference:</strong> {subscription.subscription_reference}</p>
                  </div>

                  {/* Action Buttons */}
                  {subscription.status === 'active' && (
                    <div className="flex flex-col gap-2">
                      {availableTiers.length > 0 && (
                        <button
                          onClick={() => setUpgradeModalId(subscription.id)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition flex items-center justify-center gap-2"
                        >
                          <RotateCcw size={18} />
                          Change Plan
                        </button>
                      )}
                      <button
                        onClick={() => setShowCancelModal(subscription.id)}
                        className="w-full border-2 border-red-500 text-red-600 hover:bg-red-50 font-semibold py-2 rounded transition flex items-center justify-center gap-2"
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

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card-color border border-border-color rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-dark-blue mb-4">Cancel Subscription?</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel this subscription? You can resubscribe anytime.
              </p>

              <textarea
                placeholder="Reason for cancellation (optional)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full border border-border-color rounded p-3 mb-4 text-sm"
                rows={3}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(null);
                    setCancelReason('');
                  }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-2 rounded font-semibold hover:bg-gray-50 transition"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={() => handleCancelSubscription(showCancelModal)}
                  disabled={cancelingId === showCancelModal}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold transition disabled:opacity-50"
                >
                  {cancelingId === showCancelModal ? 'Cancelling...' : 'Cancel Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {upgradeModalId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-card-color border border-border-color rounded-lg w-full max-w-2xl my-8">
            <div className="p-6">
              <h3 className="text-xl font-bold text-dark-blue mb-2">Change Plan</h3>
              <p className="text-gray-600 mb-6">Select a different plan for this subscription</p>

              {subscriptions.find((s) => s.id === upgradeModalId)?.product.subscription_tiers && (
                <div className="grid md:grid-cols-2 gap-4 mb-6">
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
                            ? 'border-brand-blue bg-blue-50'
                            : isCurrentTier
                            ? 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-60'
                            : 'border-border-color hover:border-brand-blue'
                        }`}
                      >
                        <h4 className="font-bold text-dark-blue mb-2">{tierTitles[tier]}</h4>
                        <div className="text-2xl font-bold text-brand-blue mb-2">
                          {(tierData as any).price}
                        </div>
                        <p className="text-sm text-gray-600">{(tierData as any).features}</p>
                        {isCurrentTier && (
                          <p className="text-xs text-gray-500 mt-2 italic">Current plan</p>
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
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-2 rounded font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedNewTier && handleUpgradeTier(upgradeModalId, selectedNewTier)}
                  disabled={!selectedNewTier}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition disabled:opacity-50"
                >
                  Change Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}