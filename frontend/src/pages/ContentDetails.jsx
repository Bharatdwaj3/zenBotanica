import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, SpecimenOpen, Building2, Hash, Tag, Copy, FileText, Specimenmark } from 'lucide-react';
import { getSpecimen, getSimilarSpecimens } from '../util/groveApi';
import { borrowSpecimen as borrowSpecimenRequest } from '../util/tendingApi';
import { toggleSpecimenmark } from '../store/bookmarkSlice';
import SimilarSpecimensRow from '../components/SimilarSpecimensRow';

const ContentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const bookmarkedSpecimens = useSelector((state) => state.bookmark.books);
  const { user } = useSelector((state) => state.avatar);
  const isAdmin = user?.role === 'admin';
  const [book, setSpecimen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [borrowMessage, setBorrowMessage] = useState('');
  const [error, setError] = useState('');
  const [similarByAuthor, setSimilarByAuthor] = useState([]);
  const [similarByGenre, setSimilarByGenre] = useState([]);

  const isSpecimenmarked = book ? bookmarkedSpecimens.some((b) => b.id === book.id) : false;

  useEffect(() => {
    const fetchSpecimen = async () => {
      try {
        const { data } = await getSpecimen(id);
        setSpecimen(data);
        getSimilarSpecimens(id).then((res) => {
          setSimilarByAuthor(res.data.byAuthor || []);
          setSimilarByGenre(res.data.byGenre || []);
        }).catch(() => {
          setSimilarByAuthor([]);
          setSimilarByGenre([]);
        });
      } catch {
        setError('Failed to load book details');
      } finally {
        setLoading(false);
      }
    };
    fetchSpecimen();
  }, [id]);

  const handleBorrow = async () => {
    setBorrowing(true);
    setBorrowMessage('');
    try {
      await borrowSpecimenRequest({ bookId: Number(id) });
      setBorrowMessage('Specimen borrowed successfully!');
      const { data } = await getSpecimen(id);
      setSpecimen(data);
    } catch (err) {
      setBorrowMessage(err.response?.data?.message || 'Failed to borrow book');
    } finally {
      setBorrowing(false);
    }
  };

  const handleToggleSpecimenmark = () => {
    dispatch(toggleSpecimenmark({ id: book.id, title: book.title, author: book.author, coverUrl: book.coverUrl }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Specimen not found'}</p>
          <button onClick={() => navigate(-1)} className="text-primary hover:underline flex items-center gap-2">
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-foreground/60 hover:text-foreground mb-8 transition-colors">
          <ArrowLeft size={20} /> Back to Catalog
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-border shadow-2xl bg-card">
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <SpecimenOpen size={64} className="text-foreground/10" />
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-8 flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-4xl font-black tracking-tight">{book.title}</h1>
              <button onClick={handleToggleSpecimenmark} aria-label={isSpecimenmarked ? 'Remove bookmark' : 'Add bookmark'} className="shrink-0 p-2 rounded-xl border border-border hover:bg-foreground/5 transition-all">
                <Specimenmark size={22} className={isSpecimenmarked ? 'fill-primary text-primary' : 'text-foreground/60'} />
              </button>
            </div>
            <p className="text-xl text-foreground/60 mb-6 font-medium">{book.author}</p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-4 text-foreground/70">
                <div className="flex items-center gap-3"><Building2 size={18} /><span>{book.publisher}</span></div>
                <div className="flex items-center gap-3"><Hash size={18} /><span>ISBN: {book.isbn}</span></div>
              </div>
              <div className="space-y-4 text-foreground/70">
                <div className="flex items-center gap-3"><Tag size={18} />
                  <div className="flex flex-wrap gap-1">
                    {book.genre.map(g => <span key={g} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{g.replace('_', ' ')}</span>)}
                  </div>
                </div>
                <div className="flex items-center gap-3"><Copy size={18} /><span>{book.availableCopies} of {book.totalCopies} copies available</span></div>
              </div>
            </div>

            {book.description && (
              <p className="text-foreground/70 leading-relaxed mb-8">{book.description}</p>
            )}

            <div className="flex flex-wrap gap-4 mt-auto pt-8 border-t border-border">
              {isAdmin ? (
                <button onClick={() => navigate(`/staff/new?edit=${id}`)} className="btn-primary">
                  Edit Specimen
                </button>
              ) : (
                <button onClick={handleBorrow} disabled={borrowing || book.availableCopies === 0} className="btn-primary disabled:opacity-50">
                  {borrowing ? 'Borrowing...' : 'Borrow Specimen'}
                </button>
              )}

              {book.pdfUrl && (
                <button onClick={() => navigate(`/read/${id}`)} className="btn-outline">
                  <FileText size={20} /> Read Now
                </button>
              )}
            </div>
            {borrowMessage && <p className={`mt-4 text-sm font-medium ${borrowMessage.includes('success') ? 'text-green-500' : 'text-red-500'}`}>{borrowMessage}</p>}
          </div>
        </div>
        <SimilarSpecimensRow title="More by this author" books={similarByAuthor} />
        <SimilarSpecimensRow title="More in this genre" books={similarByGenre} />
      </div>
    </div>
  );
};

export default ContentDetails;
