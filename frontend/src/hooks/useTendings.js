import { useEffect, useState } from 'react';
import { getMyTendings, getAllTendings, returnSpecimen, renewSpecimen, createTendingPenalty, createPayOrder, verifyPayment, waiveTendingPenalty } from '../util/tendingApi';
import { getSpecimen } from '../util/groveApi';
import { loadRazorpayScript } from '../util/razorpay';

export function useTendings(isAdmin) {
  const [tendings, setTendings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [error, setError] = useState('');
  const [returnError, setReturnError] = useState('');
  const [renewingId, setRenewingId] = useState(null);
  const [renewError, setRenewError] = useState('');
  const [payingPenaltyForTendingId, setPayingPenaltyForTendingId] = useState(null);
  const [payPenaltyError, setPayPenaltyError] = useState('');
  const [waivingPenaltyForTendingId, setWaivingPenaltyForTendingId] = useState(null);
  const [waivePenaltyError, setWaivePenaltyError] = useState('');

  const fetchTendings = async () => {
    setLoading(true);
    try {
      const res = isAdmin ? await getAllTendings() : await getMyTendings();
      const tendingsWithSpecimens = await Promise.all(
        (Array.isArray(res.data) ? res.data : []).map(async (tending) => {
          try {
            const specimenRes = await getSpecimen(tending.specimenId);
            return { ...tending, specimen: specimenRes.data };
          } catch {
            return { ...tending, specimen: null };
          }
        })
      );
      setTendings(tendingsWithSpecimens);
      setError('');
    } catch (err) {
      setError(err.response ? 'Something went wrong on our end.' : 'Cannot reach the server - check your network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTendings();
  }, [isAdmin]);

  const handleReturn = async (tendingId) => {
    setReturningId(tendingId);
    setReturnError('');
    try {
      await returnSpecimen(tendingId);
      await fetchTendings();
    } catch (err) {
      setReturnError(err.response?.data?.message || (err.response ? 'Something went wrong on our end.' : 'Cannot reach the server - check your network.'));
    } finally {
      setReturningId(null);
    }
  };

  // Server enforces MAX_RENEWALS (2); this just surfaces whatever message
  // it sends back (e.g. "reached the maximum of 2 renewals").
  const handleRenew = async (tendingId) => {
    setRenewingId(tendingId);
    setRenewError('');
    try {
      await renewSpecimen(tendingId);
      await fetchTendings();
    } catch (err) {
      setRenewError(err.response?.data?.message || (err.response ? 'Something went wrong on our end.' : 'Cannot reach the server - check your network.'));
    } finally {
      setRenewingId(null);
    }
  };

  const handlePayPenalty = async (tending) => {
    setPayingPenaltyForTendingId(tending.id);
    setPayPenaltyError('');
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPayPenaltyError('Could not load the payment window — check your connection and try again.');
        setPayingPenaltyForTendingId(null);
        return;
      }

      const { data: penalty } = await createTendingPenalty(tending.id);
      const { data } = await createPayOrder(penalty.id);

      const razorpayOptions = {
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,
        name: 'Mionchoillte Penalty Payment',
        description: `Late penalty for ${tending.specimen?.title ?? 'tending'}`,
        handler: async (response) => {
          try {
            await verifyPayment({
              penaltyId: penalty.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await fetchTendings();
          } catch (err) {
            setPayPenaltyError('Payment succeeded but verification failed — please contact support.');
          } finally {
            setPayingPenaltyForTendingId(null);
          }
        },
        modal: {
          ondismiss: () => setPayingPenaltyForTendingId(null),
        },
      };

      const razorpayInstance = new window.Razorpay(razorpayOptions);
      razorpayInstance.open();
    } catch (err) {
      setPayPenaltyError(err.response?.data?.message || 'Failed to start payment — please try again.');
      setPayingPenaltyForTendingId(null);
    }
  };

  // Curator-only: writes off a tending's penalty entirely, no payment involved.
  const handleWaivePenalty = async (tendingId) => {
    setWaivingPenaltyForTendingId(tendingId);
    setWaivePenaltyError('');
    try {
      await waiveTendingPenalty(tendingId);
      await fetchTendings();
    } catch (err) {
      setWaivePenaltyError(err.response?.data?.message || 'Failed to waive penalty — please try again.');
    } finally {
      setWaivingPenaltyForTendingId(null);
    }
  };

  const isOverdue = (tending) => !tending.returnedAt && new Date(tending.dueAt) < new Date();
  const totalPenaltiesOwed = tendings.reduce((sum, tending) => sum + (tending.penaltyAmount || 0), 0);

  return {
    tendings,
    loading,
    error,
    returnError,
    returningId,
    handleReturn,
    renewingId,
    renewError,
    handleRenew,
    isOverdue,
    totalPenaltiesOwed,
    handlePayPenalty,
    payingPenaltyForTendingId,
    payPenaltyError,
    handleWaivePenalty,
    waivingPenaltyForTendingId,
    waivePenaltyError,
  };
}
