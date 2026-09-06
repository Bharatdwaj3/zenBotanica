import { useEffect, useState } from 'react';
import { getMyFines, createPayOrder, verifyPayment } from '../util/circulationApi';
import { loadRazorpayScript } from '../util/razorpay';


export function useFines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState(null);
  const [payError, setPayError] = useState('');

  const fetchFines = async () => {
    setLoading(true);
    try {
      const res = await getMyFines();
      setFines(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      setError(err.response ? 'Something went wrong on our end.' : 'Cannot reach the server - check your network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const handlePay = async (fine) => {
    setPayingId(fine.id);
    setPayError('');
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPayError('Could not load the payment window — check your connection and try again.');
        setPayingId(null);
        return;
      }

      const { data } = await createPayOrder(fine.id);

      const razorpayOptions = {
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,
        name: 'Library Fine Payment',
        description: `${fine.reason} fine`,
        handler: async (response) => {
          try {
            await verifyPayment({
              fineId: fine.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await fetchFines();
          } catch (err) {
            setPayError('Payment succeeded but verification failed — please contact support.');
          } finally {
            setPayingId(null);
          }
        },
        modal: {
          ondismiss: () => setPayingId(null),
        },
      };

      const razorpayInstance = new window.Razorpay(razorpayOptions);
      razorpayInstance.open();
    } catch (err) {
      setPayError(err.response?.data?.message || 'Failed to start payment — please try again.');
      setPayingId(null);
    }
  };

  const totalUnpaid = fines.filter((f) => !f.paid).reduce((sum, f) => sum + f.amount, 0);

  return { fines, loading, error, payingId, payError, handlePay, totalUnpaid };
}
