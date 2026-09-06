import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getBook } from '../util/catalogApi';

const PdfViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await getBook(id);
        setBook(data);
      } catch (err) {
        console.error('Failed to load viewer:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-zinc-900">
        <Loader2 className="animate-spin text-white" size={48} />
      </div>
    );
  }

  if (!book || !book.pdfUrl) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-900 text-white">
        <p className="mb-4 text-zinc-400">PDF not available for this book.</p>
        <button onClick={() => navigate(-1)} className="text-primary hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-zinc-900">
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Exit Reader
        </button>
        <h2 className="text-white font-bold truncate max-w-md">{book.title}</h2>
        <div className="w-24" /> {/* Spacer */}
      </div>
      <iframe src={`${book.pdfUrl}#toolbar=0&navpanes=0`} className="flex-1 w-full border-none" title={book.title} />
    </div>
  );
};

export default PdfViewer;
