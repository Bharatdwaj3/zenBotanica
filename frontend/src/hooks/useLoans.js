import { useEffect, useState } from 'react';
import { getMyLoans, getAllLoans, returnBook, renewBook, createLoanFine, createPayOrder, verifyPayment, waiveLoanFine } from '../util/circulationApi';
import { getBook } from '../util/catalogApi';
import { loadRazorpayScript } from '../util/razorpay';

export function useLoans(isAdmin) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [error, setError] = useState('');
  const [returnError, setReturnError] = useState('');
  const [renewingId, setRenewingId] = useState(null);
  const [renewError, setRenewError] = useState('');
  const [payingFineForLoanId, setPayingFineForLoanId] = useState(null);
  const [payFineError, setPayFineError] = useState('');
  const [waivingFineForLoanId, setWaivingFineForLoanId] = useState(null);
  const [waiveFineError, setWaiveFineError] = useState('');

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = isAdmin ? await getAllLoans() : await getMyLoans();
      const loansWithBooks = await Promise.all(
        (Array.isArray(res.data) ? res.data : []).map(async (loan) => {
          try {
            const bookRes = await getBook(loan.bookId);
            return { ...loan, book: bookRes.data };
          } catch {
            return { ...loan, book: null };
          }
        })
      );
      setLoans(loansWithBooks);
      setError('');
    } catch (err) {
      setError(err.response ? 'Something went wrong on our end.' : 'Cannot reach the server - check your network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [isAdmin]);

  const handleReturn = async (loanId) => {
    setReturningId(loanId);
    setReturnError('');
    try {
      await returnBook(loanId);
      await fetchLoans();
    } catch (err) {
      setReturnError(err.response?.data?.message || (err.response ? 'Something went wrong on our end.' : 'Cannot reach the server - check your network.'));
    } finally {
      setReturningId(null);
    }
  };

  // Server enforces MAX_RENEWALS (2); this just surfaces whatever message
  // it sends back (e.g. "reached the maximum of 2 renewals").
  const handleRenew = async (loanId) => {
    setRenewingId(loanId);
    setRenewError('');
    try {
      await renewBook(loanId);
      await fetchLoans();
    } catch (err) {
      setRenewError(err.response?.data?.message || (err.response ? 'Something went wrong on our end.' : 'Cannot reach the server - check your network.'));
    } finally {
      setRenewingId(null);
    }
  };

  const handlePayFine = async (loan) => {
    setPayingFineForLoanId(loan.id);
    setPayFineError('');
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPayFineError('Could not load the payment window — check your connection and try again.');
        setPayingFineForLoanId(null);
        return;
      }

      const { data: fine } = await createLoanFine(loan.id);
      const { data } = await createPayOrder(fine.id);

      const razorpayOptions = {
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,
        name: 'Library Fine Payment',
        description: `Late fine for ${loan.book?.title ?? 'loan'}`,
        handler: async (response) => {
          try {
            await verifyPayment({
              fineId: fine.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await fetchLoans();
          } catch (err) {
            setPayFineError('Payment succeeded but verification failed — please contact support.');
          } finally {
            setPayingFineForLoanId(null);
          }
        },
        modal: {
          ondismiss: () => setPayingFineForLoanId(null),
        },
      };

      const razorpayInstance = new window.Razorpay(razorpayOptions);
      razorpayInstance.open();
    } catch (err) {
      setPayFineError(err.response?.data?.message || 'Failed to start payment — please try again.');
      setPayingFineForLoanId(null);
    }
  };

  // Admin-only: writes off a loan's fine entirely, no payment involved.
  const handleWaiveFine = async (loanId) => {
    setWaivingFineForLoanId(loanId);
    setWaiveFineError('');
    try {
      await waiveLoanFine(loanId);
      await fetchLoans();
    } catch (err) {
      setWaiveFineError(err.response?.data?.message || 'Failed to waive fine — please try again.');
    } finally {
      setWaivingFineForLoanId(null);
    }
  };

  const isOverdue = (loan) => !loan.returnedAt && new Date(loan.dueAt) < new Date();
  const totalFinesOwed = loans.reduce((sum, loan) => sum + (loan.fineAmount || 0), 0);

  return {
    loans,
    loading,
    error,
    returnError,
    returningId,
    handleReturn,
    renewingId,
    renewError,
    handleRenew,
    isOverdue,
    totalFinesOwed,
    handlePayFine,
    payingFineForLoanId,
    payFineError,
    handleWaiveFine,
    waivingFineForLoanId,
    waiveFineError,
  };
}
